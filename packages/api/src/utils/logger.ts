/**
 * Logger utility using Winston
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]`;

  if (typeof message === 'object') {
    msg += `: ${JSON.stringify(message)}`;
  } else {
    msg += `: ${message}`;
  }

  if (stack) {
    msg += `\n${stack}`;
  }

  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

// Create logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console output
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // File output (errors only)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // File output (all logs)
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Create logs directory if it doesn't exist
import { mkdirSync } from 'fs';
try {
  mkdirSync('logs', { recursive: true });
} catch (err) {
  // Ignore if directory already exists
}
