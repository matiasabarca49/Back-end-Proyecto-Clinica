import crypto from "node:crypto";
import requestContext from "../core/request-context/requestContext.js";
import logger from "../core/logger/logger.js";

const httpLogger = (req, res, next) => {

    const start = process.hrtime.bigint();

    const requestId = crypto.randomUUID();

    req.requestId = requestId;

    requestContext.run(
        { requestId },
        () => {
            res.on("finish", () => {

                const end = process.hrtime.bigint();

                const duration =
                    Number(end - start) / 1_000_000;

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
        }
    );
};

export default httpLogger;