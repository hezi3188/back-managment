import { Request, Response, NextFunction } from 'express';

const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const { method, url } = req;
    const startTime = Date.now();

    // Log the incoming request details
    console.log(`[${new Date().toLocaleString('en-IL', { timeZone: 'Asia/Jerusalem' })}] ${method} ${url}`);

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`Request to ${method} ${url} completed in ${duration}ms with status ${res.statusCode}`);
    });

    next();
};

export default loggerMiddleware;
