import express from 'express';
import mainController from '../../controllers/Main.controller';

const router = express.Router();

router.get('/', mainController.main);

export { router as telegramRouter };
