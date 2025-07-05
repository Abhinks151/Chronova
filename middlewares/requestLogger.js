import { logger } from '../config/logger.js';

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(
      `[${req.method}] ${req.originalUrl} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`
    );
  });

  next();
};