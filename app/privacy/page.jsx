"use client"

import Footer from '../components/Footer'

export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        padding: '20px 40px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '24px', fontWeight: '700', color: '#1d1d1f', textDecoration: 'none' }}>
            Burnout <span style={{ color: '#06B6D4', fontWeight: '800' }}>IQ</span>
          </a>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="/login" style={{ color: '#1d1d1f', textDecoration: 'none', fontSize: '15px' }}>Sign In</a>
            <a href="/landing" style={{
              padding: '10px 20px',
              backgroundColor: '#007AFF',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '20px',
              fontSize: '15px',
              fontWeight: '600'
            }}>
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        padding: '60px 40px',
        backgroundColor: 'white',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#1d1d1f',
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em'
        }}>
          Privacy Policy
        </h1>
        
        <p style={{
          fontSize: '15px',
          color: '#6e6e73',
          margin: '0 0 60px 0'
        }}>
          Last updated: {currentDate}
        </p>

        <div style={{
          fontSize: '16px',
          lineHeight: '1.8',
          color: '#1d1d1f'
        }}>
          <p style={{ marginBottom: '24px' }}>
            Burnout IQ ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (the "Site"). By using the Site, you agree to the collection and use of information in accordance with this Policy.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Information We May Collect
          </h2>

          <p style={{ marginBottom: '16px' }}>
            We may collect the following types of information when you use the Site:
          </p>

          <ul style={{ marginLeft: '24px', marginBottom: '24px', paddingLeft: '0' }}>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              Information you voluntarily provide, such as your name, email address, or other contact details when you fill out forms or contact us.
            </li>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              Technical and usage data, such as IP address, browser type, device information, pages visited, and referring URLs, which may be collected through cookies and similar technologies.
            </li>
          </ul>

          <p style={{ marginBottom: '24px' }}>
            You may choose not to provide certain information, but this may limit your ability to use some features of the Site.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            How We May Use Your Information
          </h2>

          <p style={{ marginBottom: '16px' }}>
            We may use the information collected for purposes such as:
          </p>

          <ul style={{ marginLeft: '24px', marginBottom: '24px', paddingLeft: '0' }}>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              Operating, maintaining, and improving the Site.
            </li>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              Responding to your inquiries and providing customer support.
            </li>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              Monitoring usage and trends to help improve user experience.
            </li>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              Protecting the security and integrity of the Site.
            </li>
          </ul>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Cookies and Similar Technologies
          </h2>

          <p style={{ marginBottom: '16px' }}>
            The Site may use cookies and similar tracking technologies to collect and store certain information.
          </p>

          <p style={{ marginBottom: '16px' }}>
            Cookies may be used to remember your preferences and understand how you use the Site.
          </p>

          <p style={{ marginBottom: '24px' }}>
            You can typically instruct your browser to refuse cookies or indicate when a cookie is being sent, but some parts of the Site may not function properly without them.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Third-Party Services
          </h2>

          <p style={{ marginBottom: '16px' }}>
            We may use third-party service providers to help operate the Site or perform services on our behalf (for example, analytics providers or hosting providers).
          </p>

          <p style={{ marginBottom: '24px' }}>
            These third parties may have access to your information only to perform specific tasks and are generally obligated not to disclose or use it for other purposes.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Data Security
          </h2>

          <p style={{ marginBottom: '16px' }}>
            We take reasonable measures designed to protect the information we collect through the Site from loss, misuse, and unauthorized access, disclosure, alteration, or destruction.
          </p>

          <p style={{ marginBottom: '24px' }}>
            However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Data Retention
          </h2>

          <p style={{ marginBottom: '24px' }}>
            We may retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Your Rights and Choices
          </h2>

          <p style={{ marginBottom: '16px' }}>
            Depending on your location and applicable law, you may have certain rights regarding your personal information, which may include:
          </p>

          <ul style={{ marginLeft: '24px', marginBottom: '16px', paddingLeft: '0' }}>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              The right to access and receive a copy of your personal information.
            </li>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              The right to request correction or deletion of your personal information.
            </li>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              The right to object to or restrict certain processing activities.
            </li>
          </ul>

          <p style={{ marginBottom: '24px' }}>
            You may exercise these rights by contacting us using the details provided in the "Contact Us" section below. Actual rights and procedures may vary by jurisdiction and should be tailored to your legal requirements.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            International Transfers
          </h2>

          <p style={{ marginBottom: '24px' }}>
            If you access the Site from outside the country where our servers are located, your information may be transferred across international borders and processed in countries that may have different data protection laws.
          </p>

          <p style={{ marginBottom: '24px' }}>
            By using the Site, you consent to such transfers to the extent permitted by applicable law.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Children's Privacy
          </h2>

          <p style={{ marginBottom: '16px' }}>
            The Site is not intended for use by children under the age of 13 (or other minimum age in your jurisdiction).
          </p>

          <p style={{ marginBottom: '24px' }}>
            We do not knowingly collect personal information from children under this age. If you believe a child has provided us with personal information, please contact us so that we can take appropriate action.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Changes to This Privacy Policy
          </h2>

          <p style={{ marginBottom: '16px' }}>
            We may update this Privacy Policy from time to time.
          </p>

          <p style={{ marginBottom: '24px' }}>
            Any changes will be posted on this page with an updated "Last updated" date, and the revised Policy will be effective when posted unless otherwise required by law.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Contact Us
          </h2>

          <p style={{ marginBottom: '24px' }}>
            If you have any questions or concerns about this Privacy Policy or our data practices, you may contact us at:
          </p>

          <div style={{ 
            backgroundColor: '#f5f5f7',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <p style={{ marginBottom: '12px', fontWeight: '600' }}>
              Email: <a href="mailto:[your-email@example.com]" style={{ color: '#007AFF', textDecoration: 'none' }}>[your-email@example.com]</a>
            </p>
            <p style={{ margin: 0 }}>
              Address: [Your Address or City, Country]
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
