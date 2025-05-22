import { Request, Response, NextFunction } from 'express';
import { AppError } from '../classes/AppError';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';

export const errorMiddleware = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
    console.log(`Error: ${err.message}`);
    if (err instanceof ZodError) {
        res.status(StatusCodes.BAD_REQUEST).json({
            errors: err.errors.map((err) => ({
                path: err.path.join('.'),
                message: err.message,
            })),
        });
    }
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
    });
};
