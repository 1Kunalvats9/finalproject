# Email Setup Guide for ApniDukaan

This guide explains how to configure SMTP settings to enable the contact form to send emails.

## What is SMTP?

SMTP (Simple Mail Transfer Protocol) is the standard protocol for sending emails. The contact form uses Nodemailer to send emails through an SMTP server.

## Required Environment Variables

You need to set these 5 environment variables:

1. **SMTP_HOST** - The SMTP server address
2. **SMTP_PORT** - The port number (usually 587 or 465)
3. **SMTP_USER** - Your email address
4. **SMTP_PASS** - Your email password or app password
5. **SMTP_FROM** - The "from" email address (usually same as SMTP_USER)

## Setup Instructions

### Step 1: Create Environment File

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your email credentials

### Step 2: Choose Your Email Provider

#### Option A: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Add to `.env.local`**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=your-email@gmail.com
   SMTP_SECURE=false
   ```

#### Option B: Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
SMTP_SECURE=false
```

#### Option C: Custom SMTP Server

If you have your own email server or use a service like SendGrid, Mailgun, etc.:

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
```

### Step 3: Restart Your Development Server

After setting up `.env.local`, restart your Next.js dev server:

```bash
npm run dev
```

## Testing

1. Fill out the contact form on your website
2. Submit the form
3. Check your email inbox (1kvats9@gmail.com) for the message

## Troubleshooting

### "Mail service not configured" Error
- Make sure `.env.local` exists and has all required variables
- Restart your dev server after creating/modifying `.env.local`
- Check for typos in variable names (they must be exact)

### "Authentication failed" Error
- For Gmail: Make sure you're using an App Password, not your regular password
- Check that 2FA is enabled on your Google account
- Verify your email and password are correct

### "Connection timeout" Error
- Check your firewall/network settings
- Verify SMTP_HOST and SMTP_PORT are correct
- Try changing SMTP_SECURE to `true` if using port 465

## Security Notes

⚠️ **Important**: 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Use App Passwords instead of your main email password
- For production, use environment variables provided by your hosting platform (Vercel, Netlify, etc.)

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Go to your hosting platform's dashboard
2. Navigate to Environment Variables settings
3. Add all 5 SMTP variables
4. Redeploy your application

The variables will be automatically available to your API routes.

