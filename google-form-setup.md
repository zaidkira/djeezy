# Google Form Setup Instructions

## Option 1: Create Google Form and Link to Script

### Step 1: Create Google Form
1. Go to https://forms.google.com
2. Create a new form
3. Add these fields (optional - data will be collected automatically):
   - Email (Short answer)
   - Phone (Short answer)
   - Selected Plan (Multiple choice)
   - Any other fields you want

### Step 2: Link Form to Sheet
1. In your Google Form, click the **"Responses"** tab
2. Click **"Link to Sheets"** → **"Create new spreadsheet"**
3. This creates a Google Sheet where all responses are saved
4. Note: The Sheet ID will be in the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

### Step 3: Use the Linked Sheet ID
- Use the Sheet ID from the Form's response sheet in your Google Apps Script
- All data will be saved to this sheet (which is linked to your Form)

---

## Option 2: Use Existing Google Sheet (Recommended)

### Step 1: Create Google Sheet
1. Go to https://sheets.google.com
2. Create a new spreadsheet
3. The Sheet ID is in the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

### Step 2: Deploy Apps Script
1. Go to https://script.google.com/
2. Click **"New Project"**
3. Copy code from `google-apps-script.js`
4. Replace `YOUR_SPREADSHEET_ID` with your Sheet ID
5. Click **"Deploy"** → **"New deployment"**
6. Choose type: **"Web app"**
7. Execute as: **"Me"**
8. Who has access: **"Anyone"**
9. Click **"Deploy"**
10. Copy the **Web App URL**

### Step 3: Update script.js
1. Open `script.js`
2. Find `const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`
3. Replace with your Web App URL from Step 2

---

## Data Collection

The script automatically collects and saves:
- ✅ Email, Phone, Name
- ✅ Selected Plan details
- ✅ Location (GPS, IP, Address)
- ✅ Browser fingerprinting
- ✅ User behavior (clicks, scrolls, time on page)
- ✅ Device information
- ✅ Interest score and predicted intent
- ✅ Social media detection
- ✅ 60+ data points total

All data will be automatically saved to your Google Sheet when users accept cookies!

