const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../../firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = admin.firestore();

class FirebaseService {
  // Save user data
  async saveUser(userId, userData) {
    try {
      await db.collection('users').doc(userId).set(userData, { merge: true });
      console.log(`✅ User ${userId} saved to Firebase`);
    } catch (error) {
      console.error('Error saving user:', error.message);
      throw error;
    }
  }

  // Get user token
  async getUserToken(userId) {
    try {
      const doc = await db.collection('users').doc(userId).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data().longLivedToken;
    } catch (error) {
      console.error('Error getting user token:', error.message);
      throw error;
    }
  }

  // Save ad accounts
  async saveAdAccounts(userId, accounts) {
    try {
      const batch = db.batch();
      
      accounts.forEach(account => {
        const accountRef = db.collection('users')
          .doc(userId)
          .collection('adAccounts')
          .doc(account.id);
        
        batch.set(accountRef, {
          name: account.name,
          accountId: account.account_id,
          status: account.account_status,
          currency: account.currency,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log(`✅ Saved ${accounts.length} ad accounts for user ${userId}`);
    } catch (error) {
      console.error('Error saving ad accounts:', error.message);
      throw error;
    }
  }

  // Save leads
  async saveLeads(userId, formId, leads) {
    try {
      if (leads.length === 0) {
        console.log('⚠️ No leads to save');
        return;
      }

      const batch = db.batch();
      let count = 0;
      
      for (const lead of leads) {
        const leadRef = db.collection('users')
          .doc(userId)
          .collection('leads')
          .doc(lead.id);
        
        batch.set(leadRef, {
          ...lead,
          formId: formId,
          importedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        count++;
        
        // Firestore batch limit is 500
        if (count % 450 === 0) {
          await batch.commit();
          console.log(`✅ Committed batch of ${count} leads`);
        }
      }
      
      // Commit remaining leads
      if (count % 450 !== 0) {
        await batch.commit();
      }
      
      console.log(`✅ Saved ${leads.length} leads for user ${userId}`);
    } catch (error) {
      console.error('Error saving leads:', error.message);
      throw error;
    }
  }

  // Get all leads for a user
  async getLeads(userId) {
    try {
      const snapshot = await db.collection('users')
        .doc(userId)
        .collection('leads')
        .orderBy('createdTime', 'desc')
        .get();
      
      const leads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to string
        createdTime: doc.data().createdTime || new Date().toISOString(),
        importedAt: doc.data().importedAt?.toDate().toISOString() || new Date().toISOString()
      }));
      
      console.log(`✅ Retrieved ${leads.length} leads for user ${userId}`);
      return leads;
    } catch (error) {
      console.error('Error getting leads:', error.message);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const doc = await db.collection('users').doc(userId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error getting user profile:', error.message);
      throw error;
    }
  }

  // Delete all leads for a user
  async deleteAllLeads(userId) {
    try {
      const snapshot = await db.collection('users')
        .doc(userId)
        .collection('leads')
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`✅ Deleted ${snapshot.docs.length} leads for user ${userId}`);
    } catch (error) {
      console.error('Error deleting leads:', error.message);
      throw error;
    }
  }
}

module.exports = new FirebaseService();
    