import {rateLimit} from 'express-rate-limit';

const limitHandler = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  limit: 100, // limit each IP to 100 requests per windowMs
  message:{ success: false, error: "Demaciadas peticiones, intente más tarde", statusCode: 429},
  legacyHeaders: false,
  standardHeaders: "draft-8"
});

export default limitHandler;