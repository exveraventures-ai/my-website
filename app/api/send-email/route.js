import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Check if Resend is configured
    if (!resend) {
      console.error('Resend API key not configured');
      return NextResponse.json({ 
        error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.' 
      }, { status: 500, headers });
    }

    const body = await request.json();
    const { type, data } = body;

    let emailContent;
    let subject;
    let to;

    if (type === 'admin_notification') {
      // Admin notification email
      to = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'exveraventures@gmail.com';
      subject = `New Access Request: ${data.first_name} ${data.last_name}`;
      emailContent = generateAdminNotificationHTML(data);
      console.log('Sending admin notification to:', to);
    } else if (type === 'approval') {
      // User approval/welcome email
      to = data.email;
      subject = '🎉 Welcome to Burnout IQ - Your access is approved!';
      emailContent = generateApprovalHTML(data);
      console.log('Sending approval email to:', to);
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'Burnout IQ <onboarding@resend.dev>', // Use your verified domain later
      to: [to],
      subject: subject,
      html: emailContent,
    });

    if (error) {
      console.error('Resend error:', error);
      console.error('Failed to send to:', to);
      console.error('Email type:', type);
      return NextResponse.json({ error: error.message }, { status: 500, headers });
    }

    console.log('✅ Email sent successfully!', { id: emailData.id, to, type });
    return NextResponse.json({ success: true, id: emailData.id }, { headers });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function generateAdminNotificationHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 600px;">
              <tr>
                <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e7;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1d1d1f;">
                    Burnout <span style="color: #06B6D4; font-weight: 800;">IQ</span>
                  </h1>
                  <p style="margin: 12px 0 0; font-size: 16px; color: #6e6e73;">Admin Notification</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #1d1d1f;">
                    New Access Request Received
                  </h2>
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                    A new user has requested access to Burnout IQ:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                    <tr><td style="padding-bottom: 12px;"><strong style="color: #6e6e73; font-size: 14px;">Name</strong><p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f; font-weight: 600;">${data.first_name} ${data.last_name}</p></td></tr>
                    <tr><td style="padding-bottom: 12px;"><strong style="color: #6e6e73; font-size: 14px;">Email</strong><p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f;">${data.email}</p></td></tr>
                    <tr><td style="padding-bottom: 12px;"><strong style="color: #6e6e73; font-size: 14px;">Position</strong><p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f;">${data.position}</p></td></tr>
                    <tr><td style="padding-bottom: 12px;"><strong style="color: #6e6e73; font-size: 14px;">Company</strong><p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f;">${data.company}</p></td></tr>
                    <tr><td style="padding-bottom: 12px;"><strong style="color: #6e6e73; font-size: 14px;">Region</strong><p style="margin: 4px 0 0; font-size: 16px; color: #1d1d1f;">${data.region}</p></td></tr>
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app'}/admin" style="display: inline-block; padding: 16px 32px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                          Review Request →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateApprovalHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 600px;">
              <tr>
                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%); border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0 0 12px; font-size: 32px; font-weight: 700; color: #ffffff;">
                    Burnout <span style="font-weight: 800;">IQ</span>
                  </h1>
                  <p style="margin: 0; font-size: 18px; color: rgba(255,255,255,0.9); font-weight: 500;">Welcome aboard! 🎉</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 600; color: #1d1d1f;">
                    Great news, ${data.first_name}!
                  </h2>
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                    Your access request has been approved! Follow these steps to set up your account:
                  </p>
                  <div style="margin-bottom: 32px; padding: 28px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                    <h3 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #92400e;">🔐 Set Up Your Account</h3>
                    <ol style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.8; color: #78350f;">
                      <li>Go to the login page by clicking below</li>
                      <li>Click "Forgot your password?"</li>
                      <li>Enter your email: ${data.email}</li>
                      <li>Check your email for the password reset link</li>
                      <li>Create your password and log in!</li>
                    </ol>
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app'}/login" style="display: inline-block; padding: 18px 40px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 17px; font-weight: 600;">
                          Get Started - Set Up Password →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
