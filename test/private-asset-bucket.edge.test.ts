import * as lambda from 'aws-lambda';
import { handler } from '../src/private-asset-bucket.edge';

test('hello', async () => {
  try {
    const response = await handler(event);
    console.debug(response);

  } catch (err) {
    console.debug(err);
    // expect(err).toEqual();
  }
  // expect(new Hello().sayHello()).toBe('hello, world!');
});

const event: lambda.CloudFrontRequestEvent = {
  Records: [{
    cf: {
      config: {
        distributionDomainName: '',
        distributionId: '',
        eventType: 'origin-request',
        requestId: '',
      },
      request: {
        clientIp: '',
        method: 'get',
        uri: '/pic.png',
        querystring: '',
        headers: {},
      },
    },
  }],
};