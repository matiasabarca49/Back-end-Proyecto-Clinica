import { httpRequestDuration, httpRequestsTotal, registry } from '../modules/metrics/metrics.js';
import { performance } from "node:perf_hooks";

export const metricsMiddleware = (req, res, next) => {
  //Evita que el endpoint de metrics se mida
  console.log(req.path)
  if (req.path === '/api/metrics') {
    return next();
  }
 const start = performance.now();

  res.on('finish', async () => {
    const duration = (performance.now() - start) / 1000;

    const route = req.baseUrl + req.route.path;

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: String(res.statusCode),
    });

    httpRequestDuration.observe(
        {
        method: req.method,
        route,
        status_code: String(res.statusCode),
        },
        duration
    );
  });

  next();
};