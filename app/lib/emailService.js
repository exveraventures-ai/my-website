// Email service for sending notifications
// Uses EmailJS for client-side email sending
// You'll need to set up EmailJS and add your keys to environment variables

export const sendAccessRequestEmail = async (userData) => {
  // Email 1: Thank you for requesting access
  try {
    // Check if EmailJS is configured
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

export const sendApprovalEmail = async (userData) => {
  // Email 2: Your access has been approved
  try {
    if (typeof window !== 'undefined' && window.emailjs) {
      const emailjs = window.emailjs
      
      const templateParams = {
        to_email: userData.email,
        to_name: `${userData.first_name} ${userData.last_name}`,
        user_name: `${userData.first_name} ${userData.last_name}`,
        user_email: userData.email,
        login_url: `${window.location.origin}/login`,
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

