import { configDotenv } from 'dotenv';
import express, { Application } from 'express';
import { errorMiddleware } from './middelwares/errorMiddelware';
import { StatusCodes } from 'http-status-codes';
import loggerMiddleware from 'middelwares/loggerMiddelware';
import { AppError } from 'classes/AppError';

configDotenv();
const app: Application = express();

// Middleware
app.use(express.json());
app.use(loggerMiddleware);

// Routes
app.get('/error', (req, res) => {
    throw new AppError('This is an error message', StatusCodes.NOT_FOUND);
});

app.get('/health', (req, res) => {
    res.send('Server is up and running');
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

export default app;
