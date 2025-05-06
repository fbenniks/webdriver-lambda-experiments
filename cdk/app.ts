import * as cdk from 'aws-cdk-lib'
import { ReactSiteCdkStack } from './react-site-cdk-stack'
import { SeleniumRunnersCdkStack } from './selenium-runners-cdk-stack'

const app = new cdk.App()

const reactStack = new ReactSiteCdkStack(app, 'ReactSiteCdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})

new SeleniumRunnersCdkStack(app, 'SeleniumRunnersCdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  URL: reactStack.cloudFrontURL,
})
