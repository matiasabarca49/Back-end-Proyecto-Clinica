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

