import { configDotenv } from 'dotenv';
import mongoose from 'mongoose';

configDotenv();
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cardb.p01pyly.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority&appName=CarDB`;

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            serverApi: {
                version: '1',
                strict: true,
                deprecationErrors: true,
            },
        });
        console.log('Successfully connected to MongoDB Atlas!');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

export { connectToMongoDB };
