import express from 'express';
import { NotFoundError, ErrorHandlerMiddleware } from 'irolegroup';
import mainController from '../controllers/Main.controller';

const router = express.Router();

router.get('/', mainController.main);
router.get('/stream', mainController.stream);

// Error 404
router.all('*', () => {
    throw new NotFoundError();
});
router.use(ErrorHandlerMiddleware);

export { router };
