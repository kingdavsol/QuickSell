import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  // Attach request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, path, statusCode, statusMessage } = req;

    logger.info(`${method} ${path} - ${res.statusCode} (${duration}ms)`, {
      requestId,
      method,
      path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
};
