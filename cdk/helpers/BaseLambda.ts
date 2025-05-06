import * as cdk from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'

import { Construct } from 'constructs'
import { Duration } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'

export class BaseLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, stage: string, props: NodejsFunctionProps) {
    super(scope, `${stage}-${id}`, {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      architecture: cdk.aws_lambda.Architecture.X86_64,
      memorySize: 256,
      timeout: Duration.seconds(10),
      handler: 'handler',
      bundling: {
        minify: true,
        target: 'es2020',
      },
      functionName: `${stage}-${id}`,
      ...props,
    })
  }

  public addInlinePolicy(props: { actions: string[]; resources: string[]; policyName: string }) {
    const policyStatement = new iam.PolicyStatement({
      actions: props.actions,
      resources: props.resources,
    })
    const policy = new iam.Policy(this, `${props.policyName}`, {
      statements: [policyStatement],
    })
    this.role?.attachInlinePolicy(policy)
  }
}
