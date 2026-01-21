"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sendApprovalEmail, initializeEmailJS } from '../lib/emailService'

export default function Admin() {
  const router = useRouter()
  const [accessRequests, setAccessRequests] = useState([])
  const [allAccessRequests, setAllAccessRequests] = useState([]) // Keep all requests for stats
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [filter, setFilter] = useState('pending') // pending, approved, rejected, all

  useEffect(() => {
    document.title = 'Burnout IQ - Admin'
    initializeEmailJS()
    checkAdminAndLoad()
  }, [])

  useEffect(() => {
    if (userProfile?.is_admin) {
      loadAccessRequests()
    }
  }, [filter, userProfile?.is_admin])
  
  // Also reload when component mounts and userProfile loads
  useEffect(() => {
    if (userProfile?.is_admin && !loading) {
      loadAccessRequests()
    }
  }, [userProfile?.id])

  const checkAdminAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    const storedUserId = localStorage.getItem('burnoutiQ_user_id')
    
    if (!storedUserId) {
      // Try to get user profile by email
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (profile) {
        localStorage.setItem('burnoutiQ_user_id', profile.id)
        setUserProfile(profile)
        
        if (!profile.is_admin) {
          router.push('/dashboard')
          return
        }
      } else {
        router.push('/profile')
        return
      }
    } else {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', storedUserId)
        .single()

      if (profile) {
        setUserProfile(profile)
        
        if (!profile.is_admin) {
          router.push('/dashboard')
          return
        }
      }
    }

    setLoading(false)
  }

  const loadAccessRequests = async () => {
    try {
      // First verify admin status
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session:', session?.user?.email)
      console.log('Current userProfile:', userProfile)
      
      // Load ALL requests for stats (unfiltered)
      const { data: allData, error: allError } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (allError) {
        console.error('Error loading all access requests:', allError)
        throw allError
      }

      // Store all requests for stats
      setAllAccessRequests(allData || [])

      // Load filtered requests for display
      let query = supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading filtered access requests:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        alert(`Error loading requests: ${error.message}\n\nCheck browser console for details. Common issues:\n1. RLS policies not set up correctly\n2. Admin user ID doesn't match auth.uid()\n3. Run the migration SQL again`)
        throw error
      }
      
      console.log('Loaded access requests:', data?.length || 0, 'requests')
      console.log('Requests:', data)
      setAccessRequests(data || [])
    } catch (error) {
      console.error('Error loading access requests:', error)
      setAccessRequests([])
      setAllAccessRequests([])
    }
  }

  const handleApprove = async (requestId, requestData) => {
    try {
      // Step 1: Update access request status
      const { error: updateError } = await supabase
        .from('access_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: userProfile.id
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Step 2: Create or update user profile with approval
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', requestData.email)
        .single()

      if (existingUser) {
        // Update existing user
        await supabase
          .from('users')
          .update({
            is_approved: true,
            first_name: requestData.first_name,
            last_name: requestData.last_name,
            position: requestData.position,
            company: requestData.company,
            firm_type: requestData.firm_type,
            region: requestData.region
          })
          .eq('id', existingUser.id)
      } else {
        // Create new user profile
        await supabase
          .from('users')
          .insert([{
            email: requestData.email,
            is_approved: true,
            first_name: requestData.first_name,
            last_name: requestData.last_name,
            position: requestData.position,
            company: requestData.company,
            firm_type: requestData.firm_type,
            region: requestData.region
          }])
      }

      // Step 3: Send welcome/invitation email with setup instructions
      const emailResult = await sendApprovalEmail(requestData)
      
      if (!emailResult.success) {
        console.error('Failed to send approval email:', emailResult.error)
        alert(`⚠️ Request approved and profile created, but failed to send invitation email.\n\nPlease manually email ${requestData.email} with login instructions.`)
      } else {
        alert(`✓ Request approved!\n\nInvitation email sent to: ${requestData.email}\n\nThe user should visit the login page and click "Forgot Password" to set up their account.`)
      }

      // Reload requests
      loadAccessRequests()
      
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Error approving request: ' + error.message)
    }
  }

  const handleReject = async (requestId) => {
    if (!confirm('Are you sure you want to reject this access request?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('access_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: userProfile.id
        })
        .eq('id', requestId)

      if (error) throw error

      loadAccessRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Error rejecting request: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f7'
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!userProfile?.is_admin) {
    return null // Will redirect
  }

  // Use allAccessRequests for stats (not filtered)
  const pendingCount = allAccessRequests.filter(r => r.status === 'pending').length
  const approvedCount = allAccessRequests.filter(r => r.status === 'approved').length
  const rejectedCount = allAccessRequests.filter(r => r.status === 'rejected').length

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f7',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: '42px',
              fontWeight: '700',
              margin: '0 0 8px 0',
              color: '#1d1d1f'
            }}>
              Admin <span style={{ color: '#06B6D4', fontWeight: '800' }}>Panel</span>
            </h1>
            <p style={{ color: '#6e6e73', fontSize: '17px', margin: 0 }}>
              Review and manage access requests
            </p>
          </div>
          <a
            href="/dashboard"
            style={{
              padding: '12px 24px',
              backgroundColor: '#4F46E5',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: '600'
            }}
          >
            Back to Dashboard
          </a>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <StatCard
            label="Pending"
            value={pendingCount}
            color="#FF9800"
            onClick={() => setFilter('pending')}
          />
          <StatCard
            label="Approved"
            value={approvedCount}
            color="#06B6D4"
            onClick={() => setFilter('approved')}
          />
          <StatCard
            label="Rejected"
            value={rejectedCount}
            color="#4F46E5"
            onClick={() => setFilter('rejected')}
          />
          <StatCard
            label="Total"
            value={allAccessRequests.length}
            color="#4F46E5"
            onClick={() => setFilter('all')}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '10px 20px',
                backgroundColor: filter === status ? '#4F46E5' : 'white',
                color: filter === status ? 'white' : '#1d1d1f',
                border: '1px solid #d2d2d7',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: filter === status ? '600' : '400',
                textTransform: 'capitalize',
                fontSize: '15px'
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          {accessRequests.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6e6e73', fontSize: '17px', padding: '40px' }}>
              No {filter === 'all' ? '' : filter} access requests found.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {accessRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onApprove={() => handleApprove(request.id, request)}
                  onReject={() => handleReject(request.id)}
                  filter={filter}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        borderTop: `4px solid ${color}`
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <p style={{ fontSize: '14px', color: '#6e6e73', margin: '0 0 8px 0', fontWeight: '500' }}>
        {label}
      </p>
      <p style={{ fontSize: '32px', fontWeight: '700', color: color, margin: 0 }}>
        {value}
      </p>
    </div>
  )
}

