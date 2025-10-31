const axios = require('axios');
const bizSdk = require('facebook-nodejs-business-sdk');

class FacebookService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.apiVersion = 'v21.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    
    // Initialize Facebook Business SDK
    bizSdk.FacebookAdsApi.init(accessToken);
  }

  // Get user's ad accounts
  async getAdAccounts() {
    try {
      const url = `${this.baseUrl}/me/adaccounts`;
      const response = await axios.get(url, {
        params: { 
          access_token: this.accessToken,
          fields: 'id,name,account_id,account_status,currency'
        }
      });
      
      console.log(`✅ Found ${response.data.data.length} ad accounts`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching ad accounts:', error.response?.data || error.message);
      throw new Error('Failed to fetch ad accounts');
    }
  }

  // Get lead forms for an ad account
  async getLeadForms(adAccountId) {
    try {
      const url = `${this.baseUrl}/${adAccountId}/leadgen_forms`;
      const response = await axios.get(url, {
        params: { 
          access_token: this.accessToken,
          fields: 'id,name,status,leads_count,created_time'
        }
      });
      
      console.log(`✅ Found ${response.data.data.length} lead forms`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lead forms:', error.response?.data || error.message);
      throw new Error('Failed to fetch lead forms');
    }
  }

  // Get leads for a specific form
  async getLeads(formId) {
    try {
      const url = `${this.baseUrl}/${formId}/leads`;
      const response = await axios.get(url, {
        params: { 
          access_token: this.accessToken,
          limit: 500,
          fields: 'id,created_time,field_data'
        }
      });
      
      const leads = response.data.data.map(lead => this.formatLead(lead));
      console.log(`✅ Found ${leads.length} leads for form ${formId}`);
      
      return leads;
    } catch (error) {
      console.error('Error fetching leads:', error.response?.data || error.message);
      throw new Error('Failed to fetch leads');
    }
  }

  // Format lead data
  formatLead(lead) {
    const fieldData = lead.field_data || [];
    
    return {
      id: lead.id,
      createdTime: lead.created_time,
      name: this.extractFieldValue(fieldData, 'full_name') || 
            this.extractFieldValue(fieldData, 'first_name') ||
            this.extractFieldValue(fieldData, 'name') ||
            'N/A',
      email: this.extractFieldValue(fieldData, 'email') || 'N/A',
      phone: this.extractFieldValue(fieldData, 'phone_number') || 
             this.extractFieldValue(fieldData, 'phone') ||
             'N/A',
      customFields: this.extractCustomFields(fieldData)
    };
  }

  // Extract field value by name
  extractFieldValue(fieldData, fieldName) {
    const field = fieldData.find(f => 
      f.name && f.name.toLowerCase() === fieldName.toLowerCase()
    );
    return field && field.values && field.values.length > 0 ? field.values[0] : null;
  }

  // Extract all custom fields
  extractCustomFields(fieldData) {
    const standardFields = ['full_name', 'first_name', 'last_name', 'name', 'email', 'phone_number', 'phone'];
    const customFields = {};
    
    fieldData.forEach(field => {
      if (field.name && !standardFields.includes(field.name.toLowerCase())) {
        customFields[field.name] = field.values && field.values.length > 0 ? field.values[0] : null;
      }
    });
    
    return customFields;
  }

  // Get campaigns
  async getCampaigns(adAccountId) {
    try {
      const url = `${this.baseUrl}/${adAccountId}/campaigns`;
      const response = await axios.get(url, {
        params: { 
          access_token: this.accessToken,
          fields: 'id,name,status,objective,created_time'
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error.response?.data || error.message);
      throw new Error('Failed to fetch campaigns');
    }
  }
}

module.exports = FacebookService;
