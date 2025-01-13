import { createhash } from "../../utils/utils.js";

export class UserFormated {

    constructor(user){
        this.name = user.name;
        this.lastName = user.lastName
        this.email = user.email
        this.password = createhash(user.password)
        this.rol = user.rol
    }

    sendUser(){
        return {
            id: this._id,
            name: this.name,
            lastName: this.lastName,
            email: this.email,
            rol: this.rol
        }
    }
}

export const sendUserFormated = (user) =>{
    return {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        rol: user.rol
    }
}

export const sendUsersFormated = (arrayUsers) =>{
    const arrayMaped = arrayUsers.map( user => {
        return {
            id: user._id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            rol: user.rol
        }
    })
    return arrayMaped;
}
