import {AppError, InvalidCredentialsError, NotFoundError} from "../exceptions/index.js";
import { generateToken } from "../middlewares/middlewares.js";
import { User } from "../model/mongo/user.model.js";
import MongoRepository from "../repositories/implementations/mongo.repository.js";
import RedisRepository from "../repositories/implementations/redis.repository.js";
import { send2FACode, sendLoginSuccessNotification } from "../utils/email.helpers.js";
import { createhash, isValidPassword} from "../utils/utils.js";
import BaseService from "./base.service.js";

class AuthService extends BaseService {

    constructor() {
        const mongoRepository = new MongoRepository(User);
        super(mongoRepository);
        this.sessionRepository = new RedisRepository();
        this.pendingCodes = new Map(); // Mapa en memoria para códigos 2FA pendientes
    }

    async login(credentials) {

        const user = await this.repository.findByFilter({ email: credentials.email });
        if (!user) throw new InvalidCredentialsError('credenciales incorrectas');

        const isPasswordValid = isValidPassword(user.password, credentials.password);
        
        if (!isPasswordValid) throw new InvalidCredentialsError('credenciales incorrectas');

        const token = generateToken(user);
        const { _id, email, rol } = user;

        //Guardar usuario en redis que expira en 1h
        this.sessionRepository.create({
            userId: _id.toString(),
            expiration: 3600 // 1 hora en segundos
        });
        
        // Actualizar la fecha de última conexión sin modificar timestamps
        await this.repository.updateWhioutTStamp(_id, { lastLogintAt: new Date() });

        return { token, id: _id, email, rol };
    }

    async login2factor(email) {
        const user = await this.repository.findByFilter({ email: email });
        if (!user) throw new InvalidCredentialsError('credenciales incorrectas');

        //
        /* const isPasswordValid = isValidPassword(user.password, credentials.password);
        if (!isPasswordValid) throw new Error('Credenciales incorrectas'); */

        // Generar y guardar código (siempre como string) con vencimiento
        const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos string
        const expires = Date.now() + 5 * 60 * 1000; // 5 minutos
        const key = user._id.toString(); // clave consistente (string)

        this.pendingCodes.set(key, { code, expires });

        // Enviar email con el código usando helper
        const sent = await send2FACode(
            user.email,
            user.name,
            code
        );

        if (!sent) {
            this.pendingCodes.delete(key);
            throw new AppError('No se pudo enviar el código de verificación', 500);
        }

        return { success: true, message: "Código de verificación enviado correctamente", key: key };
    }

    async verify2factor(userId, emailU, code) {
        const pending = this.pendingCodes.get(userId);
        if (!pending) {
            throw new AppError('No hay un código pendiente para este usuario o ha expirado', 498);
        }

        if (pending.code !== code) {
            throw new AppError('Código de verificación incorrecto', 498);
        }

        // Verificar expiración
        if (Date.now() > pending.expires) {
            this.pendingCodes.delete(userId);
            throw new AppError('El código de verificación ha expirado', 498);
        }

        // Código correcto, eliminar del mapa
        this.pendingCodes.delete(userId);

        // Generar token JWT
        let user;
        if (emailU) {
            user = await this.repository.findByFilter({ email: emailU });
        } else {
            user = await super.findById(userId);
        }

        if (!user) throw new NotFoundError("Usuario", userId);

        const token = generateToken(user);
        const { _id, email, rol } = user;

        //Guardar usuario en redis que expira en 1h
        this.sessionRepository.create({
            userId: _id.toString(),
            expiration: 3600 // 1 hora en segundos
        });

        // Actualizar la fecha de última conexión sin modificar timestamps
        await this.repository.updateWhioutTStamp(_id, { lastLogintAt: new Date() });

        sendLoginSuccessNotification(user.email, user.name)
              .catch(err => console.warn("Aviso de login exitoso falló:", err.message || err));

        return { token, id: _id, email, rol };

    }

    async loginGoogle(user) {
        //Formatear para cambiar el ID por _ID
   
        const token = generateToken(user);

        if(!token) throw new AppError("Error al crear la sessión", 500)

        //Guardar usuario en redis que expira en 1h
        this.sessionRepository.create({
            userId: user.id.toString(),
            expiration: 3600 // 1 hora en segundos
        });

        // Actualizar la fecha de última conexión sin modificar timestamps
        await this.repository.updateWhioutTStamp(user.id, { lastLogintAt: new Date() });

        return { token, id: user.id, email: user.email, rol: user.rol };
    }

    async logout(userId) {
        const deleted = await this.sessionRepository.delete(userId);
        if (!deleted) {
            throw new AppError('No se pudo eliminar la sesión o no existía', 500);
        }
        return deleted;
    }

    async changePassword(currentPassword, newPassword, userSession){
        //Verificar que la password actual sea correcta
        const user = await super.findById(userSession.id)
        const checkPassoword = isValidPassword(user.password, currentPassword)
        if(!checkPassoword) throw new InvalidCredentialsError("Las contraseña actual, no es correcta")
        //verificar que la password nueva no sea igual a la anterior
        if(currentPassword === newPassword ) throw new InvalidCredentialsError("La contraseña debe ser distinta a la anterior")
        
        //verificar que la nueva contraseña no se haya usado antes    
        let arrayPassword = user.passwordHistory
        const isReused = user.passwordHistory.some(oldPassword => 
            isValidPassword(oldPassword, newPassword)
        );
        if(isReused) throw new InvalidCredentialsError("La contraseña ya se usó antes")
        //Limpiar array para que solo se guarden 5
        if(arrayPassword.length >= 5){
            arrayPassword = arrayPassword.slice(1)
        }
        //Creamos hash de la contraseña
        const hashPassword = createhash(newPassword)
        arrayPassword.push(hashPassword)
        //Actualizamos los atributos de contraseñas
        user.passwordHistory = arrayPassword
        user.mustChangePassword = false;
        user.passwordChangedAt = new Date();
        //Aplicamos la contraseña nueva
        user.password = hashPassword

        const userUpdated = await super.update(userSession.id, user)

        return userUpdated

    }

}

export default AuthService;
