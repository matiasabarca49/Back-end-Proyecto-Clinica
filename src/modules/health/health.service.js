import packageJson from "../../../package.json" with { type: "json" };

const APP_VERSION = packageJson.version;

class HealthService {

    async getLiveStatus(){}

    async getReadyStatus(){}

    async getHealthStatus(){
            //Timestamp
            const time = new Date().toISOString();
            //Uptime
            const uptimeSeconds = Math.floor(process.uptime());
            const uptime = {
                seconds: uptimeSeconds,
                human: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
            };
            //Version
            const version = APP_VERSION || "1.0.0";
            //environment
            const environment = process.env.NODE_ENV || "development";
            //status
            const status = "UP";
            return {
                service: process.env.APP_NAME || "clinic-api",
                status,
                timestamp: time,
                uptime,
                version,
                environment,
                services: {
                }
            };
        }

}

export default new HealthService();