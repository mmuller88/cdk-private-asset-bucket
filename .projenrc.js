const fs = require('fs');
const { awscdk } = require('projen');

const exampleFile = fs
  .readFileSync('src/integ.default.ts', 'utf8')
  .split('\n');
const example = exampleFile.slice(8, exampleFile.length - 7);

// const propertiesFile = fs.readFileSync('API.md', 'utf8');

const cdkVersion = '1.143.0';

const cdkDependencies = [
  '@aws-cdk/aws-certificatemanager',
  '@aws-cdk/aws-cloudfront',
  '@aws-cdk/aws-cloudfront-origins',
  '@aws-cdk/aws-cognito',
  '@aws-cdk/aws-iam',
  '@aws-cdk/aws-lambda',
  '@aws-cdk/aws-lambda-nodejs',
  '@aws-cdk/aws-route53',
  '@aws-cdk/aws-route53-targets',
  '@aws-cdk/aws-s3',
];

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Martin Mueller',
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
  cdkDependencies,
  bundledDeps: [
    '@types/aws-lambda',
    // 'aws-jwt-verify',
    'aws-lambda',
  ],
  peerDeps: [
    // 'aws-jwt-verify',
  ],
  devDeps: [
    // 'aws-jwt-verify',
    'aws-lambda',
    '@types/aws-lambda',
    `aws-cdk@${cdkVersion}`,
    ...cdkDependencies,
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

# Example
\`\`\`ts
import { ProwlerAudit } from 'cdk-prowler';
...
${example.join('\n')}
\`\`\`
    
## Planned Features

- Support S3 bucket import ootb.
- Support custom authorizer

## Thanks To

- Crespo Wang for his pioneer work regarding private S3 assets https://javascript.plainenglish.io/use-lambda-edge-jwt-to-secure-s3-bucket-dcca6eec4d7e
- As always to the amazing CDK / Projen Community. Join us on [Slack](https://cdk-dev.slack.com)!
- [Projen](https://github.com/projen/projen) project and the community around it

    `,
  },
});

project.setScript('deploy', './node_modules/.bin/cdk deploy');
project.setScript('destroy', './node_modules/.bin/cdk destroy');
project.setScript('synth', './node_modules/.bin/cdk synth');

const common_exclude = ['cdk.out'];
project.npmignore.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);

project.synth();