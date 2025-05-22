import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
//TODO: check it
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        // If you want to attach it to req, you can do something like:
        (req as any).decodedUser = decoded;

        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
