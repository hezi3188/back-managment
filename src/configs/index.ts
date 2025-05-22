import { configDotenv } from 'dotenv';
import { connectToMongoDB } from './mongodbConfig';
import { connectRedis } from './redisConfig';

const configs = () => {
    configDotenv();
    connectToMongoDB();
    connectRedis();
};

export default configs;
