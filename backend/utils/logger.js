const winston = require('winston');

// Determine log level based on environment
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json() // Always use structured JSON logging in production
  ),
  defaultMeta: { service: 'parkops-api' },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? winston.format.json() 
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message} ${
                Object.keys(info).length > 3 && !info.stack ? JSON.stringify({ ...info, level: undefined, message: undefined, timestamp: undefined }) : ''
              }${info.stack ? `\n${info.stack}` : ''}`
            )
          )
    })
  ]
});

module.exports = logger;
