[![NPM version](https://badge.fury.io/js/cdk-private-asset-bucket.svg)](https://badge.fury.io/js/cdk-private-asset-bucket)
[![PyPI version](https://badge.fury.io/py/cdk-private-asset-bucket.svg)](https://badge.fury.io/py/cdk-private-asset-bucket)
[![.NET version](https://img.shields.io/nuget/v/com.github.mmuller88.cdkPrivateAssetBucket.svg?style=flat-square)](https://www.nuget.org/packages/com.github.mmuller88.cdkPrivateAssetBucket/)
![Release](https://github.com/mmuller88/cdk-private-asset-bucket/workflows/Release/badge.svg)

# cdk-private-asset-bucket

A construct to create a private asset S3 bucket. Cognito will be used for token validation with Lambda@Edge.

## Architecture

![Diagram](misc/cdkPrivateAssetBucket.drawio.png)

# Example
```ts
import { ProwlerAudit } from 'cdk-prowler';
...
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
```

## Properties

[API.md](API.md)

## Test PrivateBucketAsset

If you forged / cloned that repo you can test directly from here. Don't forget to init with:

```bash
yarn install
```

Create a test cdk stack with one of the following:

```bash
yarn cdk deploy
yarn cdk deploy --watch
yarn cdk deploy --require-approval never
```

- Upload a picture named like pic.png to the private asset bucket
- Create a user pool user and get / save the token:

```bash
USER_POOL_ID=us-east-1_0Aw1oPvD6
CLIENT_ID=3eqcgvghjbv4d5rv32hopmadu8
USER_NAME=martindev
USER_PASSWORD=M@rtindev1
REGION=us-east-1
CFD=d1f2bfdek3mzi7.cloudfront.net

aws cognito-idp admin-create-user --user-pool-id $USER_POOL_ID --username $USER_NAME --region $REGION
aws cognito-idp admin-set-user-password --user-pool-id $USER_POOL_ID --username $USER_NAME --password $USER_PASSWORD  --permanent --region $REGION
ACCESS_TOKEN=$(aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --client-id $CLIENT_ID --auth-parameters USERNAME=$USER_NAME,PASSWORD=$USER_PASSWORD  --region $REGION | jq -r '.AuthenticationResult.AccessToken')

echo "curl --location --request GET "https://$CFD/pic.png" --cookie "Cookie: token=$ACCESS_TOKEN""
```

- You can use the curl for importing in Postman. but it looks like Postman can't import the cookie. So you need to set the cookie manually in Postman!
- In Postman you should see your picture :)

## Planned Features

- Support S3 bucket import ootb.
- Support custom authorizer
- Leverage Cloudfront Function for cheaper costs

## Misc

- There is currently my aws-cdk PR open for importing the Typescript Lambda@Edge interface https://github.com/aws/aws-cdk/pull/18836

## Thanks To

- Crespo Wang for his pioneer work regarding private S3 assets https://javascript.plainenglish.io/use-lambda-edge-jwt-to-secure-s3-bucket-dcca6eec4d7e
- As always to the amazing CDK / Projen Community. Join us on [Slack](https://cdk-dev.slack.com)!
- [Projen](https://github.com/projen/projen) project and the community around it
- To you for checking this out. Check me out and perhaps give me feedback https://martinmueller.dev
