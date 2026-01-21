import { NextResponse } from 'next/server';

export async function GET() {
  const hasResendKey = !!process.env.RESEND_API_KEY;
  const hasSiteUrl = !!process.env.NEXT_PUBLIC_SITE_URL;
  const hasAdminEmail = !!process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return NextResponse.json({
    status: 'Email API is running',
    environment: {
      RESEND_API_KEY: hasResendKey ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SITE_URL: hasSiteUrl ? '✅ Set' : '❌ Missing', 
      NEXT_PUBLIC_ADMIN_EMAIL: hasAdminEmail ? '✅ Set' : '❌ Missing',
    },
    resendKeyPreview: hasResendKey ? process.env.RESEND_API_KEY.substring(0, 8) + '...' : 'Not set',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'Not set',
    adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'Not set',
  });
}
