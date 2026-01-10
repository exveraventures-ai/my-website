"use client"

import { supabase } from '../lib/supabase' 
import { useEffect, useState } from 'react'

export default function TestConnection() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from('Health_Metrics')
        .select('*')
        .limit(5)
      
      if (error) {
        console.error('Connection error:', error)
        setError(error.message)
      } else {
        console.log('Connection successful! Data:', data)
        setData(data)
      }
    }
    
    testConnection()
  }, [])

  return (
    <div>
      <h1>Supabase Connection Test</h1>
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}

