
import UsersManager from "../DAO/mongo/users.mongo.js";
import { isValidPassword } from "../utils/utils.js";
import { generateToken } from "../utils/middlewares.js";
const usersManager = new UsersManager();


export const loginUser = async (req,res)=>{
    const {email, password } = req.body;
    const userFounded = await usersManager.getAllUserByFilter({email: email});
    if(!userFounded){
        res.clearCookie('token'); // Borrar la cookie
        res.status(401).send({status: "ERROR", reason: "Credenciales Incorrectas"})
    }else{
        if(!isValidPassword(userFounded, password)){
            res.clearCookie('token'); // Borrar la cookie
            res.status(401).send({status: "ERROR", reason: "Credenciales Incorrectas"})
        }
        else{
            const token = generateToken(userFounded);
            // Configurar la cookie
            res.cookie('token', token, {
                httpOnly: true, // Asegura que solo sea accesible por el servidor
                sameSite: 'strict', // Protección CSRF
                maxAge: 3600000, // Tiempo de expiración en milisegundos (1 hora)
            });
            req.user = userFounded;
            res.status(200).send({ status: "Success" , token});
        }
    }  
}

export const currentUser = async (req,res)=>{
    req.user
    ? res.status(200).send({status: "OK", userCurrent: req.user})
    : res.status(400).send({status:"Error", reason: "User Not Loged"})
}

export const disconnectUser = (req, res) =>{
    const cookieFounded = req.cookies.token;
    res.clearCookie('token'); // Borrar la cookie
    cookieFounded
    ?res.status(200).send({status:"Success", reason: "User Disconnected"})
    :res.status(400).send({status:"Error", reason: "User Not Loged"})
}