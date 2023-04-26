import express from 'express';
import { NotFoundError, ErrorHandlerMiddleware } from 'irolegroup';
import { telegramRouter } from './telegram';

const router = express.Router();

router.use('/telegram', telegramRouter);

// Error 404
router.all('*', () => {
    throw new NotFoundError();
});
router.use(ErrorHandlerMiddleware);

export { router };
