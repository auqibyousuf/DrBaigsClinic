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
    const cmsData = getCMSData();
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
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: recipientEmail,
      subject: emailSubject,
      text: emailBody,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
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
