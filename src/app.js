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
    secure: process.env.NODE_ENV === 'production', // true on Render
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

// Data Deletion Request - Required by Facebook
app.get('/data-deletion', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Data Deletion Request</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px; 
          margin: 50px auto; 
          padding: 20px;
          background: #f0f2f5;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { color: #1877f2; margin-bottom: 20px; }
        .contact { 
          background: #f0f2f5; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        .contact strong { color: #1877f2; }
        a { color: #1877f2; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📋 Data Deletion Instructions</h1>
        <p>If you want your data deleted from our system, please contact us:</p>
        <div class="contact">
          <p><strong>Email:</strong> <a href="mailto:vinayakwebtech8@gmail.com">vinayakwebtech8@gmail.com</a></p>
          <p><strong>Subject:</strong> Delete My Data</p>
        </div>
        <p>Please include your Facebook User ID or email address in your request.</p>
        <p>We will remove all associated data within <strong>7 business days</strong>.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e4e6eb;">
        <p style="color: #666; font-size: 14px;">
          This page is required by Facebook's Platform Policy for apps that access user data.
        </p>
      </div>
    </body>
    </html>
  `);
});

// Privacy Policy - Required by Facebook
app.get('/privacy-policy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Privacy Policy</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px; 
          margin: 50px auto; 
          padding: 20px;
          background: #f0f2f5;
          line-height: 1.6;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { color: #1877f2; margin-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; margin-bottom: 15px; }
        p { color: #555; margin-bottom: 15px; }
        .date { color: #999; font-size: 14px; margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 Privacy Policy</h1>
        <p class="date">Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <h2>Information We Collect</h2>
        <p>We collect Facebook lead ads data including names, emails, and phone numbers with your explicit permission through Facebook's Marketing API.</p>
        
        <h2>How We Use Your Information</h2>
        <p>We use the collected data solely to display your Facebook lead ads campaigns and export them for your business use. We do not share your data with third parties.</p>
        
        <h2>Data Storage</h2>
        <p>Your data is securely stored in Firebase Firestore with industry-standard encryption. Only you can access your data through your authenticated account.</p>
        
        <h2>Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction.</p>
        
        <h2>Your Rights</h2>
        <p>You have the right to access, modify, or delete your data at any time. You can request data deletion by visiting our <a href="/data-deletion">Data Deletion</a> page.</p>
        
        <h2>Third-Party Services</h2>
        <p>We use Facebook's Marketing API and Firebase Firestore. These services have their own privacy policies which we recommend you review.</p>
        
        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:vinayakwebtech8@gmail.com">vinayakwebtech8@gmail.com</a></p>
      </div>
    </body>
    </html>
  `);
});

// Terms of Service - Required by Facebook
app.get('/terms-of-service', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Terms of Service</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px; 
          margin: 50px auto; 
          padding: 20px;
          background: #f0f2f5;
          line-height: 1.6;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { color: #1877f2; margin-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; margin-bottom: 15px; }
        p { color: #555; margin-bottom: 15px; }
        .date { color: #999; font-size: 14px; margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📜 Terms of Service</h1>
        <p class="date">Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <h2>Acceptance of Terms</h2>
        <p>By using this Facebook Leads Dashboard, you agree to these Terms of Service. If you do not agree, please do not use this service.</p>
        
        <h2>Service Description</h2>
        <p>This service allows you to view, manage, and export leads from your Facebook Lead Ads campaigns through Facebook's Marketing API.</p>
        
        <h2>User Responsibilities</h2>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your Facebook credentials</li>
          <li>Ensuring you have permission to access the Facebook ad accounts you connect</li>
          <li>Complying with Facebook's Terms of Service and Platform Policies</li>
          <li>Using the exported data in accordance with applicable laws and regulations</li>
        </ul>
        
        <h2>Data Usage</h2>
        <p>You must comply with Facebook's Terms of Service, Data Policy, and all applicable data protection laws when using this service and handling the lead data.</p>
        
        <h2>Limitation of Liability</h2>
        <p>This service is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of this service.</p>
        
        <h2>Termination</h2>
        <p>We reserve the right to terminate or suspend your access to the service at any time for violation of these terms.</p>
        
        <h2>Changes to Terms</h2>
        <p>We may update these terms from time to time. Continued use of the service constitutes acceptance of updated terms.</p>
        
        <h2>Contact</h2>
        <p>For questions about these Terms of Service, contact: <a href="mailto:vinayakwebtech8@gmail.com">vinayakwebtech8@gmail.com</a></p>
      </div>
    </body>
    </html>
  `);
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Not Found</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background: #f0f2f5;
        }
        h1 { color: #1877f2; font-size: 72px; margin: 0; }
        p { color: #666; font-size: 20px; }
        a { color: #1877f2; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <h1>404</h1>
      <p>Page Not Found</p>
      <a href="/">← Go Home</a>
    </body>
    </html>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// Server configuration
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
});

module.exports = app;
