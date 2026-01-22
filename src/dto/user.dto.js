import { createhash } from "../utils/utils.js";

export class UserFormated {
    constructor(user) {
        this.name = user.name;
        this.lastName = user.lastName || " - ";
        this.email = user.email;

        
        this.password =createhash(user.password)

        this.rol = user.rol || 'Employee';
    }

    sendUser() {
        return {
            id: this._id,
            name: this.name,
            lastName: this.lastName,
            email: this.email,
            rol: this.rol
        };
    }

}

export class UserDTO{
    constructor(user){
        this.name = user.name;
        this.lastName = user.lastName || " - ";
        this.email = user.email;

        
        this.password =createhash(user.password)

        this.rol = user.rol || 'Employee';
    }   

   static toResponse(user) {
        return {
            id: user._id || user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            rol: user.rol
        };
    }
}

export const sendUserFormated = (user) => {
    return {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        rol: user.rol
    };
};

export const sendUsersFormated = (arrayUsers) => {
    return arrayUsers.map(user => ({
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        rol: user.rol
    }));
};
