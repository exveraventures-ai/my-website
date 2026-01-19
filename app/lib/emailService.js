// Email service for sending notifications using EmailJS
// Provides clean, professional email templates for user and admin notifications

/**
 * Send admin notification when a new access request is received
 */
export const sendAdminNotificationEmail = async (requestData, adminEmail) => {
  try {
    if (typeof window !== 'undefined' && window.emailjs) {
      const emailjs = window.emailjs
      
      const templateParams = {
        to_email: adminEmail || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'alex.f.nash@gmail.com',
        to_name: 'Admin',
        user_name: `${requestData.first_name} ${requestData.last_name}`,
        user_email: requestData.email,
        position: requestData.position || 'N/A',
        company: requestData.company || 'N/A',
        firm_type: requestData.firm_type || 'N/A',
        region: requestData.region || 'N/A',
        request_date: new Date(requestData.created_at || new Date()).toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        admin_url: typeof window !== 'undefined' ? `${window.location.origin}/admin` : 'https://your-domain.com/admin'
      }

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ADMIN_NOTIFICATION_ID || 'YOUR_TEMPLATE_ADMIN_NOTIFICATION_ID',
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'
      )

      console.log('Admin notification email sent')
      return { success: true }
    } else {
      console.warn('EmailJS not configured - skipping admin notification email')
      return { success: false, error: 'EmailJS not configured' }
    }
  } catch (error) {
    console.error('Error sending admin notification email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send confirmation email to user when they request access
 */
export const sendAccessRequestEmail = async (userData) => {
  try {
    if (typeof window !== 'undefined' && window.emailjs) {
      const emailjs = window.emailjs
      
      const templateParams = {
        to_email: userData.email,
        to_name: `${userData.first_name} ${userData.last_name}`,
        user_name: `${userData.first_name} ${userData.last_name}`,
        user_email: userData.email,
        position: userData.position || 'N/A',
        company: userData.company || 'N/A',
        region: userData.region || 'N/A',
        login_url: typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://your-domain.com/login',
        features_url: typeof window !== 'undefined' ? `${window.location.origin}/landing#features` : 'https://your-domain.com/landing#features'
      }

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_REQUEST_ID || 'YOUR_TEMPLATE_REQUEST_ID',
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'
      )

      console.log('Access request confirmation email sent')
      return { success: true }
    } else {
      console.warn('EmailJS not configured - skipping email')
      return { success: false, error: 'EmailJS not configured' }
    }
  } catch (error) {
    console.error('Error sending access request email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send approval/welcome email when user is approved
 */
export const sendApprovalEmail = async (userData) => {
  try {
    if (typeof window !== 'undefined' && window.emailjs) {
      const emailjs = window.emailjs
      
      const templateParams = {
        to_email: userData.email,
        to_name: `${userData.first_name} ${userData.last_name}`,
        user_name: `${userData.first_name} ${userData.last_name}`,
        user_email: userData.email,
        login_url: typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://your-domain.com/login',
        dashboard_url: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'https://your-domain.com/dashboard',
        hours_url: typeof window !== 'undefined' ? `${window.location.origin}/hours` : 'https://your-domain.com/hours',
        features_url: typeof window !== 'undefined' ? `${window.location.origin}/landing#features` : 'https://your-domain.com/landing#features',
        help_url: typeof window !== 'undefined' ? `${window.location.origin}/landing` : 'https://your-domain.com/landing'
      }

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_APPROVAL_ID || 'YOUR_TEMPLATE_APPROVAL_ID',
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'
      )

      console.log('Approval email sent')
      return { success: true }
    } else {
      console.warn('EmailJS not configured - skipping email')
      return { success: false, error: 'EmailJS not configured' }
    }
  } catch (error) {
    console.error('Error sending approval email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Initialize EmailJS if not already initialized
 */
export const initializeEmailJS = () => {
  if (typeof window !== 'undefined' && window.emailjs) {
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    if (publicKey && publicKey !== 'YOUR_PUBLIC_KEY') {
      try {
        window.emailjs.init(publicKey)
        console.log('EmailJS initialized')
      } catch (error) {
        console.error('Error initializing EmailJS:', error)
      }
    }
  }
}
