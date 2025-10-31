const { Parser } = require('json2csv');

function exportToCSV(leads) {
  try {
    // Define fields for CSV
    const fields = [
      { label: 'Lead ID', value: 'id' },
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
      { label: 'Created Time', value: 'createdTime' },
      { label: 'Form ID', value: 'formId' },
      { label: 'Imported At', value: 'importedAt' }
    ];

    // Add custom fields if they exist
    if (leads.length > 0 && leads[0].customFields) {
      const customFieldKeys = Object.keys(leads[0].customFields);
      customFieldKeys.forEach(key => {
        fields.push({
          label: key,
          value: `customFields.${key}`
        });
      });
    }

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(leads);
    
    console.log(`✅ Converted ${leads.length} leads to CSV`);
    return csv;
  } catch (error) {
    console.error('Error converting to CSV:', error.message);
    throw new Error('Failed to export CSV: ' + error.message);
  }
}

function exportToJSON(leads) {
  try {
    return JSON.stringify(leads, null, 2);
  } catch (error) {
    console.error('Error converting to JSON:', error.message);
    throw new Error('Failed to export JSON: ' + error.message);
  }
}

module.exports = {
  exportToCSV,
  exportToJSON
};
