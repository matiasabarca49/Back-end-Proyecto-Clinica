export class UserFormated {
    constructor(user) {
        this.name = user.name;
        this.lastName = user.lastName || " - ";
        this.email = user.email;

        
        this.password =user.password

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
        this.name = UserDTO.capitalize(user.name);
        this.lastName = UserDTO.capitalize(user.lastName) || " - ";
        this.email = user.email;
        this.password =user.password;
        this.rol = user.rol;;
        this.status = user.status;
    }  
    
    // Helpers de normalización
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();  
    }

    //Salida de datos
    static toResponse(user) {
        return {
            id: user._id || user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            rol: user.rol,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            status: user.status
        };
    }

    static toUpdate(user) {
        const updatedUser = {};
        if (user.name) updatedUser.name = this.capitalize(user.name);
        if (user.lastName) updatedUser.lastName = this.capitalize(user.lastName);
        if (user.email) updatedUser.email = user.emai;
        if (user.rol) updatedUser.rol = user.rol;
        return updatedUser;
    }
}

export class CreateUserRequestDTO {

    constructor(user){
        this.name = this.normalize(user.name);
        this.lastName = this.normalize(user.lastName) || " - ";
        this.email = this.normalizeEmail(user.email);
        this.password = user.password;
        this.rol = this.normalizeRol(user.rol);
        if(user.dni && user.phone && user.professionalLicense){
            this.dni = user.dni;
            this.phone = user.phone;
            this.professionalLicense = user.professionalLicense;
        }
    }

    // Helpers de normalización
    normalize(str){
        return str?.trim().replace(/\s+/g, ' ') || '';
    }

    normalizeEmail(email) {
        return email?.toLowerCase().trim() || ''; 
    }

    normalizeRol(rol) {
        if (!rol) return 'Employee';

        const rolesMap = {
            admin: 'Admin',
            doctor: 'Doctor',
            employee: 'Employee'
        };

        const rolNormalized = rol.trim().toLowerCase();
        return rolesMap[rolNormalized] || 'Employee';
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
