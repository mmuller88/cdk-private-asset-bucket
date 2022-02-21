import * as lambda from 'aws-lambda';
import { CognitoJwtVerifier } from './aws-jwt-verify-ripout/cognito-verifier';

export async function handler(event: lambda.CloudFrontRequestEvent) {
  console.debug(`event: ${JSON.stringify(event)}`);

  const request = event.Records[0].cf.request;
  // Example request including the token.
  // "request": {
  //     "headers": {
  //         "cookie": [
  //             {
  //                 "key": "Cookie",
  //                 "value": "token=ey123"
  //             }
  //         ],
  //     },
  // }
  // Consider using Postman for testing like with cookies. See more in the Readme.

  const token = (request.headers.cookie?.filter(cookie => cookie.key === 'Cookie' && cookie.value.startsWith('token'))?.[0]?.value.substring(6)) || 'notValid';
  if (token) {
    console.debug('got token in cookie');

    const userPoolId = request.origin?.s3?.customHeaders['x-env-userpoolid'][0].value || '';
    const clientId = request.origin?.s3?.customHeaders['x-env-clientid'][0].value || '';
    const tokenUse = request.origin?.s3?.customHeaders['x-env-tokenuse'][0].value || '';

    console.debug(`userPoolId: ${userPoolId}`);
    console.debug(`clientId: ${clientId}`);

    const verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: tokenUse === 'access' ? 'access' : tokenUse === 'id' ? 'id' : null,
      clientId,
    });
    try {
      const payload = await verifier.verify(token);
      console.debug('Token is valid. Payload:', payload);
      return request;
    } catch {
      console.error(`Unauthorized JWT ${token === 'notValid' ? 'missing token' : ''}`);
      const response = {
        status: '401',
        statusDescription: `Unauthorized JWT ${token === 'notValid' ? 'missing token' : ''}`,
        headers: {
          location: [
            {
              key: 'Location',
              value: 'www.mianio.com/401',
            },
          ],
        },
      };
      return response;
    }

    // return { status: 200, body: `hab token ${token}` };
  } else {
    console.debug('got no token in cookie :(');
  }

  const unauthorizedResponse = {
    status: '403',
    statusDescription: 'Forbidden',
    headers: {
      location: [
        {
          key: 'Location',
          value: 'www.mianio.com/403',
        },
      ],
    },
  };

  return unauthorizedResponse;
}