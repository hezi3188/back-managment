import { AppError } from 'classes/AppError';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getAllUsers } from 'services/userService';

exports.getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        throw new AppError('Error while fetching users', StatusCodes.INTERNAL_SERVER_ERROR); //check this
    }
};
