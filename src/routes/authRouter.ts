import { Request, Response, Router } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from 'models/user';
import { StatusCodes } from 'http-status-codes';
import { validateRequest } from 'middelwares/validateMiddelware';
import { signupSchema } from 'schemas/signupSchema';
import { AppError } from 'classes/AppError';
import { redisClient } from 'configs/redisConfig';
import { setRefreshTokenCookie } from 'utils/cookiesUtils';
import { loginSchema } from 'schemas/loginSchema';

const JWT_SECRET: Secret = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET!;

const generateTokens = (userId: string) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '20m' });
    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

const storeTokens = async (userId: string, accessToken: string, refreshToken: string) => {
    await redisClient.set(`accessToken:${userId}`, accessToken, { EX: 20 * 60 });
    await redisClient.set(`refreshToken:${userId}`, refreshToken, { EX: 7 * 24 * 60 * 60 });
};

const authRouter = Router();

authRouter.post('/signup', validateRequest(signupSchema), async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            name,
            password: hashedPassword,
        });
        await newUser.save();

        const userId = newUser._id.toString();
        const { accessToken, refreshToken } = generateTokens(userId);
        await storeTokens(userId, accessToken, refreshToken);

        setRefreshTokenCookie(res, refreshToken);

        return res.status(StatusCodes.CREATED).json({ accessToken });
    } catch (err: any) {
        throw new AppError(err, StatusCodes.INTERNAL_SERVER_ERROR);
    }
});

authRouter.post('/logout', async (req: Request, res: Response): Promise<any> => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No refresh token provided' });
        }

        let userId: string;
        try {
            const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
            userId = payload.userId;
        } catch {
            res.clearCookie('refreshToken', { path: '/' });
            return res.status(StatusCodes.OK).json({ message: 'Logged out' });
        }

        await redisClient.del(`accessToken:${userId}`);
        await redisClient.del(`refreshToken:${userId}`);

        res.clearCookie('refreshToken', { path: '/' });

        return res.status(StatusCodes.OK).json({ message: 'Logged out' });
    } catch (err: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Logout failed' });
    }
});

authRouter.post('/login', validateRequest(loginSchema), async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }
        const userId = user._id.toString();
        const { accessToken, refreshToken } = generateTokens(userId);
        await storeTokens(userId, accessToken, refreshToken);

        setRefreshTokenCookie(res, refreshToken);

        return res.status(StatusCodes.OK).json({ accessToken });
    } catch (err: any) {
        throw new AppError(err, StatusCodes.INTERNAL_SERVER_ERROR);
    }
});

authRouter.post('/refresh', async (req: Request, res: Response): Promise<any> => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Refresh token is required' });
    }

    try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
        const userId = payload.userId;

        const storedRefreshToken = await redisClient.get(`refreshToken:${userId}`);
        if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid refresh token' });
        }

        await redisClient.del(`accessToken:${userId}`);
        await redisClient.del(`refreshToken:${userId}`);

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(userId);

        await storeTokens(userId, newAccessToken, newRefreshToken);

        setRefreshTokenCookie(res, newRefreshToken);

        return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired refresh token' });
    }
});

export default authRouter;
