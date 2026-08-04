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

