import { Builder, WebDriver } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'
import { DriverHelper } from '../../driver/driver-helper'
import { exec } from 'child_process'

export const handler = async (event: any) => {
  console.log('Received event:', JSON.stringify(event, null, 2))
  console.log('checking versions-> usefull for debugging in docker')

  // Inline code to check Chrome version
  const checkVersion = async (command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      exec(command, (error: Error | null, stdout: string, stderr: string) => {
        if (error) {
          reject(`Error: ${stderr || error.message}`)
        } else {
          resolve(stdout.trim())
        }
      })
    })
  }

  try {
    const chromeVersion = await checkVersion('google-chrome --version')
    console.log(`Google Chrome version: ${chromeVersion}`)

    const chromedriverVersion = await checkVersion('chromedriver --version')
    console.log(`Chromedriver version: ${chromedriverVersion}`)
  } catch (error) {
    console.error('Error checking versions:', error)
  }
  const options = new chrome.Options()
  options.addArguments(
    '--headless',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--single-process',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--disable-software-rasterizer',
    '--disable-extensions',
    '--disable-logging',
    '--disable-accelerated-2d-canvas',
    '--disable-accelerated-video-decode',
    '--disable-hardware-media-key-handling'
  )
  options.setChromeBinaryPath(process.env.CHROME_BIN!)
  const serviceBuilder = new chrome.ServiceBuilder(process.env.CHROMEDRIVER_BIN!)
  console.log('serviceBuilder created')

  const driver: WebDriver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(serviceBuilder)
    .build()

  console.log('Driver created')

  const result = []

  try {
    const driverHelper = new DriverHelper(driver)
    await driverHelper.loadPage(process.env.URL || 'http://localhost:3000')
    let session = await driverHelper.getSession()
    if (!session) {
      await driverHelper.setSession()
      session = await driverHelper.getSession()
      if (session) {
        result.push(`Session did not exists, setting it now: ${session}`)
      }
    } else {
      result.push(`Session already exists: ${session}`)
    }

    let cookie = await driverHelper.getCookie()
    if (!cookie) {
      await driverHelper.setCookie()
      cookie = await driverHelper.getCookie()
      if (cookie) {
        result.push(`Cookie did not exists, setting it now: ${cookie}`)
      }
    } else {
      result.push(`Cookie already exists: ${cookie}`)
    }

    let localStorage = await driverHelper.getLocalStorage()
    if (!localStorage) {
      await driverHelper.setLocalStorage()
      localStorage = await driverHelper.getLocalStorage()
      if (localStorage) {
        result.push(`Localstorage did not exists, setting it now: ${localStorage}`)
      }
    } else {
      result.push(`Localstorage already exists: ${localStorage}`)
    }

    await driverHelper.saveData()
  } finally {
    await driver.quit()
  }
  console.log(result)
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  }
}
