import { Request, Response, NextFunction } from 'express';
import { AppError } from '../classes/AppError';

export const errorMiddleware = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
    console.log(err);
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
    });
};
