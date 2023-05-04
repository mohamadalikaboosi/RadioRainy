import { server } from './server.config';
import { rateLimit } from './rateLimit.config';
import { cors } from './cors.config';
import { database } from './database.config';
import { telegram } from './telegram.config';
import { music } from './music.config';

const config: any = {
    server,
    database,
    telegram,
    rateLimit,
    cors,
    music,
};

export default config;
