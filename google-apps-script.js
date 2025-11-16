/**
 * Google Apps Script for Google Forms/Sheets Integration
 * 
 * OPTION 1: Link to Google Form Response Sheet
 * 1. Create a Google Form (https://forms.google.com)
 * 2. In the Form, click "Responses" tab → "Link to Sheets" → Create new spreadsheet
 * 3. Open the linked Sheet and copy the Spreadsheet ID from URL (between /d/ and /edit)
 * 4. Replace 'YOUR_SPREADSHEET_ID' below with your Spreadsheet ID
 * 
 * OPTION 2: Use Direct Google Sheet
 * 1. Create a new Google Sheet
 * 2. Copy the Spreadsheet ID from the URL (the long string between /d/ and /edit)
 * 3. Replace 'YOUR_SPREADSHEET_ID' below with your Spreadsheet ID
 * 
 * DEPLOYMENT:
 * 5. Go to https://script.google.com/
 * 6. Click "New Project"
 * 7. Paste this code
 * 8. Replace 'YOUR_SPREADSHEET_ID' with your Sheet/Form ID
 * 9. Click "Deploy" → "New deployment"
 * 10. Choose type: "Web app"
 * 11. Execute as: "Me"
 * 12. Who has access: "Anyone" (or "Anyone with Google account")
 * 13. Click "Deploy"
 * 14. Copy the Web App URL and paste it in script.js as GOOGLE_SCRIPT_URL
 */

// Replace this with your Google Sheet ID (from Form's response sheet or a regular Sheet)
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    // Parse the JSON data from the request
    const data = JSON.parse(e.postData.contents);
    
    // Prepare row data - comprehensive data collection
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.date || '',
      data.time || '',
      data.email || '',
      data.name || '',
      data.phone || '',
      data.selectedPlan || data.category || '',
      data.selectedPlanName || '',
      data.selectedPlanPrice || '',
      data.planSelectedDate || '',
      data.action || '',
      data.cookiesAccepted || false,
      // Location
      data.latitude || '',
      data.longitude || '',
      data.city || '',
      data.region || '',
      data.country || '',
      data.postalCode || '',
      data.address || '',
      data.ip || '',
      data.timezone || '',
      // Browser & Device
      data.userAgent || '',
      data.language || '',
      data.screenResolution || '',
      data.referrer || '',
      data.platform || '',
      data.deviceMemory || '',
      data.hardwareConcurrency || '',
      data.maxTouchPoints || '',
      data.pixelRatio || '',
      // Fingerprint
      data.canvasFingerprint || '',
      data.webglVendor || '',
      data.webglRenderer || '',
      data.audioFingerprint || '',
      data.availableFonts || '',
      data.plugins || '',
      data.mimeTypes || '',
      data.webdriver || false,
      // Behavior
      data.clicksCount || 0,
      data.clicksData || '',
      data.scrollsCount || 0,
      data.scrollMaxDepth || 0,
      data.timeOnPageSeconds || 0,
      data.sectionsViewedCount || 0,
      data.sectionsViewed || '',
      data.mouseMovementsCount || 0,
      data.keystrokeCount || 0,
      data.linksClickedCount || 0,
      data.linksClicked || '',
      data.formsInteractedCount || 0,
      data.hoveredElementsCount || 0,
      data.hoveredElements || '',
      data.pageFocusTime || 0,
      // Social Media
      data.facebookDetected || false,
      data.twitterDetected || false,
      data.instagramDetected || false,
      data.linkedinDetected || false,
      // Predictions
      data.interestScore || 0,
      data.predictedIntent || '',
      data.engagementLevel || '',
      // Battery & Media
      data.batteryLevel || '',
      data.batteryCharging || false,
      data.videoInputs || 0,
      data.audioInputs || 0,
      data.audioOutputs || 0,
      // Session
      data.sessionId || ''
    ];
    
    // Add headers if this is the first row
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp', 'Date', 'Time', 'Email', 'Name', 'Phone',
        'Selected Plan Category', 'Selected Plan Name', 'Selected Plan Price', 'Plan Selected Date',
        'Action', 'Cookies Accepted',
        'Latitude', 'Longitude', 'City', 'Region', 'Country', 'Postal Code', 'Address', 'IP Address', 'Timezone',
        'User Agent', 'Language', 'Screen Resolution', 'Referrer', 'Platform', 'Device Memory', 'Hardware Concurrency', 'Max Touch Points', 'Pixel Ratio',
        'Canvas Fingerprint', 'WebGL Vendor', 'WebGL Renderer', 'Audio Fingerprint', 'Available Fonts', 'Plugins', 'MIME Types Count', 'Webdriver',
        'Clicks Count', 'Clicks Data', 'Scrolls Count', 'Scroll Max Depth %', 'Time On Page (sec)', 'Sections Viewed Count', 'Sections Viewed',
        'Mouse Movements Count', 'Keystroke Count', 'Links Clicked Count', 'Links Clicked', 'Forms Interacted Count',
        'Hovered Elements Count', 'Hovered Elements', 'Page Focus Time (sec)',
        'Facebook Detected', 'Twitter Detected', 'Instagram Detected', 'LinkedIn Detected',
        'Interest Score', 'Predicted Intent', 'Engagement Level',
        'Battery Level', 'Battery Charging', 'Video Inputs', 'Audio Inputs', 'Audio Outputs',
        'Session ID'
      ];
      sheet.appendRow(headers);
    }
    
    // Append the data row
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function (optional - run this to create headers)
function createHeaders() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp', 'Date', 'Time', 'Email', 'Name', 'Phone',
      'Selected Plan Category', 'Selected Plan Name', 'Selected Plan Price', 'Plan Selected Date',
      'Action', 'Cookies Accepted',
      'Latitude', 'Longitude', 'City', 'Region', 'Country', 'Postal Code', 'Address', 'IP Address', 'Timezone',
      'User Agent', 'Language', 'Screen Resolution', 'Referrer', 'Platform', 'Device Memory', 'Hardware Concurrency', 'Max Touch Points', 'Pixel Ratio',
      'Canvas Fingerprint', 'WebGL Vendor', 'WebGL Renderer', 'Audio Fingerprint', 'Available Fonts', 'Plugins', 'MIME Types Count', 'Webdriver',
      'Clicks Count', 'Clicks Data', 'Scrolls Count', 'Scroll Max Depth %', 'Time On Page (sec)', 'Sections Viewed Count', 'Sections Viewed',
      'Mouse Movements Count', 'Keystroke Count', 'Links Clicked Count', 'Links Clicked', 'Forms Interacted Count',
      'Hovered Elements Count', 'Hovered Elements', 'Page Focus Time (sec)',
      'Facebook Detected', 'Twitter Detected', 'Instagram Detected', 'LinkedIn Detected',
      'Interest Score', 'Predicted Intent', 'Engagement Level',
      'Battery Level', 'Battery Charging', 'Video Inputs', 'Audio Inputs', 'Audio Outputs',
      'Session ID'
    ];
    sheet.appendRow(headers);
  }
}

