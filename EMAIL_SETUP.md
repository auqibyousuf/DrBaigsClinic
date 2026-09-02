# Email Setup Guide

This guide explains how to set up email functionality for appointment bookings.

## Overview

The appointment booking system uses **Resend** to send emails directly when users book appointments. The email subject and body can be customized through the admin panel.

## Setup Instructions

### 1. Get Resend API Key

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Navigate to **API Keys** in your dashboard
4. Create a new API key
5. Copy the API key (starts with `re_`)

### 2. Configure Environment Variables

Add these to your `.env.local` file (for local development):

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
APPOINTMENT_EMAIL=your-email@example.com
```

**Important Notes:**
- `RESEND_FROM_EMAIL`: Must be a verified domain in Resend, or use `onboarding@resend.dev` for testing
- `APPOINTMENT_EMAIL`: Fallback email if not set in CMS (optional)
- `RESEND_API_KEY`: Your Resend API key (required)

### 3. For Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the same variables:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `APPOINTMENT_EMAIL` (optional)

### 4. Verify Your Domain (Production)

For production, you need to verify your domain in Resend:

1. Go to Resend Dashboard → **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records provided by Resend
4. Wait for verification (usually a few minutes)
5. Use your verified domain email as `RESEND_FROM_EMAIL`

## Customizing Email Templates

### Through Admin Panel

1. Log in to `/admin`
2. Navigate to **Contact Section**
3. Edit the following fields:
   - **Email Subject**: Customize the subject line
   - **Email Body Template**: Customize the email body

### Available Placeholders

Use these placeholders in your email subject and body:

- `{name}` - Customer's full name
- `{email}` - Customer's email address
- `{phone}` - Customer's phone number
- `{service}` - Selected service name
- `{message}` - Customer's message (if provided)
- `{date}` - Submission date and time

### Example Email Template

**Subject:**
```
New Appointment Request - {service}
```

**Body:**
```
New Appointment Booking Request

Name: {name}
Email: {email}
Phone: {phone}
Service: {service}
Message: {message}

Submitted on: {date}

Please contact the customer to confirm the appointment.
```

## Testing

1. Fill out the appointment form on your website
2. Submit the form
3. Check the recipient email inbox
4. Verify the email was received with correct formatting

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly
2. **Check From Email**: Ensure `RESEND_FROM_EMAIL` is verified in Resend
3. **Check Console**: Look for error messages in browser console and server logs
4. **Check Resend Dashboard**: View email logs in Resend dashboard

### Common Errors

- **"Email service not configured"**: `RESEND_API_KEY` is missing
- **"Invalid API key"**: API key is incorrect or expired
- **"Domain not verified"**: `RESEND_FROM_EMAIL` domain needs verification

## Alternative Email Services

If you prefer a different email service, you can modify `/app/api/appointment/route.ts` to use:
- Nodemailer (with Gmail, SMTP, etc.)
- SendGrid
- Mailgun
- AWS SES

## Security Notes

- Never commit `.env.local` to git (already in `.gitignore`)
- Keep your API keys secure
- Use environment variables in production
- Regularly rotate API keys
