"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { firmCategories } from '../lib/firms'
import Footer from '../components/Footer'
import Navigation from '../components/Navigation'

export default function Profile() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    position: '',
    company: '',
    firm_type: '',
    region: ''
  })

  // Use firmCategories from firms.js
  const groupedCompanies = firmCategories

  // Create firmTypeMapping dynamically from firmCategories
  const firmTypeMapping = Object.entries(firmCategories).reduce((acc, [category, firms]) => {
    firms.forEach(firm => {
      acc[firm] = category
    })
    return acc
  }, {})

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }
    
    const storedUserId = localStorage.getItem('burnoutiQ_user_id')
    
    if (storedUserId) {
      setUserId(storedUserId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', storedUserId)
        .single()
      
      if (data) {
        // Check if user is approved
        if (!data.is_approved && !data.is_admin) {
          await supabase.auth.signOut()
          router.push('/login?message=pending')
          return
        }
        
        setFormData(data)
      }
    } else {
      // Try to get profile by email
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()
      
      if (profile) {
        // Check if user is approved
        if (!profile.is_approved && !profile.is_admin) {
          await supabase.auth.signOut()
          router.push('/login?message=pending')
          return
        }
        
        localStorage.setItem('burnoutiQ_user_id', profile.id)
        setUserId(profile.id)
        setFormData(profile)
      }
    }
  }


  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-populate firm type when company changes
      if (field === 'company') {
        updated.firm_type = firmTypeMapping[value] || ''
      }
      
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (userId) {
        // Check if email is being changed and if it already exists
        const { data: existingProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (existingProfile && existingProfile.email !== formData.email) {
          // Email is being changed, check if new email already exists
          const { data: emailCheck } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', formData.email)
            .neq('id', userId)
            .single()

          if (emailCheck) {
            const confirmed = window.confirm(
              `An account with email "${formData.email}" already exists. Do you want to overwrite that account's information with your current data?`
            )
            
            if (!confirmed) {
              setIsSaving(false)
              return
            }

            // Delete the existing account with that email
            await supabase
              .from('users')
              .delete()
              .eq('email', formData.email)
          }
        }

        // Update existing user
        console.log('Updating user with data:', formData)
        const { data, error } = await supabase
          .from('users')
          .update(formData)
          .eq('id', userId)
          .select()
        
        if (error) {
          console.error('Error updating profile:', error)
          alert(`Failed to update profile: ${error.message}`)
        } else {
          console.log('Update successful:', data)
          setIsEditMode(false)
        }
      } else {
        // Check if email already exists for new profile creation
        const { data: emailCheck } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', formData.email)
          .single()

        if (emailCheck) {
          const confirmed = window.confirm(
            `An account with email "${formData.email}" already exists. Do you want to overwrite that account's information?`
          )
          
          if (!confirmed) {
            setIsSaving(false)
            return
          }

          // Update the existing account instead
          const { data, error } = await supabase
            .from('users')
            .update(formData)
            .eq('email', formData.email)
            .select()
            .single()

          if (error) {
            console.error('Error updating existing profile:', error)
            alert(`Failed to update profile: ${error.message}`)
          } else if (data) {
            console.log('Update successful:', data)
            localStorage.setItem('burnoutiQ_user_id', data.id)
            setUserId(data.id)
            setIsEditMode(false)
          }
        } else {
          // Create new user
          console.log('Creating new user with data:', formData)
          const { data, error } = await supabase
            .from('users')
            .insert([formData])
            .select()
            .single()
          
          if (error) {
            console.error('Error creating profile:', error)
            alert(`Failed to create profile: ${error.message}`)
          } else if (data) {
            console.log('Creation successful:', data)
            localStorage.setItem('burnoutiQ_user_id', data.id)
            setUserId(data.id)
            setIsEditMode(false)
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert(`An unexpected error occurred: ${err.message}`)
    }

    setIsSaving(false)
  }

  const handleCancel = () => {
    setIsEditMode(false)
    loadUserProfile()
  }

  const positions = [
    'Analyst',
    'Associate',
    'Senior Associate',
    'VP / Principal',
    'Director / Partner',
    'Managing Director'
  ]

  const regions = [
    'UK & Ireland',
    'Continental Europe',
    'US Northeast',
    'US West Coast',
    'US Southeast',
    'US Midwest',
    'APAC',
    'Latin America',
    'Middle East & Africa'
  ]

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <Navigation userProfile={formData} />

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        padding: '60px 40px'
      }}>
        {/* Hero Header */}
        <div style={{ 
          marginBottom: '50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '56px',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: '#1d1d1f',
              letterSpacing: '-0.03em'
            }}>
              Your Profile
            </h1>
            <p style={{ 
              fontSize: '21px',
              color: '#6e6e73',
              fontWeight: '400',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              {userId ? 'Manage your personal information' : 'Set up your profile to get started'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {userId && !isEditMode && (
              <div style={{
                fontSize: '20px',
                color: '#86868b'
              }}>
                🔒
              </div>
            )}
            {userId && !isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  fontFamily: 'inherit'
                }}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ 
            fontSize: '24px',
            fontWeight: '600',
            margin: '0 0 30px 0',
            color: '#1d1d1f'
          }}>
            Personal Information
          </h2>

          <FormField 
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="your.email@company.com"
            required
            disabled={!isEditMode && userId}
          />

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px' 
          }}>
            <FormField 
              label="First Name"
              type="text"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              placeholder="John"
              required
              disabled={!isEditMode && userId}
            />

            <FormField 
              label="Last Name"
              type="text"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              placeholder="Smith"
              required
              disabled={!isEditMode && userId}
            />
          </div>

          <h2 style={{ 
            fontSize: '24px',
            fontWeight: '600',
            margin: '40px 0 30px 0',
            color: '#1d1d1f'
          }}>
            Professional Information
          </h2>

          <FormField 
            label="Position / Level"
            type="select"
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            options={positions}
            required
            disabled={!isEditMode && userId}
          />

          <FormField 
            label="Company"
            type="select-grouped"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            groupedOptions={groupedCompanies}
            required
            disabled={!isEditMode && userId}
          />

          <FormField 
            label="Firm Type"
            type="text"
            value={formData.firm_type}
            onChange={(e) => handleChange('firm_type', e.target.value)}
            placeholder="Auto-populated based on company"
            disabled={true}
          />

          <FormField 
            label="Region"
            type="select"
            value={formData.region}
            onChange={(e) => handleChange('region', e.target.value)}
            options={regions}
            required
            disabled={!isEditMode && userId}
          />

          {/* Action Buttons */}
          {(!userId || isEditMode) && (
            <div style={{ 
              marginTop: '40px',
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  flex: '1',
                  padding: '16px 32px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '17px',
                  fontFamily: 'inherit',
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                {isSaving ? 'Saving...' : userId ? 'Save Changes' : 'Create Profile'}
              </button>

              {userId && isEditMode && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    flex: '1',
                    padding: '16px 32px',
                    backgroundColor: '#f5f5f7',
                    color: '#1d1d1f',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '17px',
                    fontFamily: 'inherit'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </form>

        {userId && !isEditMode && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e8e8ed',
            fontSize: '14px',
            color: '#6e6e73',
            textAlign: 'center'
          }}>
            💡 Your profile is locked. Click "Edit Profile" to make changes.
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}


function FormField({ label, type, value, onChange, options, groupedOptions, placeholder, required, disabled }) {
  const fieldStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: disabled ? '1px solid #e8e8ed' : '1px solid #d2d2d7',
    fontSize: '17px',
    fontFamily: 'inherit',
    backgroundColor: disabled ? '#fafafa' : 'white',
    color: disabled ? '#86868b' : '#1d1d1f',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : type === 'select' || type === 'select-grouped' ? 'pointer' : 'text'
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1d1d1f',
        marginBottom: '10px'
      }}>
        {label} {required && <span style={{ color: '#FF3B30' }}>*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          style={fieldStyle}
        >
          <option value="">Select {label}</option>
          {options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : type === 'select-grouped' ? (
        <select
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          style={fieldStyle}
        >
          <option value="">Select Company</option>
          {Object.entries(groupedOptions).map(([category, firms]) => (
            <optgroup key={category} label={category}>
              {firms.map(firm => (
                <option key={firm} value={firm}>{firm}</option>
              ))}
            </optgroup>
          ))}
          <option value="Other">Other (Custom)</option>
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={fieldStyle}
        />
      )}
    </div>
  )
}