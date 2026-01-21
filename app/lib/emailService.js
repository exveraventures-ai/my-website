// Email service for sending notifications using server-side API
// Provides clean, professional email templates for user and admin notifications

/**
 * Send admin notification when a new access request is received
 */
export const sendAdminNotificationEmail = async (requestData, adminEmail) => {
  try {
    console.log('📧 [Admin Email] Starting...')
    console.log('Request data:', requestData)
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'admin_notification',
        data: requestData
      }),
    });

    console.log('Response status:', response.status)
    const result = await response.json();
    console.log('Response data:', result)

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    console.log('✓ Admin notification email sent successfully! ID:', result.id)
    return { success: true, id: result.id }
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send confirmation email to user when they request access
 * NOTE: Currently disabled - users only get email when approved
 */
export const sendAccessRequestEmail = async (userData) => {
  // Not implemented - users get email when approved, not when requesting
  return { success: true, skipped: true }
}

/**
 * Send approval/welcome email when user is approved
 */
export const sendApprovalEmail = async (userData) => {
  try {
    console.log('📧 [Approval Email] Starting...')
    console.log('User data:', userData)
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'approval',
        data: userData
      }),
    });

    console.log('Response status:', response.status)
    const result = await response.json();
    console.log('Response data:', result)

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    console.log('✓ Approval email sent successfully! ID:', result.id)
    return { success: true, id: result.id }
  } catch (error) {
    console.error('❌ Error sending approval email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Initialize email service (no-op now that we use server-side emails)
 */
export const initializeEmailJS = () => {
  console.log('✓ Email service ready (using server-side API)')
}
