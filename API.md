# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### PrivateAssetBucket <a name="PrivateAssetBucket" id="cdk-private-asset-bucket.PrivateAssetBucket"></a>

#### Initializers <a name="Initializers" id="cdk-private-asset-bucket.PrivateAssetBucket.Initializer"></a>

```typescript
import { PrivateAssetBucket } from 'cdk-private-asset-bucket'

new PrivateAssetBucket(scope: Construct, id: string, props: PrivateAssetBucketProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-private-asset-bucket.PrivateAssetBucket.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | *No description.* |
| <code><a href="#cdk-private-asset-bucket.PrivateAssetBucket.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-private-asset-bucket.PrivateAssetBucket.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-private-asset-bucket.PrivateAssetBucketProps">PrivateAssetBucketProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-private-asset-bucket.PrivateAssetBucket.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-private-asset-bucket.PrivateAssetBucket.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-private-asset-bucket.PrivateAssetBucket.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-private-asset-bucket.PrivateAssetBucketProps">PrivateAssetBucketProps</a>

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-private-asset-bucket.PrivateAssetBucket.property.assetBucketCloudfrontUrl">assetBucketCloudfrontUrl</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-private-asset-bucket.PrivateAssetBucket.property.assetBucketName">assetBucketName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-private-asset-bucket.PrivateAssetBucket.property.assetBucketRecordDomainName">assetBucketRecordDomainName</a></code> | <code>string</code> | *No description.* |

---

##### `assetBucketCloudfrontUrl`<sup>Required</sup> <a name="assetBucketCloudfrontUrl" id="cdk-private-asset-bucket.PrivateAssetBucket.property.assetBucketCloudfrontUrl"></a>

```typescript
public readonly assetBucketCloudfrontUrl: string;
```

- *Type:* string

---

##### `assetBucketName`<sup>Required</sup> <a name="assetBucketName" id="cdk-private-asset-bucket.PrivateAssetBucket.property.assetBucketName"></a>

```typescript
public readonly assetBucketName: string;
```

- *Type:* string

---

##### `assetBucketRecordDomainName`<sup>Optional</sup> <a name="assetBucketRecordDomainName" id="cdk-private-asset-bucket.PrivateAssetBucket.property.assetBucketRecordDomainName"></a>

```typescript
public readonly assetBucketRecordDomainName: string;
```

- *Type:* string

---


## Structs <a name="Structs" id="Structs"></a>

### CustomDomain <a name="CustomDomain" id="cdk-private-asset-bucket.CustomDomain"></a>

#### Initializer <a name="Initializer" id="cdk-private-asset-bucket.CustomDomain.Initializer"></a>

```typescript
import { CustomDomain } from 'cdk-private-asset-bucket'

const customDomain: CustomDomain = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-private-asset-bucket.CustomDomain.property.domainName">domainName</a></code> | <code>string</code> | domainName needs to be part of the hosted zone e.g.: image.example.com. |
| <code><a href="#cdk-private-asset-bucket.CustomDomain.property.zone">zone</a></code> | <code>@aws-cdk/aws-route53.IHostedZone</code> | *No description.* |

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-private-asset-bucket.CustomDomain.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

domainName needs to be part of the hosted zone e.g.: image.example.com.

---

##### `zone`<sup>Required</sup> <a name="zone" id="cdk-private-asset-bucket.CustomDomain.property.zone"></a>

```typescript
public readonly zone: IHostedZone;
```

- *Type:* @aws-cdk/aws-route53.IHostedZone

---

### PrivateAssetBucketProps <a name="PrivateAssetBucketProps" id="cdk-private-asset-bucket.PrivateAssetBucketProps"></a>

#### Initializer <a name="Initializer" id="cdk-private-asset-bucket.PrivateAssetBucketProps.Initializer"></a>

```typescript
import { PrivateAssetBucketProps } from 'cdk-private-asset-bucket'

const privateAssetBucketProps: PrivateAssetBucketProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-private-asset-bucket.PrivateAssetBucketProps.property.userPoolClientId">userPoolClientId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-private-asset-bucket.PrivateAssetBucketProps.property.userPoolId">userPoolId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-private-asset-bucket.PrivateAssetBucketProps.property.assetBucketName">assetBucketName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-private-asset-bucket.PrivateAssetBucketProps.property.customDomain">customDomain</a></code> | <code><a href="#cdk-private-asset-bucket.CustomDomain">CustomDomain</a></code> | *No description.* |

---

##### `userPoolClientId`<sup>Required</sup> <a name="userPoolClientId" id="cdk-private-asset-bucket.PrivateAssetBucketProps.property.userPoolClientId"></a>

```typescript
public readonly userPoolClientId: string;
```

- *Type:* string

---

##### `userPoolId`<sup>Required</sup> <a name="userPoolId" id="cdk-private-asset-bucket.PrivateAssetBucketProps.property.userPoolId"></a>

```typescript
public readonly userPoolId: string;
```

- *Type:* string

---

##### `assetBucketName`<sup>Optional</sup> <a name="assetBucketName" id="cdk-private-asset-bucket.PrivateAssetBucketProps.property.assetBucketName"></a>

```typescript
public readonly assetBucketName: string;
```

- *Type:* string

---

##### `customDomain`<sup>Optional</sup> <a name="customDomain" id="cdk-private-asset-bucket.PrivateAssetBucketProps.property.customDomain"></a>

```typescript
public readonly customDomain: CustomDomain;
```

- *Type:* <a href="#cdk-private-asset-bucket.CustomDomain">CustomDomain</a>

---



