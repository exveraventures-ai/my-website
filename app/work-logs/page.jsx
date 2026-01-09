"use client"

import { supabase } from '../lib/supabase.js'
import { useState } from 'react'

export default function WorkLogs() {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    adjustment: 0
  })
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Calculate hours worked
    const start = new Date(`${formData.date}T${formData.startTime}`)
    const end = new Date(`${formData.date}T${formData.endTime}`)
    const hoursWorked = (end - start) / (1000 * 60 * 60) // Convert ms to hours
    const totalHours = hoursWorked + parseFloat(formData.adjustment || 0)

    // Insert into Supabase
    const { data, error } = await supabase
      .from('Work_Logs')
      .insert([
        {
          Date: formData.date,
          'Start Time': formData.startTime,
          'End Time': formData.endTime,
          adjustment: parseFloat(formData.adjustment || 0),
          hours: totalHours
        }
      ])

    if (error) {
      setMessage(`Error: ${error.message}`)
      console.error(error)
    } else {
      setMessage('Work log saved successfully!')
      // Reset form
      setFormData({ date: '', startTime: '', endTime: '', adjustment: 0 })
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h1>Log Work Hours</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Date:</label><br/>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Start Time:</label><br/>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>End Time:</label><br/>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Adjustment (hours, optional):</label><br/>
          <input
            type="number"
            step="0.5"
            value={formData.adjustment}
            onChange={(e) => setFormData({...formData, adjustment: e.target.value})}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Save Work Log
        </button>
      </form>

      {message && <p style={{ marginTop: '20px', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  )
}
