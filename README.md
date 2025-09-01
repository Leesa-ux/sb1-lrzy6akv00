# Waitlist Landing Page

A modern waitlist landing page with SMS verification and Google Sheets integration.

## Features

- 📱 SMS verification using Brevo or Twilio
- 📊 Lead management with Google Sheets integration
- 🔗 Referral system with unique codes
- ⏰ Time-limited verification
- 📱 Fully responsive design

## Setup

1. **Environment Variables**
   
   Copy `.env.example` to `.env.local` and configure your API keys:

   ```bash
   cp .env.example .env.local
   ```

2. **SMS Service Configuration (choose one)**

   **Option A: Brevo (Sendinblue)**
   - Sign up at [Brevo](https://www.brevo.com/)
   - Get your API key from the dashboard
   - Set `BREVO_API_KEY` and `BREVO_SENDER` in your `.env.local`

   **Option B: Twilio**
   - Sign up at [Twilio](https://www.twilio.com/)
   - Get your Account SID, Auth Token, and phone number
   - Set the Twilio variables in your `.env.local`

3. **Google Sheets Integration (choose one)**

   **Option A: Google Apps Script (Recommended)**
   - Create a new Google Spreadsheet
   - Go to Extensions > Apps Script
   - Create a script to handle POST requests and save data to your sheet
   - Deploy as a web app and get the webhook URL
   - Set `GOOGLE_SHEETS_WEBHOOK_URL` in your `.env.local`

   **Option B: Google Sheets API**
   - Enable Google Sheets API in Google Cloud Console
   - Get an API key
   - Set `GOOGLE_SHEETS_API_KEY` and `GOOGLE_SHEETS_ID` in your `.env.local`

## Development

```bash
npm run dev
```

Add `?dev=1` to the URL to skip SMS verification during development.

## API Endpoints

- `POST /api/send-sms` - Sends SMS verification code
- `POST /api/verify-code` - Verifies SMS code
- `POST /api/save-lead` - Saves lead to Google Sheets

## Google Apps Script Example

Here's a sample Google Apps Script code for the webhook:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    data.timestamp,
    data.email,
    data.phone,
    data.role,
    data.referralCode,
    data.status,
    data.source
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ok: true}));
}
```