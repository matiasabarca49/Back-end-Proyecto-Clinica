//JWT
import jwt from 'jsonwebtoken'
const secretKey = "yourSecretKey1234";

export const generateToken = (user)=>{
    const token = jwt.sign(
        { id: user._id, email: user.email, rol: user.rol},
        secretKey,
        { expiresIn: '1h' }
    );
    return token;
}

export const authToken = (req, res ,next) =>{

    const cookieToken = req.cookies.token;
    if(!cookieToken) return res.status(401).send({status: "ERROR", reason: "Not Authenticated"})
    const token =  req.cookies.token; // Leer el token de la cookie
    jwt.verify(token, secretKey,(error, credentials)=>{
      error && res.status(403).send({error: "Not authorized"});
      req.user = {id: credentials.id, email: credentials.email, rol: credentials.rol};
      next();  
    })    
} 

//Permisos
export const checkPermissionsAdmin = (req,res,next) =>{
    if(req.user.rol == "Admin"){
        next();
    }
    else{
        res.status(401).send({status:"Error",reason: "No Autorizado"});
    }
}

export const checkAuth = (req,res,next) =>{
    if(req.user.rol){
        next();
    }
    else{
        res.status(401).send({status:"Error",reason: "No Auntenticado"});
    }
}