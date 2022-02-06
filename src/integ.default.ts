import { App, Stack } from '@aws-cdk/core';

import { PrivateAssetBucket } from '../src/index';

export class IntegTesting {
  readonly stack: Stack[];
  constructor() {
    const app = new App();

    const stack = new Stack(app, 'PrivateAssetBucket-stack');

    new PrivateAssetBucket(stack, 'ProwlerAudit', {
      userPoolId: 'my-central_123',
      userPoolClientId: 'e3122222',
    });

    this.stack = [stack];
  }
}

new IntegTesting();
