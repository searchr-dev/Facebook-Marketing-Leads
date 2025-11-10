const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const firebaseService = require('../services/firebaseService');
const axios = require('axios');

const router = express.Router();

// Configure Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_REDIRECT_URI,
  profileFields: ['id', 'emails', 'name', 'displayName'],
  enableProof: true
},
async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('✅ Facebook authentication successful');
    console.log('Profile ID:', profile.id);
    
    // Exchange short-lived token for long-lived token
    const longLivedToken = await exchangeForLongLivedToken(accessToken);
    console.log('✅ Long-lived token obtained');
    
    // Prepare user data
    const userData = {
      facebookId: profile.id,
      name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
      email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
      shortLivedToken: accessToken,
      longLivedToken: longLivedToken,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      lastLogin: new Date()
    };
    
    // Save to Firebase
    await firebaseService.saveUser(profile.id, userData);
    console.log('✅ User data saved to Firebase');
    
    return done(null, userData);
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return done(error);
  }
}));

// Exchange short-lived token for long-lived token
async function exchangeForLongLivedToken(shortToken) {
  try {
    const url = 'https://graph.facebook.com/v21.0/oauth/access_token';
    const params = {
      grant_type: 'fb_exchange_token',
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      fb_exchange_token: shortToken
    };
    
    const response = await axios.get(url, { params });
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Token exchange error:', error.response?.data || error.message);
    throw new Error('Failed to exchange token');
  }
}

// Facebook OAuth routes
router.get('/auth/facebook', 
  passport.authenticate('facebook', { 
    scope: [
      'email',                    // ✅ Basic - Auto-granted
      'public_profile',           // ✅ Basic - Auto-granted
      // Uncomment these AFTER getting Advanced Access approved:
      // 'ads_management',
      // 'ads_read', 
      // 'leads_retrieval',
      // 'pages_read_engagement',
      // 'read_insights'
    ]
  })
);


// Facebook OAuth callback
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: '/',
    failureMessage: true
  }),
  (req, res) => {
    console.log('✅ Redirecting to dashboard');
    res.redirect('/dashboard');
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    req.session.destroy();
    res.redirect('/');
  });
});

module.exports = router;
