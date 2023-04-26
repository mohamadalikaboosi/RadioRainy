import { server } from './server.config';
import { rateLimit } from './rateLimit.config';
import { cors } from './cors.config';

const config: any = {
    server,
    jwt: {
        secret_key: process.env.JWT_SECRETKEY,
        refresh_key: process.env.JWT_REFRESH_SECRET,
        email_key: process.env.JWT_EMAIL_TOKEN,
    },
    rateLimit,
    cors,
};

export default config;
