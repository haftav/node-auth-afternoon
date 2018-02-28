require('dotenv').config();
const students = require('./students.json');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

const {
    SESSION_SECRET,
    DOMAIN,
    CLIENT_SECRET,
    CLIENT_ID
} = process.env;

const app = express();

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use( new Auth0Strategy({
    domain: DOMAIN,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: '/login',
    scope: 'openid email profile'
}, function(accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
}))

passport.serializeUser(function(user, done) {
    done(null, { clientID: user.id, email: user._json.email, name: user._json.name })
})

passport.deserializeUser(function(obj, done) {
    done(null, obj)
})

app.get('/login', passport.authenticate('auth0', {
    successRedirect: '/students', failureRedirect: '/login', connection: 'github'
}))

function authenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

app.get('/students', authenticated, (req, res) => {
    res.status(200).send(students)
})


const port = 3000;
app.listen( port, () => { console.log(`Server listening on port ${port}`); } );