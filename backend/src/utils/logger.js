/**
 * CampusCoins Structured Logger
 */

const formatTimestamp = () => new Date().toISOString();

const logger = {
  info: (msg, meta = '') => {
    console.log(`[${formatTimestamp()}] [INFO] ${msg}`, meta ? meta : '');
  },
  warn: (msg, meta = '') => {
    console.warn(`[${formatTimestamp()}] [WARN] ${msg}`, meta ? meta : '');
  },
  error: (msg, err = '') => {
    console.error(`[${formatTimestamp()}] [ERROR] ${msg}`, err ? err : '');
  },
  debug: (msg, meta = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${formatTimestamp()}] [DEBUG] ${msg}`, meta ? meta : '');
    }
  }
};

module.exports = logger;
