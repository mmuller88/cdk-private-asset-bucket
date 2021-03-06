const fs = require('fs');
const { awscdk } = require('projen');

const exampleFile = fs
  .readFileSync('src/integ.default.ts', 'utf8')
  .split('\n');
const example = exampleFile.slice(17, exampleFile.length - 7);

const cdkVersion = '2.21.0';

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Martin Mueller https://martinmueller.dev/resume',
  authorAddress: 'damadden88@googlemail.com',
  jsiiFqn: 'projen.AwsCdkConstructLibrary',
  minNodeVersion: '14.17.0',
  description: 'Construct to create a private asset S3 bucket. A cognito token can be used to allow access to he S3 asset.',
  cdkVersion,
  defaultReleaseBranch: 'main',
  name: 'cdk-private-asset-bucket',
  repositoryUrl: 'https://github.com/mmuller88/cdk-private-asset-bucket',
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  autoApproveOptions: {
    allowedUsernames: ['aws-cdk-automation', 'github-bot'],
    secret: 'GITHUB_TOKEN',
  },
  bundledDeps: [
    '@types/aws-lambda',
    'aws-lambda',
  ],
  devDeps: [
    // 'aws-jwt-verify',
    'aws-lambda',
    '@types/aws-lambda',
    `aws-cdk@${cdkVersion}`,
    'cdk-dia',
  ],
  catalog: {
    twitter: 'MartinMueller_',
  },
  keywords: [
    's3',
    'asset',
    'private',
    'cognito',
    'aws',
    'cdk',
  ],
  publishToPypi: {
    distName: 'cdk-private-asset-bucket',
    module: 'cdk_private_asset_bucket',
  },
  // publishToNuget: {
  //   dotNetNamespace: 'com.github.mmuller88',
  //   packageId: 'com.github.mmuller88.cdkPrivateAssetBucket',
  // },
  readme: {
    contents: `[![NPM version](https://badge.fury.io/js/cdk-private-asset-bucket.svg)](https://badge.fury.io/js/cdk-private-asset-bucket)
[![PyPI version](https://badge.fury.io/py/cdk-private-asset-bucket.svg)](https://badge.fury.io/py/cdk-private-asset-bucket)
[![.NET version](https://img.shields.io/nuget/v/com.github.mmuller88.cdkPrivateAssetBucket.svg?style=flat-square)](https://www.nuget.org/packages/com.github.mmuller88.cdkPrivateAssetBucket/)
![Release](https://github.com/mmuller88/cdk-private-asset-bucket/workflows/Release/badge.svg)

# cdk-private-asset-bucket

A construct to create a private asset S3 bucket. Cognito will be used for token validation with Lambda@Edge.

## Architecture

![Diagram](misc/cdkPrivateAssetBucket.drawio.png)

# Example

\`\`\`ts
    import { PrivateAssetBucket } from 'cdk-private-assets-bucket';
    ...
${example.join('\n')}
\`\`\`

## Properties

[API.md](API.md)

## Test PrivateBucketAsset

If you forged / cloned that repo you can test directly from here. Don't forget to init with:

\`\`\`bash
yarn install
\`\`\`

Create a test cdk stack with one of the following:

\`\`\`bash
yarn cdk deploy
yarn cdk deploy --watch
yarn cdk deploy --require-approval never
\`\`\`

- Upload a picture named like pic.png to the private asset bucket
- Create a user pool user and get / save the token:

\`\`\`bash
USER_POOL_ID=us-east-1_0Aw1oPvD6
CLIENT_ID=3eqcgvghjbv4d5rv32hopmadu8
USER_NAME=martindev
USER_PASSWORD=M@rtindev1
REGION=us-east-1
CFD=d1f2bfdek3mzi7.cloudfront.net

aws cognito-idp admin-create-user --user-pool-id $USER_POOL_ID --username $USER_NAME --region $REGION
aws cognito-idp admin-set-user-password --user-pool-id $USER_POOL_ID --username $USER_NAME --password $USER_PASSWORD  --permanent --region $REGION
ACCESS_TOKEN=$(aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --client-id $CLIENT_ID --auth-parameters USERNAME=$USER_NAME,PASSWORD=$USER_PASSWORD  --region $REGION | jq -r '.AuthenticationResult.AccessToken')

echo "curl --location --request GET \"https://$CFD/pic.png\" --cookie \"Cookie: token=$ACCESS_TOKEN\""
\`\`\`

- You can use the curl for importing in Postman. but it looks like Postman can't import the cookie. So you need to set the cookie manually in Postman!
- In Postman you should see your picture :)
- For Debugging the Lambda@Edge with Cloudwatch go to the AWS Console --> Cloudwatch --> Log groups --> switch to the region you are closest to --> figure out which log group is correct

## Planned Features

- Migrating to cdk v2. If you know a cool workflow how to continuously support v1 and v2 let me know!
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
`,
  },
});

project.setScript('deploy', './node_modules/.bin/cdk deploy');
project.setScript('destroy', './node_modules/.bin/cdk destroy');
project.setScript('synth', 'yarn cdk synth && yarn cdk-dia && mv diagram.png diagrams/all.png');

const common_exclude = ['cdk.out'];
project.npmignore.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);
project.gitignore.addPatterns('diagram.dot', 'diagram.png');

project.synth();