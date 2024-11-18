const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path'); // Import path module

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for serving static files
app.use(express.static(__dirname)); // Serve all files from the current folder

// Middleware for session management
app.use(
    session({
        secret: 'abcdefabcdefabcdefabcdefabcdefabcdef65', // Replace with a secure key
        resave: false,
        saveUninitialized: true,
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization and deserialization
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Configure Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: '403943212279-rhgavnugudqk0o7v7upijehmcrm78k96.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'https://terranews.vercel.app/auth/google/callback',
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

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Google OAuth login route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Redirect to /home after successful login
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

// Logout route
app.get('/auth/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

// API endpoint to fetch user details
app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'User not authenticated' });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
