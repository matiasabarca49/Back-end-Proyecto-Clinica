import client from 'prom-client';

const registry = new client.Registry();

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

client.collectDefaultMetrics({
    register: registry
});

export {
  registry,
  httpRequestsTotal,
  httpRequestDuration
};