function RequestCard({ request, onApprove, onReject, filter }) {
  const statusColors = {
    pending: { bg: '#FFF3E0', text: '#F57C00', border: '#FFB74D' },
    approved: { bg: '#E0F2F1', text: '#00695C', border: '#4DB6AC' },
    rejected: { bg: '#FFEBEE', text: '#C62828', border: '#EF5350' }
  }

  const statusStyle = statusColors[request.status] || statusColors.pending

  return (
    <div style={{
      padding: '24px',
      border: `2px solid ${statusStyle.border}`,
      borderRadius: '12px',
      backgroundColor: statusStyle.bg
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            flexWrap: 'wrap'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1d1d1f',
              margin: 0
            }}>
              {request.first_name} {request.last_name}
            </h3>
            <span style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: statusStyle.border,
              color: statusStyle.text
            }}>
              {request.status.toUpperCase()}
            </span>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            fontSize: '14px',
            color: '#6e6e73'
          }}>
            <div>
              <strong>Email:</strong> {request.email}
            </div>
            <div>
              <strong>Position:</strong> {request.position || 'N/A'}
            </div>
            <div>
              <strong>Company:</strong> {request.company || 'N/A'}
            </div>
            <div>
              <strong>Firm Type:</strong> {request.firm_type || 'N/A'}
            </div>
            <div>
              <strong>Region:</strong> {request.region || 'N/A'}
            </div>
            <div>
              <strong>Requested:</strong> {new Date(request.created_at).toLocaleDateString()}
            </div>
            {request.reviewed_at && (
              <div>
                <strong>Reviewed:</strong> {new Date(request.reviewed_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {filter === 'pending' && (
          <div style={{
            display: 'flex',
            gap: '10px',
            flexShrink: 0
          }}>
            <button
              onClick={onApprove}
              style={{
                padding: '10px 20px',
                backgroundColor: '#06B6D4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Approve
            </button>
            <button
              onClick={onReject}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

