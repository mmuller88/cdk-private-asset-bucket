import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { NodejsEdgeFunction } from './nodejs-edge-function';


export interface PrivateAssetBucketProps {
  readonly assetBucketName?: string;
  /**
     * if you want to use an imported bucket instead
     */
  readonly assetBucketNameImport?: string;
  readonly customDomain?: CustomDomain;
  readonly userPoolId: string;
  readonly userPoolClientId: string;
}

export interface CustomDomain {
  readonly zone: route53.IHostedZone;
  /**
     * domainName needs to be part of the hosted zone
     * e.g.: image.example.com
     */
  readonly domainName: string;
}

export class PrivateAssetBucket extends Construct {

  assetBucketName: string;
  assetBucketCloudfrontUrl: string;
  assetBucketRecordDomainName: string | undefined;

  constructor(scope: Construct, id: string, props: PrivateAssetBucketProps) {
    super(scope, id);

    let assetBucket: s3.IBucket;
    if (props.assetBucketNameImport) {
      assetBucket = s3.Bucket.fromBucketName(this, 'Resource', props.assetBucketNameImport);
    } else {
      assetBucket = new s3.Bucket(this, 'Resource', {
        bucketName: props.assetBucketName,
      });
    }

    this.assetBucketName = assetBucket.bucketName;

    const imageAccessFunction = new NodejsEdgeFunction(this, 'edge');

    imageAccessFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['arn:aws:logs:*:*:*'],
    }));

    const assetBucketDomainName = props.customDomain?.domainName;
    const assetBucketCert = props.customDomain ? new certificatemanager.DnsValidatedCertificate(this, 'assetBucketCert', {
      domainName: assetBucketDomainName ?? '',
      hostedZone: props.customDomain.zone,
      region: 'us-east-1',
    }) : undefined;

    const imageCloudfront = new cloudfront.Distribution(this, 'imageCloudfront', {
      certificate: assetBucketCert,
      domainNames: assetBucketDomainName ? [assetBucketDomainName] : undefined,
      defaultBehavior: {
        originRequestPolicy: new cloudfront.OriginRequestPolicy(this, 'originRequestPolicy', {
          cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
        }),
        origin: new origins.S3Origin(assetBucket, {
          customHeaders: {
            // Need to ingest the userpool infor through headers as enviornment variables aren't supported for Lambda@Edge
            'x-env-userpoolid': props.userPoolId,
            'x-env-clientid': props.userPoolClientId,
          },
        }),
        edgeLambdas: [
          {
            functionVersion: imageAccessFunction.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
          },
        ],
      },
    });

    this.assetBucketCloudfrontUrl = imageCloudfront.distributionDomainName;

    const assetBucketRecord = props.customDomain ? new route53.ARecord(this, 'assetBucketRecord', {
      recordName: props.customDomain.domainName.split('.')[0],
      target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(imageCloudfront)),
      zone: props.customDomain.zone,
    }) : undefined;

    this.assetBucketRecordDomainName = assetBucketRecord?.domainName;
  }
}