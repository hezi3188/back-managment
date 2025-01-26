import { AppError } from 'classes/AppError';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getAllExpense } from 'services/expenseService';

exports.getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await getAllExpense();
        res.json(users);
    } catch (error) {
        throw new AppError('Error while fetching expenses', StatusCodes.INTERNAL_SERVER_ERROR); //check this
    }
};
