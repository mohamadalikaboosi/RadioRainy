import express from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import config from './config';

global.Config = config;

import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';

import { router } from './api/routes';
import { morganMiddleware } from './config/logger';
import rateLimit from 'express-rate-limit';

export class App {
    public app;

    constructor() {
        this.app = express();
        this.setConfig();
        this.setRoutes();
    }

    setConfig() {
        if (process.env.NODE_ENV !== 'test') {
            this.app.use(morganMiddleware);
        }
        // Apply the rate limiting middleware to all requests
        this.app.use(rateLimit(Config.rateLimit));
        this.app.use(cors(Config.cors));
        // Helmet Config
        this.app.use(helmet());
        // Input Post Values to req.body
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    setRoutes() {
        this.app.use(router);
    }
}
