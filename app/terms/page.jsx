"use client"

import Footer from '../components/Footer'

export default function TermsOfService() {
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
          Terms of Service
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
            These Terms of Service ("Terms") govern your access to and use of this website (the "Site"). By accessing or using the Site, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Site.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Use of the Site
          </h2>

          <ul style={{ marginLeft: '24px', marginBottom: '24px', paddingLeft: '0' }}>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              You agree to use the Site only for lawful purposes and in accordance with these Terms.
            </li>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              You agree not to use the Site in any way that could damage, disable, overburden, or impair the Site or interfere with any other party's use of the Site.
            </li>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              You agree not to attempt to gain unauthorized access to any portion or feature of the Site, or any systems or networks connected to the Site.
            </li>
          </ul>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            User Content
          </h2>

          <p style={{ marginBottom: '16px' }}>
            If the Site allows you to submit, post, or upload content ("User Content"), you are responsible for all User Content you provide.
          </p>

          <p style={{ marginBottom: '16px' }}>
            You represent and warrant that you have all necessary rights to submit the User Content and that it does not infringe any third-party rights or violate any laws.
          </p>

          <p style={{ marginBottom: '24px' }}>
            By submitting User Content, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content in connection with operating and improving the Site.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Intellectual Property
          </h2>

          <p style={{ marginBottom: '16px' }}>
            All content on the Site, including text, graphics, logos, icons, images, and software, is owned by or licensed to the Site owner and is protected by intellectual property laws.
          </p>

          <p style={{ marginBottom: '16px' }}>
            You are granted a limited, non-exclusive, non-transferable license to access and use the Site for personal, non-commercial purposes, subject to these Terms.
          </p>

          <p style={{ marginBottom: '24px' }}>
            You may not copy, reproduce, distribute, modify, or create derivative works from any content on the Site without prior written permission from the Site owner or the applicable rights holder.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Accounts (If Applicable)
          </h2>

          <p style={{ marginBottom: '16px' }}>
            If you create an account on the Site, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
          </p>

          <p style={{ marginBottom: '16px' }}>
            You agree to notify us promptly of any unauthorized use of your account or any other breach of security.
          </p>

          <p style={{ marginBottom: '24px' }}>
            We reserve the right to suspend or terminate your account at any time if we believe you have violated these Terms or applicable law.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Third-Party Links and Services
          </h2>

          <p style={{ marginBottom: '16px' }}>
            The Site may contain links to third-party websites or services that are not owned or controlled by us.
          </p>

          <p style={{ marginBottom: '16px' }}>
            We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services.
          </p>

          <p style={{ marginBottom: '24px' }}>
            Your use of third-party sites and services is at your own risk and subject to the terms and policies of those third parties.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Disclaimers
          </h2>

          <p style={{ marginBottom: '16px' }}>
            The Site is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied.
          </p>

          <p style={{ marginBottom: '16px' }}>
            To the fullest extent permitted by law, we disclaim all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>

          <p style={{ marginBottom: '24px' }}>
            We do not warrant that the Site will be uninterrupted, secure, or free of errors or viruses, or that any defects will be corrected.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Limitation of Liability
          </h2>

          <p style={{ marginBottom: '16px' }}>
            To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses, arising out of or in connection with your use of the Site.
          </p>

          <p style={{ marginBottom: '24px' }}>
            Our total liability for any claim arising out of or relating to these Terms or the Site shall be limited to the amount, if any, you paid to use the Site in the twelve months preceding the claim.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Indemnification
          </h2>

          <p style={{ marginBottom: '16px' }}>
            You agree to indemnify, defend, and hold harmless the Site owner and its affiliates, officers, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with:
          </p>

          <ul style={{ marginLeft: '24px', marginBottom: '16px', paddingLeft: '0' }}>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              Your access to or use of the Site.
            </li>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              Your violation of these Terms.
            </li>
            <li style={{ marginBottom: '12px', listStyle: 'disc' }}>
              Your violation of any rights of another person or entity.
            </li>
          </ul>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Changes to These Terms
          </h2>

          <p style={{ marginBottom: '16px' }}>
            We may update or modify these Terms from time to time at our discretion.
          </p>

          <p style={{ marginBottom: '24px' }}>
            Any changes will be posted on this page with an updated "Last updated" date.
          </p>

          <p style={{ marginBottom: '24px' }}>
            Your continued use of the Site after the revised Terms are posted constitutes your acceptance of the changes.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Termination
          </h2>

          <p style={{ marginBottom: '16px' }}>
            We may suspend or terminate your access to the Site at any time, without prior notice or liability, for any reason, including if you breach these Terms.
          </p>

          <p style={{ marginBottom: '24px' }}>
            Upon termination, your right to use the Site will immediately cease. Any provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Governing Law
          </h2>

          <p style={{ marginBottom: '16px' }}>
            These Terms and your use of the Site shall be governed by and construed in accordance with the laws of [Your Country/Region], without regard to its conflict of law principles.
          </p>

          <p style={{ marginBottom: '24px' }}>
            You agree to submit to the exclusive jurisdiction of the courts located in [Your City/Region] to resolve any dispute arising out of or relating to these Terms or the Site.
          </p>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1d1d1f',
            margin: '48px 0 20px 0'
          }}>
            Contact Information
          </h2>

          <p style={{ marginBottom: '24px' }}>
            If you have any questions about these Terms, you may contact us at:
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
