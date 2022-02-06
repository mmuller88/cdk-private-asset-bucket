const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'mmuller88',
  authorAddress: 'damadden88@googlemail.com',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-private-asset-bucket',
  repositoryUrl: 'https://github.com/mmuller88/cdk-private-asset-bucket',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();