import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaKeys = Object.keys(meta);
    const metaStr = metaKeys.length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${String(timestamp)} ${String(level)} ${String(message)}${metaStr}`;
  }),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: isProduction ? winston.format.json() : consoleFormat,
  transports: [new winston.transports.Console()],
  silent: process.env.NODE_ENV === 'test',
});
