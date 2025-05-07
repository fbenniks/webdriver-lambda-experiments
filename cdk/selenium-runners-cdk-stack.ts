import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BaseLambda } from './helpers/BaseLambda'
import * as path from 'node:path'
import { Duration, StackProps } from 'aws-cdk-lib'
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

    const runner = new lambda.DockerImageFunction(this, 'webdriver-state-experiment', {
      code: lambda.DockerImageCode.fromImageAsset(path.resolve(__dirname, '../'), {
        file: 'Dockerfile',
      }),
      memorySize: 2048,
      timeout: Duration.seconds(100),
      architecture: cdk.aws_lambda.Architecture.X86_64,
      environment: {
        URL: URL,
        S3_WEBDRIVER_DATA_BUCKET: s3Bucket.bucketName,
      },
    })
    s3Bucket.grantReadWrite(runner)
  }
}
