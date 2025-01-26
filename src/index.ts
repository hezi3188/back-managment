import express, { Application } from 'express';
import { errorMiddleware } from './middelwares/errorMiddelware';
import loggerMiddleware from 'middelwares/loggerMiddelware';
import { connectToMongoDB } from 'configs/mongodbConfig';
import configs from 'configs';

configs();

const app: Application = express();

app.use(express.json());
app.use(loggerMiddleware);
connectToMongoDB();

app.get('/health', (req, res) => {
    res.send('Helthy');
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

export default app;
