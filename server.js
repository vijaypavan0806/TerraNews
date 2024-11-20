const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.use(
    session({
        secret: 'abcdefabcdefabcdefabcdefabcdefabcdef65',
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: '403943212279-rhgavnugudqk0o7v7upijehmcrm78k96.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'http://localhost:3000/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
            const user = {
                id: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                photo: profile.photos[0].value,
            };
            done(null, user);
        }
    )
);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/home');
    }
);

app.get('/home', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, 'terranewshome.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/auth/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'User not authenticated' });
    }
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
