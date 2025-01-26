import { Category } from 'enums/category';
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: Object.values(Category), required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async (value: string) => {
                const user = await mongoose.model('User').findById(value);
                return !!user;
            },
            message: 'User does not exist',
        },
    },
});
const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
