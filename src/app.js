require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require('passport');


// Import routes
const authRoutes = require('./routes/auth');
const facebookRoutes = require('./routes/facebook');
const exportRoutes = require('./routes/export');

const app = express();
  


// console.log("App ID:", process.env.FACEBOOK_APP_ID);
// console.log("App Secret:", process.env.FACEBOOK_APP_SECRET);




// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'facebook-leads-dashboard-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// Make isAuthenticated available to routes
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/', facebookRoutes);
app.use('/', exportRoutes);

// Home route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.render('login');
  }
});

// Dashboard route
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('<h1>404 - Page Not Found</h1>');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

const HOST = process.env.HOST ;
const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://${HOST}:${PORT}`);
  console.log(`📊 Dashboard: http://${HOST}:${PORT}/dashboard`);
});

// const HOST = process.env.HOST || 'localhost';
// const PORT = process.env.PORT || 3000;
// // Listen on host + port from .env
// app.listen(PORT, HOST, () => {
//   console.log(`✅ Server running at: http://${HOST}:${PORT}`);
//   console.log(`📊 Dashboard will be available at http://${HOST}:${PORT}/dashboard`);
// });


module.exports = app;