// Next.js Test Data Generator for Burnout IQ
// Run with: node generate_test_data.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Test data generation script for Burnout IQ

const POSITIONS = [
  'Analyst', 'Associate', 'VP', 'Director', 'Managing Director',
  'Consultant', 'Senior Consultant', 'Manager', 'Senior Manager', 'Partner'
]

const REGIONS = [
  'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'
]

const COMPANIES = [
  'Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Blackstone', 'KKR',
  'McKinsey', 'Bain', 'BCG', 'Deloitte', 'PwC', 'EY', 'KPMG',
  'Carlyle Group', 'Apollo Global', 'Warburg Pincus', 'TPG Capital'
]

const FIRST_NAMES = [
  'James', 'Emma', 'Oliver', 'Sophia', 'William', 'Ava', 'Henry', 'Isabella',
  'Alexander', 'Charlotte', 'Michael', 'Amelia', 'Daniel', 'Mia', 'David', 'Harper',
  'John', 'Evelyn', 'Joseph', 'Abigail', 'Thomas', 'Emily', 'Charles', 'Elizabeth'
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson'
]

function generateWeeklyHours() {
  const mean = 57
  const stdDev = 12
  const hours = mean + (Math.random() + Math.random() + Math.random() + Math.random() - 2) * stdDev
  return Math.max(30, Math.min(85, hours))
}

function generateUser(index) {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@testburnoutiQ.com`
  
  return {
    email: email,
    position: POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
    company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
    region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
    is_pro: Math.random() > 0.7,
    age: 24 + Math.floor(Math.random() * 20),
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    height_cm: 160 + Math.floor(Math.random() * 30),
    weight_kg: 55 + Math.floor(Math.random() * 45),
    created_at: new Date().toISOString()
  }
}

function generateWorkLogs(userId, numDays = 60) {
  const logs = []
  
  for (let i = 0; i < numDays; i++) {
    if (Math.random() > 0.15) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const dailyHours = generateWeeklyHours() / 5
      const hours = Math.round(dailyHours * 10) / 10
      
      logs.push({
        user_id: userId,
        Date: date.toISOString().split('T')[0],
        hours: hours,
        created_at: new Date().toISOString()
      })
    }
  }
  
  return logs
}

async function generateTestData() {
  console.log('🚀 Starting test data generation...')
  
  const NUM_USERS = 50
  const LOGS_PER_USER = 60
  
  try {
    console.log(`\n📝 Generating ${NUM_USERS} test users...`)
    const users = []
    
    for (let i = 0; i < NUM_USERS; i++) {
      const user = generateUser(i)
      
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
      
      if (error) {
        console.error(`Error creating user ${i}:`, error)
        continue
      }
      
      if (data && data[0]) {
        users.push(data[0])
        console.log(`✅ Created user ${i + 1}/${NUM_USERS}: ${user.email} (${user.position}, ${user.region})`)
      }
    }
    
    console.log(`\n✅ Successfully created ${users.length} users`)
    
    console.log(`\n📊 Generating work logs for each user...`)
    let totalLogs = 0
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const logs = generateWorkLogs(user.id, LOGS_PER_USER)
      
      const batchSize = 100
      for (let j = 0; j < logs.length; j += batchSize) {
        const batch = logs.slice(j, j + batchSize)
        const { error } = await supabase
          .from('Work_Logs')
          .insert(batch)
        
        if (error) {
          console.error(`Error inserting logs for user ${user.email}:`, error)
        }
      }
      
      totalLogs += logs.length
      console.log(`✅ Created ${logs.length} logs for user ${i + 1}/${users.length}: ${user.email}`)
    }
    
    console.log(`\n✅ Successfully created ${totalLogs} work logs`)
    
    console.log(`\n📊 Generating cohort statistics...`)
    await generateCohortStats()
    
    console.log(`\n🎉 Test data generation complete!`)
    console.log(`\nSummary:`)
    console.log(`- Users created: ${users.length}`)
    console.log(`- Work logs created: ${totalLogs}`)
    console.log(`- Average logs per user: ${(totalLogs / users.length).toFixed(1)}`)
    
    console.log(`\n📊 Cohort Breakdown:`)
    const cohortMap = {}
    users.forEach(user => {
      const key = `${user.position} - ${user.region}`
      cohortMap[key] = (cohortMap[key] || 0) + 1
    })
    
    Object.entries(cohortMap)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cohort, count]) => {
        console.log(`  ${cohort}: ${count} users`)
      })
    
  } catch (error) {
    console.error('❌ Error generating test data:', error)
  }
}

async function generateCohortStats() {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, position, region')
    
    if (usersError) throw usersError
    
    const cohorts = {}
    users.forEach(user => {
      const key = `${user.position}_${user.region}`
      if (!cohorts[key]) {
        cohorts[key] = {
          cohort_key: key,
          position: user.position,
          region: user.region,
          user_ids: []
        }
      }
      cohorts[key].user_ids.push(user.id)
    })
    
    for (const [cohortKey, cohort] of Object.entries(cohorts)) {
      if (cohort.user_ids.length < 5) {
        console.log(`⚠️  Skipping ${cohortKey} (only ${cohort.user_ids.length} users, need 5+)`)
        continue
      }
      
      const { data: logs, error: logsError } = await supabase
        .from('Work_Logs')
        .select('user_id, hours, Date')
        .in('user_id', cohort.user_ids)
      
      if (logsError) throw logsError
      
      const userWeeklyHours = {}
      logs.forEach(log => {
        if (!userWeeklyHours[log.user_id]) {
          userWeeklyHours[log.user_id] = []
        }
        userWeeklyHours[log.user_id].push(log.hours)
      })
      
      const weeklyAverages = Object.values(userWeeklyHours).map(hours => {
        const total = hours.reduce((sum, h) => sum + h, 0)
        const days = hours.length
        return (total / days) * 7
      })
      
      weeklyAverages.sort((a, b) => a - b)
      const p25 = weeklyAverages[Math.floor(weeklyAverages.length * 0.25)]
      const p50 = weeklyAverages[Math.floor(weeklyAverages.length * 0.50)]
      const p75 = weeklyAverages[Math.floor(weeklyAverages.length * 0.75)]
      
      const { error: upsertError } = await supabase
        .from('cohort_stats')
        .upsert({
          cohort_key: cohortKey,
          position: cohort.position,
          region: cohort.region,
          user_count: cohort.user_ids.length,
          p25_weekly_hours: p25,
          median_weekly_hours: p50,
          p75_weekly_hours: p75,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'cohort_key'
        })
      
      if (upsertError) throw upsertError
      
      console.log(`✅ Generated stats for ${cohortKey}: ${cohort.user_ids.length} users, median ${p50.toFixed(1)} hrs/week`)
    }
    
    console.log(`\n✅ Cohort statistics generated successfully`)
    
  } catch (error) {
    console.error('❌ Error generating cohort stats:', error)
  }
}

generateTestData()