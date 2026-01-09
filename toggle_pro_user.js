// Script to toggle Pro user status
// Run with: node toggle_pro_user.js YOUR_EMAIL@example.com

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL not found in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const email = process.argv[2]

if (!email) {
  console.error('Usage: node toggle_pro_user.js YOUR_EMAIL@example.com')
  process.exit(1)
}

async function toggleProUser() {
  try {
    // Get current status
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, is_pro')
      .eq('email', email)
      .single()

    if (fetchError || !user) {
      console.error('Error fetching user:', fetchError?.message || 'User not found')
      process.exit(1)
    }

    console.log(`Current status for ${user.email}: is_pro = ${user.is_pro}`)

    // Toggle the status
    const newStatus = !user.is_pro
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ is_pro: newStatus })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError.message)
      process.exit(1)
    }

    console.log(`✅ Updated! New status for ${updatedUser.email}: is_pro = ${updatedUser.is_pro}`)
    console.log(`\n⚠️  Note: You may need to refresh your browser or log out and log back in for changes to take effect.`)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

toggleProUser()


