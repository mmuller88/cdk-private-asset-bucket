import * as cognito from '@aws-cdk/aws-cognito';
import * as core from '@aws-cdk/core';

import { PrivateAssetBucket } from '../src/index';

export class IntegTesting {
  readonly stack: core.Stack[];
  constructor() {
    const app = new core.App();

    const stack = new core.Stack(app, 'PrivateAssetBucket-stack');

    const userPool = new cognito.UserPool(stack, 'userPool', {
      removalPolicy: core.RemovalPolicy.DESTROY,
    });

    const userPoolWebClient = new cognito.UserPoolClient(stack, 'userPoolWebClient', {
      userPool: userPool,
      generateSecret: false,
      preventUserExistenceErrors: true,
      oAuth: {
        flows: {
          authorizationCodeGrant: false,
          implicitCodeGrant: true,
        },
      },
    });

    new PrivateAssetBucket(stack, 'ProwlerAudit', {
      userPoolId: userPool.userPoolId,
      userPoolClientId: userPoolWebClient.userPoolClientId,
    });

    this.stack = [stack];
  }
}

new IntegTesting();
