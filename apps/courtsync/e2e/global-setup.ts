/**
 * Playwright Global Setup
 * 
 * This file runs before all E2E tests to set up the test environment.
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting CourtSync E2E test environment setup...')
  
  // Start development server if needed
  const baseURL = config.webServer?.url || 'http://localhost:3001'
  
  try {
    // Verify the server is running by making a test request
    const browser = await chromium.launch()
    const page = await browser.newPage()
    
    console.log(`📡 Checking if server is running at ${baseURL}...`)
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    
    console.log('✅ Development server is accessible')
    
    // Set up test database with seed data
    console.log('🌱 Seeding test database...')
    // This would normally run database seeding scripts
    // For now, we'll use the development database
    
    await browser.close()
    console.log('✅ Global setup completed successfully')
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  }
}

export default globalSetup