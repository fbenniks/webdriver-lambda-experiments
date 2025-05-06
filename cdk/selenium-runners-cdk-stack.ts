import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BaseLambda } from './helpers/BaseLambda'
import * as path from 'node:path'
import { StackProps } from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'

interface SeleniumRunnersCdkStackProps extends StackProps {
  URL: string
}

export class SeleniumRunnersCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SeleniumRunnersCdkStackProps) {
    super(scope, id, props)
    const { URL } = props

    //create s3 bucket
    const s3Bucket = new cdk.aws_s3.Bucket(this, 'selenium-runners-cdk-bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const chromiumLayer = new lambda.LayerVersion(this, 'CustomChromiumLayerWithDriver', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/lambdas/layers/layer-headless_chrome-v0.2-beta.0.zip')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      compatibleArchitectures: [lambda.Architecture.X86_64],
      description: 'Custom Chromium Layer for Selenium with driver',
    })

    const runner = new BaseLambda(this, `webdriver-state-experiment`, 'demo', {
      entry: path.join(__dirname, '../src/lambdas/webdriver-state-experiment/index.ts'),
      layers: [chromiumLayer],
      architecture: cdk.aws_lambda.Architecture.X86_64,
      memorySize: 1024,
      environment: {
        URL: URL,
        S3_WEBDRIVER_DATA_BUCKET: s3Bucket.bucketName,
        FONTCONFIG_PATH: '/opt/etc/fonts',
      },
    })
    s3Bucket.grantReadWrite(runner)
  }
}
