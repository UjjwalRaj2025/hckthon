import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.VITE_GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: API_KEY })

async function listModels() {
  try {
    const res = await ai.models.list()
    console.log(res)
  } catch (err) {
    console.error('List models error:', err)
  }
}

listModels()
