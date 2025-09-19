import bcrypt from 'bcrypt'

export const createhash = (password)=>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export const isValidPassword = (user, password) =>{
    return bcrypt.compareSync(password, user.password);
}

export const normalizeText = (text) =>{
    if(text === " "){
        return;
    }
    const textLow = text.trim().toLowerCase();
    return textLow[0].toUpperCase() + textLow.slice(1, textLow.length); 
}

export function determineSearchType(input) {
  const trimmed = input.trim();
  
  // 1. Si es solo números (1-2 dígitos) = consultorio
  if (/^\d{1,2}$/.test(trimmed)) {
    return 'consultorio';
  }
  
  // 2. Patrones claros de fecha
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,           // 2025-09-19
    /^\d{2}\/\d{2}\/\d{4}$/,         // 19/09/2025
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,     // 9/9/2025
    /^\d{2}-\d{2}-\d{4}$/,           // 19-09-2025
    /^\d{1,2}-\d{1,2}-\d{4}$/        // 9-9-2025
  ];
  
  for (let pattern of datePatterns) {
    if (pattern.test(trimmed)) {
      return 'fecha';
    }
  }
  
  // 3. Si contiene palabras de consultorio
  if (/consultorio|sala|room/i.test(trimmed)) {
    return 'consultorio';
  }
  
  // 4. Si es un año (4 dígitos) = fecha
  if (/^\d{4}$/.test(trimmed)) {
    return 'fecha';
  }
  
  // 5. Intentar parsear como fecha
  const parsedDate = new Date(trimmed);
  if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900) {
    return 'fecha';
  }
  
  // 6. Por defecto = consultorio
  return 'consultorio';
}

