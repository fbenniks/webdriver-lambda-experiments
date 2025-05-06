import { AbstractS3 } from '../shared/abstracts/s3'

export class WebdriverDataS3 extends AbstractS3 {
  constructor() {
    super(process.env.S3_WEBDRIVER_DATA_BUCKET!)
  }

  async getObject(key: string) {
    return super.getObject(key)
  }

  async putObject(body: string | Uint8Array | readonly number[], key: string) {
    return super.putObject(key, body)
  }
  async readDataAsJSON(key: string): Promise<any | undefined> {
    try {
      const s3Object = await this.getObject(key)
      const str = await s3Object.Body?.transformToString()
      return JSON.parse(str!) as any
    } catch (error) {
      console.error('readDataSet', { error })
      return undefined
    }
  }
}
