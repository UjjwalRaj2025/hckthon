import mongoose from 'mongoose'

const uri = 'mongodb+srv://256301212_db_user:G6eZK3aV2dtXGZcW@resqqq.9hcabih.mongodb.net/resqai?retryWrites=true&w=majority'

async function test() {
  try {
    console.log('Testing connection with database target...')
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    console.log('✅ SUCCESS! Connected to MongoDB Atlas!')
  } catch (err) {
    console.error('❌ MONGODB ERROR:', err.message)
  } finally {
    await mongoose.disconnect()
  }
}

test()
