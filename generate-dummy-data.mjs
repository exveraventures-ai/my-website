import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ckoligbxqvxfknzmuunc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrb2xpZ2J4cXZ4Zmtuem11dW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTIzODYsImV4cCI6MjA4MjQ4ODM4Nn0.yiTIdn5gdTaR-5p50nVr6yMcz3xY75bcjD-BO27lq-U'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

function generateDummyData() {
  const data = []
  const today = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  let currentDate = new Date(oneYearAgo)

  while (currentDate <= today) {
    const dayOfWeek = currentDate.getDay()
    
    // Skip some weekends (not all - bankers work weekends sometimes!)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (Math.random() > 0.3) { // 70% chance to skip weekend days
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }
    }

    // Generate varying work patterns
    let baseHours
    const rand = Math.random()
    
    if (rand < 0.15) {
      // 15% - Brutal days (14-18 hours)
      baseHours = 14 + Math.random() * 4
    } else if (rand < 0.35) {
      // 20% - Heavy days (12-14 hours)
      baseHours = 12 + Math.random() * 2
    } else if (rand < 0.70) {
      // 35% - Standard long days (10-12 hours)
      baseHours = 10 + Math.random() * 2
    } else {
      // 30% - Lighter days (8-10 hours)
      baseHours = 8 + Math.random() * 2
    }

    // Add some randomness for realistic variation
    const hours = Math.round((baseHours + (Math.random() - 0.5)) * 2) / 2 // Round to nearest 0.5

    // Generate realistic start times (mostly 8-10am)
    const startHour = 8 + Math.floor(Math.random() * 2)
    const startMinute = Math.random() > 0.5 ? 0 : 30
    
    const endHour = startHour + Math.floor(hours)
    const endMinute = startMinute + ((hours % 1) * 60)

    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`
    const endTime = `${String(endHour % 24).padStart(2, '0')}:${String(Math.floor(endMinute) % 60).padStart(2, '0')}:00`

    data.push({
      Date: currentDate.toISOString().split('T')[0],
      'Start Time': startTime,
      'End Time': endTime,
      adjustment: 0,
      hours: hours
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return data
}

async function insertDummyData() {
  console.log('Generating dummy data for the past year...')
  const dummyData = generateDummyData()
  
  console.log(`Generated ${dummyData.length} work log entries`)
  console.log('Sample entry:', dummyData[0])
  
  console.log('\nInserting data into Supabase...')
  
  // Insert in batches of 100 to avoid hitting limits
  const batchSize = 100
  for (let i = 0; i < dummyData.length; i += batchSize) {
    const batch = dummyData.slice(i, i + batchSize)
    
    const { data, error } = await supabase
      .from('Work_Logs')
      .insert(batch)
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
    } else {
      console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} entries)`)
    }
  }
  
  console.log('\n✅ Dummy data insertion complete!')
  console.log(`Total entries: ${dummyData.length}`)
  console.log(`Date range: ${dummyData[0].Date} to ${dummyData[dummyData.length - 1].Date}`)
}

insertDummyData()