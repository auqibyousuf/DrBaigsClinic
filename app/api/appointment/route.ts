import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getCMSData } from '@/lib/cms';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, service, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !service) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get CMS data for email configuration
    const cmsData = await getCMSData();
    const contactData = cmsData.contact || {};

    // Get email configuration from CMS
    const recipientEmail = contactData.email || process.env.APPOINTMENT_EMAIL || 'yauqib@gmail.com';
    const emailSubjectTemplate = contactData.emailSubject || 'New Appointment Booking Request';
    const emailBodyTemplate = contactData.emailBody ||
      `New Appointment Booking Request\n\n` +
      `Name: {name}\n` +
      `Email: {email}\n` +
      `Phone: {phone}\n` +
      `Service: {service}\n` +
      `Message: {message}\n\n` +
      `Submitted on: {date}`;

    // Replace placeholders in email subject
    const emailSubject = emailSubjectTemplate
      .replace(/{name}/g, name)
      .replace(/{email}/g, email)
      .replace(/{phone}/g, phone)
      .replace(/{service}/g, service)
      .replace(/{message}/g, message || 'No message provided')
      .replace(/{date}/g, new Date().toLocaleString());

    // Replace placeholders in email body
    const emailBody = emailBodyTemplate
      .replace(/{name}/g, name)
      .replace(/{email}/g, email)
      .replace(/{phone}/g, phone)
      .replace(/{service}/g, service)
      .replace(/{message}/g, message || 'No message provided')
      .replace(/{date}/g, new Date().toLocaleString());

    // Send email using Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return NextResponse.json(
        { error: 'Email service not configured. Please set RESEND_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // Validate email addresses
    if (!fromEmail || !fromEmail.includes('@')) {
      console.error('Invalid RESEND_FROM_EMAIL:', fromEmail);
      return NextResponse.json(
        { error: 'Invalid from email address. Use onboarding@resend.dev for testing or a verified domain.' },
        { status: 500 }
      );
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.error('Invalid recipient email:', recipientEmail);
      return NextResponse.json(
        { error: 'Invalid recipient email address.' },
        { status: 500 }
      );
    }

    console.log('Attempting to send email:', { from: fromEmail, to: recipientEmail, subject: emailSubject });

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: emailSubject,
      text: emailBody,
    });

    if (error) {
      console.error('Resend API error:', JSON.stringify(error, null, 2));

      // Provide more helpful error messages
      let errorMessage = 'Failed to send email';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: 'Check server logs for more details. Make sure RESEND_API_KEY is valid and RESEND_FROM_EMAIL is verified in Resend.',
          resendError: error
        },
        { status: 500 }
      );
    }

    console.log('Admin email sent successfully:', data?.id);

    // Send thank you email to customer
    const customerEmailSubjectTemplate = contactData.customerEmailSubject || 'Thank You for Booking Your Appointment';
    const customerEmailBodyTemplate = contactData.customerEmailBody ||
      `Dear {name},\n\n` +
      `Thank you for booking an appointment with us!\n\n` +
      `We have received your appointment request for: {service}\n\n` +
      `Our team will contact you soon to confirm your appointment.\n\n` +
      `Best regards,\nDr Baig's Clinic`;

    const customerEmailSubject = customerEmailSubjectTemplate
      .replace(/{name}/g, name)
      .replace(/{email}/g, email)
      .replace(/{phone}/g, phone)
      .replace(/{service}/g, service)
      .replace(/{message}/g, message || 'No message provided')
      .replace(/{date}/g, new Date().toLocaleString());

    const customerEmailBody = customerEmailBodyTemplate
      .replace(/{name}/g, name)
      .replace(/{email}/g, email)
      .replace(/{phone}/g, phone)
      .replace(/{service}/g, service)
      .replace(/{message}/g, message || 'No message provided')
      .replace(/{date}/g, new Date().toLocaleString());

    // Send customer thank you email
    if (email && email.includes('@')) {
      try {
        const customerEmailResult = await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: customerEmailSubject,
          text: customerEmailBody,
        });

        if (customerEmailResult.error) {
          console.error('Failed to send customer email:', customerEmailResult.error);
          // Don't fail the request if customer email fails
        } else {
          console.log('Customer thank you email sent successfully:', customerEmailResult.data?.id);
        }
      } catch (customerEmailError) {
        console.error('Error sending customer email:', customerEmailError);
        // Don't fail the request if customer email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment request submitted successfully',
      id: data?.id,
    });
  } catch (error) {
    console.error('Appointment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
