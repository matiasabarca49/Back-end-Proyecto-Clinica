import AppError from "../../core/exceptions/AppErrors.js";
import healthService from "./health.service.js";

export const live = (req, res) => {
  res.status(200).json({ status: 'UP' });
};

export const ready = (req, res) => {
  res.status(200).json({ status: 'Ready' });
};

export const health = async (req, res) => {
  const healthStatus = await healthService.getHealthStatus();
  res.status(200).json(healthStatus);
};

export const instance = (req, res, next) => {
  try{
    const instance = process.env.INSTANCE_NAME
  
    if(!instance) throw new AppError("No hay una instancia declarada")
    
    res.json({ success: true, instance });
  }catch(error){
    next(error)
  }

};
