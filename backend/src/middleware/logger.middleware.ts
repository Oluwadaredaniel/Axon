import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';

export async function logError(
  message: string,
  stack?: string,
  userId?: string,
  endpoint?: string,
  metadata?: any,
  level: 'info' | 'warn' | 'error' | 'fatal' = 'error'
) {
  try {
    await supabaseAdmin.from('error_logs').insert({
      level,
      message,
      stack,
      user_id: userId || null,
      endpoint,
      metadata,
    });
  } catch (err) {
    console.error('Failed to log error:', err);
  }
}

export function errorLogger(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).user?.id;

  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  logError(
    err.message,
    err.stack,
    userId,
    `${req.method} ${req.path}`,
    {
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
    }
  );

  res.status(500).json({
    error: env.nodeEnv === 'development' ? err.message : 'Internal server error',
  });
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`;

    console.log(log);

    // Log slow requests
    if (duration > 3000) {
      logError(
        `Slow request: ${req.method} ${req.path} took ${duration}ms`,
        undefined,
        (req as any).user?.id,
        `${req.method} ${req.path}`,
        { duration },
        'warn'
      );
    }
  });

  next();
}