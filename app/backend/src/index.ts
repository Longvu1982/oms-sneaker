import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authorRouter from './routes/author.router';
import bookRouter from './routes/book.router';
import authRouter from './routes/auth.router';
import profileRouter from './routes/profile.router';
import orderRouter from './routes/order.router';
import userRouter from './routes/user.router';
import sourceRouter from './routes/source.router';
import shippingStoreRouter from './routes/shippingStore.router';
import { notFoundHandler } from './middleware/not-found';
import { errorHandler } from './middleware/error-handler';
import cookieParser from 'cookie-parser';
import requestLogger from './middleware/requestLogger';
import { pino } from 'pino';

dotenv.config();

export const logger = pino({ name: 'server start' });
const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();

// CORS Middleware
const corsOptions = {
  // origin: process.env.APP_ENV == 'developement' ? '*' : process.env.ORIGIN,
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// JSON Middleware & Form Data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(process.env.APP_ENV);

// cookie parser middleware
app.use(cookieParser());

// Request Logger
app.use(requestLogger);

// Main Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/authors', authorRouter);
app.use('/api/books', bookRouter);
app.use('/api/orders', orderRouter);
app.use('/api/users', userRouter);
app.use('/api/sources', sourceRouter);
app.use('/api/shippingStores', shippingStoreRouter);

// Not Found Middleware
app.use(notFoundHandler);

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Listening on PORT ${PORT}`);
});
