import * as cognito from '@aws-cdk/aws-cognito';
import * as core from '@aws-cdk/core';

import { PrivateAssetBucket } from '../src/index';

export class IntegTesting {
  readonly stack: core.Stack[];
  constructor() {
    const app = new core.App();

    const stack = new core.Stack(app, 'PrivateAssetBucket-stack2', {
      env: {
        account: '981237193288',
        region: 'us-east-1',
      },
    });

    const userPool = new cognito.UserPool(stack, 'userPool', {
      removalPolicy: core.RemovalPolicy.DESTROY,
    });

    const userPoolWebClient = new cognito.UserPoolClient(stack, 'userPoolWebClient', {
      userPool: userPool,
      generateSecret: false,
      preventUserExistenceErrors: true,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: false,
          implicitCodeGrant: true,
        },
      },
    });

    const privateAssetBucket = new PrivateAssetBucket(stack, 'privateAssetBucket', {
      userPoolId: userPool.userPoolId,
      userPoolClientId: userPoolWebClient.userPoolClientId,
    });

    new core.CfnOutput(stack, 'AssetBucketName', {
      value: privateAssetBucket.assetBucketName,
    });

    new core.CfnOutput(stack, 'AssetBucketCloudfrontUrl', {
      value: privateAssetBucket.assetBucketCloudfrontUrl,
    });

    this.stack = [stack];
  }
}

new IntegTesting();
