import { configDotenv } from 'dotenv';
import { connectToMongoDB } from './mongodbConfig';

const configs = () => {
    configDotenv();
    connectToMongoDB();
};

export default configs;
