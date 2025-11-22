// src/config/logger.js
import winston from "winston";
import { fileURLToPath } from "url";
import path from "path";
import { NODE_ENV } from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = !!process.env.VERCEL;

// Định nghĩa màu console
const colors = {
  error: "red",
  warn: "yellow",
  info: "cyan",
  http: "magenta",
  debug: "white",
};
winston.addColors(colors);

// Format console
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// Format file
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({ format: consoleFormat }),
];

// ❗ WINSTON FILE TRANSPORT = DISABLED TRONG VERCEL
if (!isVercel) {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    })
  );

  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: NODE_ENV === "development" ? "debug" : "info",
  levels: winston.config.npm.levels,
  transports,
});

// Helpers
logger.logRequest = (req) => {
  logger.http(`${req.method} ${req.url} - IP: ${req.ip}`);
};

logger.logResponse = (req, res, ms) => {
  logger.http(`${req.method} ${req.url} - ${res.statusCode} - ${ms}ms`);
};

logger.logError = (error, ctx = "") => {
  logger.error(`${ctx ? `[${ctx}] ` : ""}${error.message}`, {
    stack: error.stack,
  });
};

export default logger;
