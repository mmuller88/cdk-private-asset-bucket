// import { CognitoJwtVerifier } from 'aws-jwt-verify';
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
  // Consider using Postman with collection in test/Test.postman_collection.json for testing like with cookies.
  // For Debugging with Cloudwatch go to the AWS Console --> Cloudwatch --> Log groups --> switch to the region you are closest to --> figure out which log group is correct

  const token = request.headers.cookie.filter(cookie => cookie.key === 'Cookie' && cookie.value.startsWith('token'))?.[0].value.substring(6);
  if (token) {
    console.debug('got token in cookie');

    const userPoolId = request.origin?.s3?.customHeaders['x-env-userpoolid'][0].value || '';
    const clientId = request.origin?.s3?.customHeaders['x-env-clientid'][0].value || '';

    console.debug(`userPoolId: ${userPoolId}`);
    console.debug(`clientId: ${clientId}`);

    const verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: 'access',
      clientId,
    });
    try {
      const payload = await verifier.verify(token);
      console.debug('Token is valid. Payload:', payload);
      return request;
    } catch {
      console.error('Invalid JWT token');
      const response = {
        status: '401',
        statusDescription: 'Unauthorized JWT',
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