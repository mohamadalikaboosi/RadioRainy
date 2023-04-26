import * as http from 'http';

import debug0 from 'debug';

import { logger } from './config/logger';
import { App } from './app';

export class Server {
    port: number = Config.server.port;
    server: any;
    debug = debug0('iRole-Express-Api:server');

    constructor() {
        this.setServer();
    }

    setServer() {
        /**
         * Create HTTP server.
         */
        this.server = http.createServer(new App().app);
        this.server.listen(this.port, () => {
            logger.info(`Server listening on port: ${this.port} Mode = ${Config.server.environment}`);
        });
        this.server.on('error', this.onError);
    }

    /**
     * Event listener for HTTP server "error" event.
     */
    onError(error: any) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = `Port ${this.port}`;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                logger.error(`${bind} requires elevated privileges`, error);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                logger.error(`${bind} is already in use`, error);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}
