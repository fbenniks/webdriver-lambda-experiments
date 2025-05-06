import { By, until, WebDriver } from 'selenium-webdriver'
import { WebdriverDataS3 } from '../adapters/webdriver-data-s3'

//path to work dir pwd
const WORK_DIR = process.cwd() || '/tmp'
const COOKIE_FILE = WORK_DIR + '/data/cookies.json'
const SESSION_FILE = WORK_DIR + '/data/session.json'
const LOCAL_STORAGE_FILE = WORK_DIR + '/data/localStorage.json'

export class DriverHelper {
  private driver: WebDriver
  private storage: WebdriverDataS3
  constructor(driver: WebDriver) {
    this.driver = driver
    this.storage = new WebdriverDataS3()
  }

  public async loadPage(url: string) {
    await this.driver.get(url)
    await this.loadData()
    await this.driver.navigate().refresh()
  }

  public async getSession(): Promise<string | undefined> {
    const sessionLabel = await this.driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/header/label[1]')),
      5000
    )
    const sessionLabelValue = await sessionLabel.getText()
    if (sessionLabelValue.split(':')[1].includes('Hello')) {
      return sessionLabelValue
    }
    return undefined
  }

  public async setSession() {
    const sessionButton = await this.driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/header/button[1]')),
      5000
    )
    await sessionButton.click()
  }

  public async getCookie(): Promise<string | undefined> {
    const cookieLabel = await this.driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/header/label[2]')),
      5000
    )
    const cookieLabelValue = await cookieLabel.getText()
    if (cookieLabelValue.split(':')[1].includes('Hello')) {
      return cookieLabelValue
    }
    return undefined
  }

  public async setCookie() {
    const cookieButton = await this.driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/header/button[2]')),
      5000
    )
    await cookieButton.click()
  }

  public async getLocalStorage(): Promise<string | undefined> {
    const cookieLabel = await this.driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/header/label[3]')),
      5000
    )
    const cookieLabelValue = await cookieLabel.getText()
    if (cookieLabelValue.split(':')[1].includes('Hello')) {
      return cookieLabelValue
    }
    return undefined
  }

  public async setLocalStorage() {
    const cookieButton = await this.driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/header/button[3]')),
      5000
    )
    await cookieButton.click()
  }

  public async loadData() {
    await this.loadCookies()
    await this.loadSession()
    await this.loadLocalStorage()
  }

  public async saveData() {
    await this.saveCookies()
    await this.saveSessionData()
    await this.saveLocalStorageData()
  }

  private async loadCookies() {
    const data = await this.storage.readDataAsJSON(COOKIE_FILE)
    if (data) {
      for (const cookie of data) {
        await this.driver.manage().addCookie(cookie)
      }
    }
  }
  // Save cookies to a file
  private async saveCookies() {
    const data = await this.driver.manage().getCookies()
    await this.storage.putObject(JSON.stringify(data, null, 2), COOKIE_FILE)
  }

  private async loadSession() {
    const data = await this.storage.readDataAsJSON(SESSION_FILE)
    if (data) {
      for (const key of Object.keys(data)) {
        await this.driver.executeScript(
          (key: string, value: string) => {
            sessionStorage.setItem(key, value)
          },
          key,
          data[key]
        )
      }
    }
  }

  private async saveSessionData() {
    const data = await this.driver.executeScript(() => {
      const data: { [key: string]: string } = {}
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) {
          data[key] = sessionStorage.getItem(key) || ''
        }
      }
      return data
    })
    await this.storage.putObject(JSON.stringify(data, null, 2), SESSION_FILE)
  }

  private async saveLocalStorageData() {
    const data = await this.driver.executeScript(() => {
      const data: { [key: string]: string } = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          data[key] = localStorage.getItem(key) || ''
        }
      }
      return data
    })
    await this.storage.putObject(JSON.stringify(data, null, 2), LOCAL_STORAGE_FILE)
  }

  private async loadLocalStorage() {
    const data = await this.storage.readDataAsJSON(LOCAL_STORAGE_FILE)
    if (data) {
      for (const key of Object.keys(data)) {
        await this.driver.executeScript(
          (key: string, value: string) => {
            localStorage.setItem(key, value)
          },
          key,
          data[key]
        )
      }
    }
  }
}
