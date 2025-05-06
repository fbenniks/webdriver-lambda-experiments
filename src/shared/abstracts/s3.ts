import { S3 } from '@aws-sdk/client-s3'

export abstract class AbstractS3 {
  protected params: {
    Bucket: string
  }
  protected client: S3

  constructor(bucketName: string) {
    this.client = new S3({ region: 'us-east-1' })
    this.params = { Bucket: bucketName }
  }

  async listObjects() {
    return this.client.listObjects(this.params)
  }

  async getObject(key: string) {
    const getObjectParams = {
      ...this.params,
      Key: key,
    }

    return this.client.getObject(getObjectParams)
  }

  public async putObject(key: string, body: string | Uint8Array | readonly number[]) {
    const putObjectParams = {
      ...this.params,
      Key: key,
      Body: this.convertToBuffer(body),
    }
    await this.client.putObject(putObjectParams)
  }

  private convertToBuffer(body: string | Uint8Array | readonly number[]): Buffer {
    if (typeof body === 'string') {
      return Buffer.from(body, 'utf-8')
    } else if (body instanceof Uint8Array) {
      return Buffer.from(body)
    } else if (Array.isArray(body)) {
      return Buffer.from(body)
    }
    throw new Error('Unsupported body type')
  }
}
