const COLORS = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const fmt = (level, color, args) => {
  const ts = new Date().toISOString();
  const tag = `${color}[${level}]${COLORS.reset}`;
  return [`${COLORS.gray}${ts}${COLORS.reset} ${tag}`, ...args];
};

const logger = {
  info: (...args) => console.log(...fmt('info', COLORS.cyan, args)),
  warn: (...args) => console.warn(...fmt('warn', COLORS.yellow, args)),
  error: (...args) => console.error(...fmt('error', COLORS.red, args)),
  ready: (...args) => console.log(...fmt('ready', COLORS.green, args))
};

module.exports = logger;
