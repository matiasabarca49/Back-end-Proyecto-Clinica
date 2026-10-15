import { requiredEnvVars } from "../../../config/env.config.js";
import { validateEnvVars } from "../../../utils/dotenv.helper.js";

// Tiempo máximo de espera para que el microservicio de PDF responda
const TIMEOUT_MS = 3000;

export const pdfCheck = async () => {
    if (!validateEnvVars("pdf")) {
        return {
            name: "pdf-service",
            status: "DISABLED",
            latency: null,
            error: "PDF_SERVICE_URL no configurada"
        };
    }

    try {
        const start = performance.now();

        const response = await fetch(`${requiredEnvVars.PDF_SERVICE_URL}/health`, {
            signal: AbortSignal.timeout(TIMEOUT_MS)
        });

        const latency = Number((performance.now() - start).toFixed(2));

        if (!response.ok) {
            return {
                name: "pdf-service",
                status: "DOWN",
                latency: null,
                error: `HTTP ${response.status}`
            };
        }

        return {
            name: "pdf-service",
            status: "UP",
            latency: { value: latency, unit: "ms" }
        };

    } catch (error) {
        return {
            name: "pdf-service",
            status: "DOWN",
            latency: null,
            error: "Connection timeout"
        };
    }
};
