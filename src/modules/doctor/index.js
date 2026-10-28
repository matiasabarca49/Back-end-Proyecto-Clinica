// API pública de la feature doctor.
// Las demás features importan solo desde este archivo, nunca desde sus archivos internos.
export { default as DoctorsService } from './doctor.service.js';
export { doctorFieldsCreateRules, doctorFieldsUpdateRules } from './doctor.validation.js';
