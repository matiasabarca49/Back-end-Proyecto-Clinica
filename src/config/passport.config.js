import passport from "passport";
import UsersService from '../service/user.service.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserDTO } from '../dto/user.dto.js';
import crypto from 'crypto';
import { createhash } from "../utils/utils.js";

const usersService = new UsersService();

if(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL){
    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"]
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const data = profile._json || profile;
    
    
            const name = data.given_name || profile.name?.givenName || '';
            const email = data.email || profile.emails?.[0]?.value || '';
            const lastName = data.family_name || '';


            let userFound = await usersService.findUserByEmail(email);

            if (!userFound) {
                const newUser = {
                    name,
                    lastName,
                    email,
                    rol: 'employee',
                    password: createhash(crypto.randomUUID())
                };

                newUser.status = 'active';

                const formattedUser = new UserDTO(newUser);
                const userCreated = await usersService.create(formattedUser);
                return done(null, userCreated);
            }else{
                return done(null, userFound);
            }
        } catch (error) {
            return done(error, false);
        }
    }));
    
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

}

