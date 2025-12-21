import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '..', '.env')
dotenv.config({ path: envPath })

import { connectDatabase, disconnectDatabase } from '../src/config/database.js'
import InterviewQuestion from '../src/models/InterviewQuestion.js'

const main = async () => {
  try {
    console.log('🚀 Starting HR Questions Seeding Process...\n')

    // Connect to database
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI is not defined in environment variables')
    }

    console.log('📡 Connecting to MongoDB...')
    await connectDatabase(mongoUri)
    console.log('✅ Connected to MongoDB\n')

    // Read questions from JSON file
    const questionsPath = path.join(__dirname, 'hrQuestions.json')
    console.log(`📖 Reading questions from: ${questionsPath}`)
    
    const fileContent = await fs.readFile(questionsPath, 'utf-8')
    const questions = JSON.parse(fileContent)
    
    console.log(`✅ Loaded ${questions.length} questions from file\n`)

    // Check existing questions
    const existingCount = await InterviewQuestion.countDocuments({ subject: 'HR' })
    console.log(`📊 Existing HR questions in database: ${existingCount}`)

    if (existingCount > 0) {
      console.log('\n⚠️  Warning: HR questions already exist in the database.')
      console.log('Choose an option:')
      console.log('  1. Delete existing and insert new (recommended)')
      console.log('  2. Skip if exists (keep existing)')
      console.log('  3. Insert only new questions (by order number)')
      console.log('\n💡 Run with argument: node seedHRQuestions.js [replace|skip|merge]')
      
      const mode = process.argv[2] || 'replace'
      console.log(`\n🔧 Mode selected: ${mode}`)

      if (mode === 'replace') {
        console.log('\n🗑️  Deleting existing HR questions...')
        const deleteResult = await InterviewQuestion.deleteMany({ subject: 'HR' })
        console.log(`✅ Deleted ${deleteResult.deletedCount} existing questions\n`)
      } else if (mode === 'skip') {
        console.log('\n⏭️  Skipping seeding - keeping existing questions')
        await disconnectDatabase()
        console.log('\n✨ Process completed!')
        process.exit(0)
      } else if (mode === 'merge') {
        console.log('\n🔀 Merging mode - will insert only new questions...')
        const existingOrders = await InterviewQuestion.distinct('order', { subject: 'HR' })
        const newQuestions = questions.filter(q => !existingOrders.includes(q.order))
        
        if (newQuestions.length === 0) {
          console.log('✅ No new questions to insert - all orders already exist')
          await disconnectDatabase()
          console.log('\n✨ Process completed!')
          process.exit(0)
        }
        
        console.log(`📝 Found ${newQuestions.length} new questions to insert\n`)
        
        console.log('💾 Inserting new questions...')
        const insertResult = await InterviewQuestion.insertMany(newQuestions, { ordered: false })
        console.log(`✅ Successfully inserted ${insertResult.length} new questions\n`)
        
        await disconnectDatabase()
        console.log('✨ Seeding completed successfully!\n')
        
        console.log('📊 Summary:')
        console.log(`   - New questions added: ${insertResult.length}`)
        console.log(`   - Total HR questions: ${existingCount + insertResult.length}`)
        
        process.exit(0)
      }
    }

    // Insert questions
    console.log('💾 Inserting questions into database...')
    
    let successCount = 0
    let errorCount = 0
    const errors = []

    for (let i = 0; i < questions.length; i++) {
      try {
        await InterviewQuestion.create(questions[i])
        successCount++
        
        // Progress indicator every 10 questions
        if ((i + 1) % 10 === 0) {
          console.log(`   ... ${i + 1}/${questions.length} questions processed`)
        }
      } catch (error) {
        errorCount++
        errors.push({
          order: questions[i].order,
          question: questions[i].question.substring(0, 50) + '...',
          error: error.message
        })
      }
    }

    console.log(`\n✅ Successfully inserted ${successCount} questions`)
    
    if (errorCount > 0) {
      console.log(`\n⚠️  ${errorCount} questions failed to insert:`)
      errors.forEach(err => {
        console.log(`   - Order ${err.order}: ${err.question}`)
        console.log(`     Error: ${err.error}`)
      })
    }

    // Verify insertion
    const finalCount = await InterviewQuestion.countDocuments({ subject: 'HR' })
    console.log(`\n📊 Total HR questions in database: ${finalCount}`)

    // Sample query to verify
    const sampleQuestions = await InterviewQuestion.find({ subject: 'HR' })
      .sort({ order: 1 })
      .limit(3)
      .select('order question tags')

    console.log('\n📝 Sample questions (first 3):')
    sampleQuestions.forEach(q => {
      console.log(`   ${q.order}. ${q.question.substring(0, 60)}...`)
      console.log(`      Tags: ${q.tags.join(', ')}`)
    })

    // Disconnect
    await disconnectDatabase()
    console.log('\n✨ Seeding completed successfully!')
    console.log('\n💡 Usage examples:')
    console.log('   - View all: GET /api/interview-questions?subject=HR')
    console.log('   - Filter by tag: GET /api/interview-questions?subject=HR&tags=motivation')
    console.log('   - Get specific: GET /api/interview-questions/:id')

  } catch (error) {
    console.error('\n❌ Error during seeding:')
    console.error(error)
    await disconnectDatabase()
    process.exit(1)
  }
}

// Run the script
main()
