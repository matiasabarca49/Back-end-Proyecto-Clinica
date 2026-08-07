import crypto from "node:crypto";
import logger from "../core/logger/logger.js";

const httpLogger = (req, res, next) => {

    const requestId = crypto.randomUUID();
    req.requestId = requestId;

    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1_000_000;

        const statusCode = res.statusCode;

        const level =
            statusCode >= 500 ? "error" :
            statusCode >= 400 ? "warn" :
            "info";

        logger.log(level, {
            message: `${req.method} ${req.originalUrl}`,
            statusCode,
            duration: `${duration.toFixed(2)} ms`,
            requestId
        });
    });

    next();
};

export default httpLogger;