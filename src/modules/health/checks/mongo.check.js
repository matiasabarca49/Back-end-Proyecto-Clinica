/**
*      0 → disconnected
*      1 → connected
*      2 → connecting
*      3 → disconnecting
* 
*       | Escenario                    | Latencia típica |
*       | ---------------------------- | --------------: |
*       | Misma máquina (Docker/local) |        0.2–2 ms |
*       | Misma red/local              |          1–5 ms |
*       | Misma región (AWS/GCP)       |         2–15 ms |
*       | Distinta región              |      30–100+ ms |
*
*/

const CONNECTION_STATES = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
};

import mongoose from 'mongoose';
import { performance } from "node:perf_hooks";

export const mongoCheck = async () => {
    try {
        const connectionState = mongoose.connection.readyState;
        
        if (connectionState !== 1) {
            return {
                name: "mongo",
                status: "DOWN",
                connectionState: {
                    code: connectionState,
                    state: CONNECTION_STATES[connectionState]
                },
                latency: null
            };
        }
        
        // Measure latency
        const start = performance.now();

        await mongoose.connection.db.admin().ping();

        const latency = performance.now() - start;

    
        return {
            name: "mongo",
            status: "UP",
            connectionState: {
                code: connectionState,
                state: CONNECTION_STATES[connectionState]
            },
            latency: { 
                value: Number(latency.toFixed(2)),
                unit: "ms"
             }
        };

    } catch (error) {
        return {
            name: "mongo",
            status: "DOWN",
            latency: null,
            error: "Connection timeout"
        }
    }
}