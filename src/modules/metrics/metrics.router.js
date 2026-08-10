import { Router } from 'express';
import { registry } from './metrics.js';

const router = Router();

router.get('/', async (req, res) => {
  res.set('Content-Type', registry.contentType);

  res.end(await registry.metrics());
});

export default router;