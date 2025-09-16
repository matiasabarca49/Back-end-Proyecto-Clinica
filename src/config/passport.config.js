import passport from "passport";
import UsersService from '../service/mongo/user.service.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserFormated } from '../dto/user.dto.js';
import crypto from 'crypto';

const usersService = new UsersService();

if(process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CALLBACK_URL){
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
    
    
            let userFound = await usersService.getUserByFilter({ email: email });
    
            if (!userFound) {
                const newUser = {
                    name,
                    lastName,
                    email,
                    password: crypto.randomUUID(),
                };
    
                const formattedUser = new UserFormated(newUser);
                const userCreated = await usersService.createUser(formattedUser);
                return done(null, userCreated.dt)
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

