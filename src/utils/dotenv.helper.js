import { requiredEnvVars } from '../config/env.config.js'
 
export const validateEnvVars = (type) => {
    return requiredEnvVars[type];
}

 