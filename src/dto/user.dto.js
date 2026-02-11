export class UserDTO{
    constructor(user){
        this.name = user.name? UserDTO.capitalize(user.name) : "Usuario";
        this.lastName = user.lastName ? UserDTO.capitalize(user.lastName) : " - ";
        this.email = user.email;
        this.password =user.password;
        this.rol = user.rol;
        this.status = user.status || 'active';
        //Atributos de Seguridad
        this.lastLogintAt = null;
        this.mustChangePassword = user.mustChangePassword | true;
        this.passwordHistory = user.passwordHistory || []
        this.passwordChangedAt = null
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
            created: user.created,
            lastChange: user.lastChange,
            status: user.status,
            lastLogintAt: user.lastLogintAt,
            mustChangePassword: user.mustChangePassword
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
        this.status = user.status;
        // Datos adicionales para Doctor
        if(user.rol === "doctor"){
            if(user.dni) this.dni = user.dni;
            if(user.phone) this.phone = user.phone;
            if(user.professionalLicense) this.professionalLicense = user.professionalLicense;
            if(user.schedules) this.schedules = user.schedules
            if(user.color) this.color = user.color
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
        if (!rol) return 'employee';

        const rolesMap = {
            admin: 'admin',
            doctor: 'doctor',
            employee: 'employee'
        };

        const rolNormalized = rol.trim().toLowerCase();
        return rolesMap[rolNormalized] || 'employee';
    }
}
