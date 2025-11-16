# Testing Google Sheets Integration

## How to Test if Google Sheets is Saving Data

### Method 1: Using the Test Function (Recommended)

1. **Open your website** (or `index.html` in browser)

2. **Open Browser Developer Console**:
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Or `Cmd+Option+I` (Mac)
   - Click on the **"Console"** tab

3. **Run the Test Function**:
   ```javascript
   testGoogleSheets()
   ```

4. **Check the Console Output**:
   - ✅ **Success**: You'll see "✅ Test successful! Check your Google Sheet..."
   - ❌ **Error**: You'll see error messages explaining what went wrong

5. **Check Your Google Sheet**:
   - Open your Google Sheet
   - Look for a new row with:
     - Email: `test@example.com`
     - Action: `Test`
     - Name: `Test User`

---

### Method 2: Test by Accepting Cookies

1. **Clear Browser Storage**:
   - Open Developer Console (F12)
   - Go to **Application** tab → **Local Storage**
   - Clear all items for your site

2. **Reload the Page**

3. **Accept Cookies**:
   - Click "Accepter & Continuer" button

4. **Check Console**:
   - Look for messages like:
     - `✅ Data successfully sent to Google Sheets:`
     - Or `⚠️ Data sent with no-cors mode`

5. **Check Your Google Sheet**:
   - Open your Google Sheet
   - You should see a new row with the user's data

---

### Method 3: Manual Test in Console

1. **Open Console** (F12)

2. **Create Test Data**:
   ```javascript
   const testData = {
       timestamp: new Date().toISOString(),
       email: 'manual-test@example.com',
       name: 'Manual Test',
       phone: '1234567890',
       category: 'Test Category',
       action: 'Manual Test',
       cookiesAccepted: true
   };
   ```

3. **Send Test Data**:
   ```javascript
   CookieManager.sendToGoogleSheets(testData).then(result => {
       if (result) {
           console.log('✅ Success!');
       } else {
           console.log('❌ Failed!');
       }
   });
   ```

4. **Check Your Google Sheet** for the new entry

---

## Troubleshooting

### ✅ If Test is Successful:
- Your Google Sheets integration is working!
- Data will be saved automatically when users accept cookies
- Check your sheet regularly to see collected data

### ❌ If Test Fails:

#### Error: "Google Sheets URL not configured"
- **Fix**: Make sure `GOOGLE_SCRIPT_URL` in `script.js` is set to your Web App URL
- Example: `const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';`

#### Error: "CORS policy error" or "Network error"
- **Fix**: Make sure your Google Apps Script Web App is deployed with:
  - Execute as: **"Me"**
  - Who has access: **"Anyone"**

#### Error: "Failed to forward request" or 404
- **Fix**: 
  1. Check that your Google Apps Script is deployed as Web App
  2. Verify the Web App URL is correct
  3. Make sure the script has access to your Google Sheet

#### Error: "Permission denied" or "Access denied"
- **Fix**:
  1. Go to Google Apps Script editor
  2. Click **"Run"** → **"doPost"** (or any function)
  3. Authorize the script to access your Google Sheet
  4. Re-deploy the Web App

#### No Data in Sheet:
- **Check**: 
  1. Is the Sheet ID correct in `google-apps-script.js`?
  2. Does the script have permission to edit the sheet?
  3. Try running `createHeaders()` function in Apps Script editor

---

## What to Look For in Your Google Sheet

When data is successfully saved, you should see:

1. **First Row**: Column headers (Timestamp, Date, Email, etc.)
2. **New Rows**: Each user who accepts cookies creates a new row
3. **Test Entries**: Look for rows with `test@example.com` or `action: Test`

### Expected Columns (60+):
- Timestamp, Date, Time
- Email, Name, Phone
- Selected Plan details
- Location (City, Country, IP, GPS)
- Browser fingerprint
- User behavior (clicks, scrolls, time)
- Interest score and predicted intent
- Device information
- And much more!

---

## Quick Checklist

- [ ] Google Sheet created
- [ ] Google Apps Script created and code pasted
- [ ] Sheet ID set in `google-apps-script.js`
- [ ] Web App deployed (Execute as: Me, Access: Anyone)
- [ ] Web App URL copied to `script.js` as `GOOGLE_SCRIPT_URL`
- [ ] Script authorized to access Sheet
- [ ] Test function run successfully
- [ ] Data appears in Google Sheet

---

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify all URLs are correct (no extra spaces or characters)
3. Make sure your Google Apps Script is published (not just saved)
4. Check that the Sheet ID matches your Google Sheet

Good luck! 🚀

