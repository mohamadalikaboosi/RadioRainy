const telegramConfig = {
    session: process.env.TELEGRAM_SESSION,
    apiId: process.env.TELEGRAM_API_ID,
    apiHash: process.env.TELEGRAM_API_HASH,
    channelUsername: process.env.TELEGRAM_CHANNEL_USERNAME,
};

export { telegramConfig as telegram };
