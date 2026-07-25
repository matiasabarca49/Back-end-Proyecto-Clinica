import {rateLimit} from 'express-rate-limit';


const createLimit = (limit, windowsMS, message) => rateLimit({
  windowMs: windowsMS,
  limit: limit,
  message:{ success: false, error: message, statusCode: 429},
  legacyHeaders: false,
  standardHeaders: "draft-8"
  }
)

export const generalLimit = createLimit(
  15 * 60 * 1000, 
  1000, 
  "Demaciadas peticiones, intente más tarde");

export const loginLimit = createLimit(
  15 * 60 * 1000,
  5,
  "Demasiados intentos de inicio de sesión"
  );

export const registerLimit = createLimit(
  60 * 60 * 1000,
  5,
  "Demasiados intentos de registro"
);

export const changePasswordLimit = createLimit(
  60 * 60 * 1000,
  3,
  "Límite de subidas alcanzado"
);

export const refreshTokenLimit = createLimit(
  15 * 60 * 1000,
  100,
  "Límite de subidas alcanzado"
)

export const uploadLimit = createLimit(
  60 * 60 * 1000,
  20,
  "Límite de subidas alcanzado"
);