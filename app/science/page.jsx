"use client"

import { useRouter } from 'next/navigation'

export default function Science() {
  const router = useRouter()

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
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '30px'
        }}>
          <a href="/dashboard" style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1d1d1f',
            textDecoration: 'none',
            letterSpacing: '-0.02em'
          }}>
            Burnout <span style={{ color: '#06B6D4', fontWeight: '800' }}>IQ</span>
          </a>

          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="/dashboard" style={navLinkStyle}>Dashboard</a>
            <a href="/hours" style={navLinkStyle}>Working Hours</a>
            <a href="/health" style={navLinkStyle}>Health Stats</a>
            <a href="/compare" style={navLinkStyle}>Comparisons</a>
          </div>
        </div>
      </nav>

      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        padding: '60px 40px'
      }}>
        {/* Hero Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h1 style={{ 
            fontSize: '64px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            color: '#1d1d1f',
            letterSpacing: '-0.03em'
          }}>
            The Science Behind Burnout IQ
          </h1>
          <p style={{ 
            fontSize: '24px',
            color: '#6e6e73',
            fontWeight: '400',
            margin: '0',
            letterSpacing: '-0.01em'
          }}>
            Research-backed metrics for sustainable performance
          </p>
        </div>

        {/* Introduction */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          marginBottom: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 20px 0' }}>
            Burnout IQ's burnout risk framework is grounded in peer-reviewed research from <strong>occupational health</strong>, <strong>circadian biology</strong>, and <strong>cognitive neuroscience</strong>. Our approach synthesizes evidence across multiple disciplines to provide actionable insights for high-intensity professionals.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#1d1d1f', margin: 0 }}>
            This page documents the scientific foundation for each metric, including methodology, key findings, and clinical implications.
          </p>
        </div>

        {/* Metric 1: Weekly Workload Average */}
        <div id="workload" style={{ 
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          marginBottom: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          borderLeft: '4px solid #007AFF'
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1d1d1f', margin: '0 0 24px 0' }}>
            1. Rolling 4-Week Average (Weekly Workload)
          </h2>
          
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Scientific Foundation
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            Extended work hours (&gt;55 hours/week) significantly increase stroke risk (35%), coronary heart disease (17%), and overall mortality. The relationship is dose-dependent: each additional 10 hours above 40h/week increases cardiovascular event risk by approximately 10-15%.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Cognitive Performance Impact
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            Research by Trockel et al. (2020) in JAMA found that physicians with high sleep-related impairment had <strong>97% higher odds of clinically significant medical errors</strong> compared to those without impairment. For professionals working &gt;80 hours/week, cognitive error rates approximately double.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Burnout IQ Thresholds
          </h3>
          <ul style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', paddingLeft: '24px' }}>
            <li><strong>&lt;60h/week (Portfolio Mode):</strong> Baseline sustainable load. Cognitive reserve intact.</li>
            <li><strong>60-75h/week (Active Diligence):</strong> Sustainable for 2-3 weeks during intense project periods. Monitor recovery.</li>
            <li><strong>75-80h/week (Caution):</strong> Unsustainable beyond 3 weeks. Plan mandatory recovery period.</li>
            <li><strong>&gt;80h/week (Critical):</strong> Immediate action required. Cognitive error risk doubles. Post-closing recovery mandatory.</li>
          </ul>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Key Citations
          </h3>
          <div style={{ fontSize: '14px', color: '#6e6e73', lineHeight: '1.8', backgroundColor: '#f5f5f7', padding: '16px', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>[1]</strong> Trockel, M., et al. (2020). "Assessment of Physician Sleep and Wellness, Burnout, and Clinically Significant Medical Errors." <em>JAMA Network Open</em>, 3(12).
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>[2]</strong> Kivimäki, M., et al. (2015). "Long working hours and risk of coronary heart disease and stroke: a systematic review and meta-analysis." <em>The Lancet</em>, 386(10005), 1739-1746.
            </p>
            <p style={{ margin: 0 }}>
              <strong>[3]</strong> Virtanen, M., et al. (2018). "Long working hours and alcohol use: systematic review and meta-analysis of published studies and unpublished individual participant data." <em>BMJ</em>, 350, g7772.
            </p>
          </div>
        </div>

        {/* Metric 2: Circadian Disruption */}
        <div id="circadian" style={{ 
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          marginBottom: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          borderLeft: '4px solid #FF3B30'
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1d1d1f', margin: '0 0 24px 0' }}>
            2. Red-Eye Ratio (Circadian Disruption Index)
          </h2>
          
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Scientific Foundation
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            Late-night work (10 PM - 6 AM) disrupts the circadian clock system, suppressing melatonin synthesis and desynchronizing peripheral clock genes. This has cascading effects on metabolic health, immune function, and cognitive performance.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Biological Cost
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            Research shows that <strong>1 hour of late-night work has approximately 2x the biological cost</strong> of daytime work due to circadian misalignment. Night shift workers show altered expression of clock genes (PER1, PER2, BMAL1) that regulate sleep-wake cycles, metabolism, and cellular repair.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Metabolic & Cognitive Effects
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            Chronic circadian disruption increases risk of metabolic syndrome, type 2 diabetes, cardiovascular disease, and mood disorders. Cognitive impairment includes reduced executive function, attention deficits, and increased reaction time—critical for decision-making in finance and consulting.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Burnout IQ Thresholds
          </h3>
          <ul style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', paddingLeft: '24px' }}>
            <li><strong>&lt;10% (Healthy):</strong> Circadian rhythm intact. Minimal disruption.</li>
            <li><strong>10-15% (Moderate):</strong> Monitor for "creep". Protect sleep window (11 PM - 7 AM).</li>
            <li><strong>15-20% (High):</strong> Significant circadian disruption. Schedule recovery nights.</li>
            <li><strong>&gt;20% (Critical):</strong> Severe circadian misalignment. Prioritize 10 PM - 6 AM boundary immediately.</li>
          </ul>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Key Citations
          </h3>
          <div style={{ fontSize: '14px', color: '#6e6e73', lineHeight: '1.8', backgroundColor: '#f5f5f7', padding: '16px', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>[4]</strong> Gómez-García, T., et al. (2021). "Shift work and circadian clock gene expression alterations." <em>Journal of Circadian Rhythms</em>, 19.
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>[5]</strong> Kervezee, L., et al. (2021). "The role of the circadian clock in the metabolic syndrome and diabetes." <em>Current Diabetes Reports</em>, 21(10), 1-11.
            </p>
            <p style={{ margin: 0 }}>
              <strong>[6]</strong> Sack, R. L., et al. (2021). "Circadian rhythm sleep disorders and neurological disorders." <em>Sleep Medicine Clinics</em>, 16(1), 153-168.
            </p>
          </div>
        </div>

        {/* Metric 3: Recovery Window */}
        <div id="recovery" style={{ 
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          marginBottom: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          borderLeft: '4px solid #34C759'
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1d1d1f', margin: '0 0 24px 0' }}>
            3. Protected Weekend Blocks (Recovery Window Status)
          </h2>
          
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Scientific Foundation
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            Psychological detachment from work is a critical mediator of recovery and burnout prevention. Weekend activities that involve work-related thoughts or tasks <strong>counteract recovery processes</strong>, preventing the restoration of depleted resources.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            The 24-Hour Rule
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            Research shows that at least <strong>24 consecutive hours of full detachment</strong> (no work emails, calls, or tasks) is required for meaningful cognitive and emotional recovery. Fragmented recovery (e.g., checking email for "just 10 minutes") disrupts the recovery process.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Burnout Prevention
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            De Bloom et al. (2021) found that recovery experiences during weekends—such as relaxation, mastery experiences, and social activities—are strongly associated with reduced burnout symptoms and improved well-being. Lack of weekend recovery predicts increased emotional exhaustion and cynicism.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Burnout IQ Thresholds
          </h3>
          <ul style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', paddingLeft: '24px' }}>
            <li><strong>&lt;7 days (Protected):</strong> Consistent weekend recovery maintained. Good rhythm.</li>
            <li><strong>7-10 days (Caution):</strong> Plan recovery soon. Weekend should be device-free.</li>
            <li><strong>10-14 days (Warning):</strong> Schedule full weekend disconnect immediately.</li>
            <li><strong>&gt;14 days (Critical):</strong> Brain cannot reset. MANDATORY 24h off required within 48 hours.</li>
          </ul>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Key Citations
          </h3>
          <div style={{ fontSize: '14px', color: '#6e6e73', lineHeight: '1.8', backgroundColor: '#f5f5f7', padding: '16px', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>[7]</strong> de Bloom, J., et al. (2021). "Vacation (after-) effects on employee health and well-being, and the role of vacation activities, experiences and sleep." <em>Journal of Happiness Studies</em>, 22(3), 1121-1141.
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>[8]</strong> Sonnentag, S., & Fritz, C. (2015). "Recovery from job stress: The stressor-detachment model as an integrative framework." <em>Journal of Organizational Behavior</em>, 36(S1), S72-S103.
            </p>
            <p style={{ margin: 0 }}>
              <strong>[9]</strong> Brower, T. (2023). "To Avoid Burnout, Use Your Time Off From Work To Do These Things." <em>Forbes</em>.
            </p>
          </div>
        </div>

        {/* Metric 4: Sleep & Burnout */}
        <div id="sleep" style={{ 
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          marginBottom: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          borderLeft: '4px solid #FF9500'
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1d1d1f', margin: '0 0 24px 0' }}>
            4. Sleep Debt & Burnout Risk
          </h2>
          
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Scientific Foundation
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            Sleep problems are both a <strong>predictor and consequence of burnout</strong>. Metlaine et al. (2017) found that the combination of job strain and insomnia increased burnout odds by <strong>14.7 times</strong> compared to no strain/no insomnia.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Bidirectional Relationship
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            Research by Sørengaard et al. (2022) demonstrates that work-related exhaustion and emotional impairment are the strongest predictors of sleep reactivity (vulnerability to stress-related sleep disturbance). This creates a vicious cycle: poor sleep → increased burnout → worse sleep quality.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Sleep Debt Accumulation
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            Chronic sleep restriction (&lt;6 hours/night) accumulates as "sleep debt" that cannot be fully repaid with single recovery nights. Two weeks of sleeping 6h/night produces cognitive impairment equivalent to 48 hours of total sleep deprivation.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '24px 0 12px 0' }}>
            Key Citations
          </h3>
          <div style={{ fontSize: '14px', color: '#6e6e73', lineHeight: '1.8', backgroundColor: '#f5f5f7', padding: '16px', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>[10]</strong> Metlaine, A., et al. (2017). "Associations between insomnia symptoms, job strain and burnout syndrome." <em>BMJ Open</em>, 7(8).
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>[11]</strong> Sørengaard, T. A., et al. (2022). "Burnout dimensions as predictors of sleep reactivity: A prospective study." <em>Frontiers in Psychology</em>, 13.
            </p>
            <p style={{ margin: 0 }}>
              <strong>[12]</strong> Van Dongen, H. P., et al. (2003). "The cumulative cost of additional wakefulness: dose-response effects on neurobehavioral functions and sleep physiology." <em>Sleep</em>, 26(2), 117-126.
            </p>
          </div>
        </div>

        {/* Methodology */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          marginBottom: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1d1d1f', margin: '0 0 24px 0' }}>
            Burnout Risk Score Methodology
          </h2>
          
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            Burnout IQ's composite burnout risk score (0-100) integrates the four metrics above using a weighted algorithm based on relative clinical significance:
          </p>

          <ul style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', paddingLeft: '24px', marginBottom: '20px' }}>
            <li><strong>Weekly Workload (40%):</strong> Strongest predictor of cardiovascular events and cognitive errors</li>
            <li><strong>Circadian Disruption (35%):</strong> Impacts multiple physiological systems; difficult to recover from</li>
            <li><strong>Recovery Window (25%):</strong> Critical mediator; lack of detachment prevents resource restoration</li>
          </ul>

          <div style={{ backgroundColor: '#f5f5f7', padding: '20px', borderRadius: '8px', marginTop: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 12px 0' }}>
              Risk Categories
            </h3>
            <ul style={{ fontSize: '15px', lineHeight: '1.8', color: '#1d1d1f', paddingLeft: '24px', margin: 0 }}>
              <li><strong>0-39 (Sustainable):</strong> Metrics within healthy range</li>
              <li><strong>40-59 (Elevated):</strong> Monitor closely; plan recovery within 1-2 weeks</li>
              <li><strong>60-84 (High Risk):</strong> Multiple indicators; schedule recovery immediately</li>
              <li><strong>85-100 (Critical):</strong> High burnout risk; take action within 48 hours</li>
            </ul>
          </div>
        </div>

        {/* Limitations */}
        <div style={{ 
          backgroundColor: '#FFF3CD',
          padding: '32px',
          borderRadius: '16px',
          marginBottom: '40px',
          border: '2px solid #FFC107'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            ⚠️ Important Limitations
          </h2>
          <ul style={{ fontSize: '16px', lineHeight: '1.8', color: '#1d1d1f', paddingLeft: '24px', margin: 0 }}>
            <li>Burnout IQ is <strong>not a clinical diagnostic tool</strong>. It provides risk indicators, not medical diagnoses.</li>
            <li>Individual variability: Burnout thresholds vary by genetics, baseline health, and personal circumstances.</li>
            <li>Self-reported data limitations: Accuracy depends on honest, consistent logging.</li>
            <li>Context matters: These metrics are calibrated for high-intensity professionals (finance, consulting, legal). Other professions may have different thresholds.</li>
            <li><strong>If experiencing severe symptoms</strong> (chronic insomnia, depression, anxiety, physical illness), consult a healthcare professional immediately.</li>
          </ul>
        </div>

        {/* Back Button */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <button
            onClick={() => router.push('/hours')}
            style={{
              padding: '16px 32px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '17px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,122,255,0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0051D5'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007AFF'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            ← Back to Working Hours
          </button>
        </div>
      </div>
    </div>
  )
}

const navLinkStyle = {
  color: '#1d1d1f',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'opacity 0.2s'
}