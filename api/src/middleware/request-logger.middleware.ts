import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const logger = new Logger('HTTP');

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });

  next();
}
