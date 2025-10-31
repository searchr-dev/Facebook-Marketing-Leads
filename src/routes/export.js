const express = require('express');
const firebaseService = require('../services/firebaseService');
const { exportToCSV } = require('../utils/csvExporter');

const router = express.Router();

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// Export all leads to CSV
router.get('/export/leads', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.facebookId;
    
    // Fetch all leads from Firebase
    const leads = await firebaseService.getLeads(userId);
    
    if (leads.length === 0) {
      return res.status(404).json({ 
        error: 'No leads found', 
        message: 'Please sync leads first' 
      });
    }
    
    // Convert to CSV
    const csv = exportToCSV(leads);
    
    // Set headers for CSV download
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="facebook-leads-${Date.now()}.csv"`);
    res.send(csv);
    
    console.log(`✅ Exported ${leads.length} leads to CSV`);
  } catch (error) {
    console.error('Error exporting leads:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Export leads as JSON
router.get('/export/leads/json', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.facebookId;
    const leads = await firebaseService.getLeads(userId);
    
    res.header('Content-Type', 'application/json');
    res.header('Content-Disposition', `attachment; filename="facebook-leads-${Date.now()}.json"`);
    res.json(leads);
  } catch (error) {
    console.error('Error exporting leads as JSON:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
