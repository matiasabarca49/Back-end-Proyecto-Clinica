import { UserDTO } from "../dto/user.dto.js";
import { generateToken } from "../middlewares/middlewares.js";
import { User } from "../model/mongo/user.model.js";
import MongoRepository from "../repositories/implementations/mongo.repository.js";
import RedisRepository from "../repositories/implementations/redis.repository.js";
import { send2FACode, sendLoginSuccessNotification } from "../utils/email.helpers.js";
import { isValidPassword } from "../utils/utils.js";
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
        if (!user) throw new Error('credenciales incorrectas');

        const isPasswordValid = isValidPassword(user.password, credentials.password);
        if (!isPasswordValid) throw new Error('Credenciales incorrectas');

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

    async login2factor(credentials) {
        const user = await this.repository.findByFilter({ email: credentials.email });
        if (!user) throw new Error('credenciales incorrectas');

        //
        const isPasswordValid = isValidPassword(user.password, credentials.password);
        if (!isPasswordValid) throw new Error('Credenciales incorrectas');

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
            throw new Error('No se pudo enviar el código de verificación');
        }

        return { status: "Success", message: "Código de verificación enviado correctamente", key: key };
    }

    async verify2factor(userId, emailU, code) {
        const pending = this.pendingCodes.get(userId);
        if (!pending) {
            throw new Error('No hay un código pendiente para este usuario o ha expirado');
        }

        if (pending.code !== code) {
            throw new Error('Código de verificación incorrecto');
        }

        // Verificar expiración
        if (Date.now() > pending.expires) {
            this.pendingCodes.delete(userId);
            throw new Error('El código de verificación ha expirado');
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

        if (!user) throw new Error('Usuario no encontrado');

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

        if(!token) throw new Error("Error al crear la sessión")

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
            throw new Error('No se pudo eliminar la sesión o no existía');
        }
        return deleted;
    }

}

export default AuthService;
