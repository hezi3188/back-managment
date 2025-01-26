import Expense from 'models/expense';

export const getAllExpense = async () => {
    return await Expense.find({});
};
