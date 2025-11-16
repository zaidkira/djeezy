# Setup Guide: Using Google Sheet for Data Collection

## Step-by-Step Instructions

### Step 1: Create a New Google Sheet

1. Go to **https://sheets.google.com**
2. Click **"Blank"** to create a new spreadsheet
3. Give it a name (e.g., "Cookie Collection Data" or "Djezzy User Data")

### Step 2: Get Your Sheet ID

1. Look at the URL in your browser's address bar
2. It will look like: `https://docs.google.com/spreadsheets/d/1ABC123xyz456DEF789/edit#gid=0`
3. Copy the part between `/d/` and `/edit`
   - Example: If URL is `https://docs.google.com/spreadsheets/d/1ABC123xyz456DEF789/edit`
   - Your Sheet ID is: `1ABC123xyz456DEF789`

### Step 3: Create Google Apps Script

1. Go to **https://script.google.com/**
2. Click **"New Project"**
3. Delete any existing code in the editor
4. Copy **ALL** the code from `google-apps-script.js` file
5. Paste it into the Google Apps Script editor
6. Find this line: `const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';`
7. Replace `YOUR_SPREADSHEET_ID` with your Sheet ID from Step 2
   - Example: `const SPREADSHEET_ID = '1ABC123xyz456DEF789';`

### Step 4: Deploy as Web App

1. Click **"Deploy"** button (top right) → **"New deployment"**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **"Web app"**
4. Fill in the settings:
   - **Description**: "Cookie Data Collection" (optional)
   - **Execute as**: **"Me"**
   - **Who has access**: **"Anyone"** (this allows your website to send data)
5. Click **"Deploy"**
6. **IMPORTANT**: Click **"Authorize access"** and allow permissions
7. Copy the **"Web App URL"** (it will look like: `https://script.google.com/macros/s/ABC.../exec`)

### Step 5: Update Your Website Code

1. Open `script.js` file in your project
2. Find this line: `const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the Web App URL from Step 4
   - Example: `const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/ABC.../exec';`

### Step 6: Test It

1. Save all files
2. Open your website
3. Accept cookies
4. Check your Google Sheet - you should see a new row with all the collected data!

---

## What Data Will Be Saved

Your Google Sheet will automatically create columns and save:

### User Information
- Email, Name, Phone
- Selected Plan (Category, Name, Price, Date)

### Location Data
- GPS Coordinates (Latitude, Longitude)
- City, Region, Country
- Full Address, Postal Code
- IP Address, Timezone

### Browser & Device
- User Agent, Language
- Screen Resolution, Window Size
- Platform, Device Memory
- Hardware Info

### Browser Fingerprinting
- Canvas Fingerprint
- WebGL Vendor/Renderer
- Audio Fingerprint
- Available Fonts
- Plugins

### User Behavior
- Clicks (Count & Data)
- Scrolls (Count & Max Depth)
- Time on Page
- Sections Viewed
- Mouse Movements
- Keystrokes
- Links Clicked
- Forms Interacted
- Hovered Elements

### Predictions
- Interest Score (0-100)
- Predicted Intent
- Engagement Level (High/Medium/Low)

### Social Media
- Facebook, Twitter, Instagram, LinkedIn detection

### Battery & Media
- Battery Level, Charging Status
- Video/Audio Inputs/Outputs

**Total: 60+ data points per user!**

---

## Troubleshooting

### Data not appearing in Sheet?
1. Check that `GOOGLE_SCRIPT_URL` in `script.js` matches your Web App URL exactly
2. Make sure Web App is deployed with "Anyone" access
3. Check browser console (F12) for errors
4. Verify Sheet ID is correct in Google Apps Script

### Permission Errors?
1. Re-authorize the Web App in Google Apps Script
2. Make sure "Execute as: Me" is selected
3. Make sure "Who has access: Anyone" is selected

### Want to format the Sheet?
- Headers will be created automatically on the first data submission
- You can freeze the first row: View → Freeze → 1 row
- You can format columns as needed (dates, numbers, etc.)

---

## Next Steps

Once set up, every user who accepts cookies will have their data automatically saved to your Google Sheet!

You can:
- Analyze user behavior patterns
- Track popular plans
- Identify high-interest users
- Export data for further analysis
- Create charts and graphs from the data

