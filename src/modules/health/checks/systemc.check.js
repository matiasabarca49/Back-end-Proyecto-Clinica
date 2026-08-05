export const systemCheck = async () => {
    try {
        process.pid
        process.memoryUsage()

        return {
            name: "system",
            pid: process.pid,
            memoryUsage: process.memoryUsage(),
        };

    } catch (error) {
        return {
            name: "system",
            status: "DOWN",
            latency: null,
            error: "System check failed"
        };
    }
}