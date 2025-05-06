import { Builder, WebDriver } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'
import { DriverHelper } from '../../driver/driverHelper'

export const handler = async (event: any) => {
  console.log('Received event:', JSON.stringify(event, null, 2))

  const options = new chrome.Options()
  options.addArguments(
    '--headless',
    '--single-process',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-sandbox',
    '--enable-logging',
    '--v=1',
    '--vmodule=*browser*=2'
  )
  const driver: WebDriver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()

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
