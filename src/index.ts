import express, { Application } from 'express';
import cors from 'cors';
import { errorMiddleware } from './middelwares/errorMiddelware';
import loggerMiddleware from 'middelwares/loggerMiddelware';
import configs from 'configs';
import authRouter from 'routes/authRouter';
import cookieParser from 'cookie-parser';

configs();

const app: Application = express();

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());
app.use(loggerMiddleware);

app.use('/auth', authRouter);

app.get('/health', (req, res) => {
    res.send('Helthy');
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

export default app;
