const express = require('express');
const FacebookService = require('../services/facebookService');
const firebaseService = require('../services/firebaseService');

const router = express.Router();

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// Get ad accounts
router.get('/api/ad-accounts', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.facebookId;
    const token = await firebaseService.getUserToken(userId);
    
    if (!token) {
      return res.status(401).json({ error: 'Token not found' });
    }
    
    const fbService = new FacebookService(token);
    const accounts = await fbService.getAdAccounts();
    
    // Save ad accounts to Firebase
    await firebaseService.saveAdAccounts(userId, accounts);
    
    res.json({ success: true, accounts });
  } catch (error) {
    console.error('Error fetching ad accounts:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get lead forms for an ad account
router.get('/api/lead-forms/:accountId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.facebookId;
    const { accountId } = req.params;
    const token = await firebaseService.getUserToken(userId);
    
    if (!token) {
      return res.status(401).json({ error: 'Token not found' });
    }
    
    const fbService = new FacebookService(token);
    const forms = await fbService.getLeadForms(accountId);
    
    res.json({ success: true, forms });
  } catch (error) {
    console.error('Error fetching lead forms:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get leads for a specific form
router.get('/api/leads/:formId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.facebookId;
    const { formId } = req.params;
    const token = await firebaseService.getUserToken(userId);
    
    if (!token) {
      return res.status(401).json({ error: 'Token not found' });
    }
    
    const fbService = new FacebookService(token);
    const leads = await fbService.getLeads(formId);
    
    // Save leads to Firebase
    await firebaseService.saveLeads(userId, formId, leads);
    
    res.json({ success: true, count: leads.length, leads });
  } catch (error) {
    console.error('Error fetching leads:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all leads from Firebase
router.get('/api/leads', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.facebookId;
    const leads = await firebaseService.getLeads(userId);
    
    res.json({ success: true, count: leads.length, leads });
  } catch (error) {
    console.error('Error fetching leads from Firebase:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Sync all leads from all forms
router.post('/api/sync-leads', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.facebookId;
    const token = await firebaseService.getUserToken(userId);
    
    if (!token) {
      return res.status(401).json({ error: 'Token not found' });
    }
    
    const fbService = new FacebookService(token);
    
    // Get all ad accounts
    const accounts = await fbService.getAdAccounts();
    let totalLeads = 0;
    
    // For each account, get forms and leads
    for (const account of accounts) {
      const forms = await fbService.getLeadForms(account.id);
      
      for (const form of forms) {
        const leads = await fbService.getLeads(form.id);
        await firebaseService.saveLeads(userId, form.id, leads);
        totalLeads += leads.length;
      }
    }
    
    res.json({ 
      success: true, 
      message: `Synced ${totalLeads} leads from ${accounts.length} accounts`,
      totalLeads 
    });
  } catch (error) {
    console.error('Error syncing leads:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
