import passport from "passport";
import UserManager from '../DAO/mongo/users.mongo.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserFormated } from '../DAO/DTO/user.dto.js';
import crypto from 'crypto';

const userManager = new UserManager();

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

        let userFound = await userManager.getUserByFilter({ email: email });

        if (!userFound) {
            const newUser = {
                name,
                email,
                password: crypto.randomUUID(),
            };

            const formattedUser = new UserFormated(newUser);
            userFound = await userManager.createUser(formattedUser);
        }

        return done(null, userFound);
    } catch (error) {
        return done(error, false);
    }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
