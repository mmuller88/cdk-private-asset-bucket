import { assertStringArrayContainsString, assertStringArraysOverlap, assertStringEquals } from './assert';
import { CognitoJwtInvalidClientIdError, CognitoJwtInvalidGroupError, CognitoJwtInvalidTokenUseError, JwtInvalidClaimError } from './error';
import { JwtRsaVerifierBase, JwtRsaVerifierProperties } from './jwt-rsa';

/**
 * Class representing a verifier for JWTs signed by Amazon Cognito
 */
export class CognitoJwtVerifier<
  SpecificVerifyProperties extends Partial<CognitoVerifyProperties>,
  IssuerConfig extends JwtRsaVerifierProperties<SpecificVerifyProperties> & {
    userPoolId: string;
    audience: null;
  },
  MultiIssuer extends boolean> extends JwtRsaVerifierBase<
  SpecificVerifyProperties,
  IssuerConfig,
  MultiIssuer
  > {
  /**
 * Parse a User Pool ID, to extract the issuer and JWKS URI
 *
 * @param userPoolId The User Pool ID
 * @returns The issuer and JWKS URI for the User Pool
 */
  public static parseUserPoolId(userPoolId: string): {
    issuer: string;
    jwksUri: string;
  } {
    // Disable safe regexp check as userPoolId is provided by developer, i.e. is not user input
    const match = userPoolId.match(/^(?<region>(\w+-)?\w+-\w+-\d)+_\w+$/);
    if (!match) {
      throw new ParameterValidationError(
        `Invalid Cognito User Pool ID: ${userPoolId}`,
      );
    }
    const region = match.groups!.region;
    const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
    return {
      issuer,
      jwksUri: `${issuer}/.well-known/jwks.json`,
    };
  }

  /**
   * Create a Cognito JWT verifier for a single User Pool
   *
   * @param verifyProperties The verification properties for your User Pool
   * @param additionalProperties Additional properties
   * @param additionalProperties.jwksCache Overriding JWKS cache that you want to use
   * @returns An Cognito JWT Verifier instance, that you can use to verify Cognito signed JWTs with
   */
  static create<T extends CognitoJwtVerifierProperties>(
    verifyProperties: T & Partial<CognitoJwtVerifierProperties>,
    additionalProperties?: { jwksCache: JwksCache }
  ): CognitoJwtVerifierSingleUserPool<T>;

  /**
   * Create a Cognito JWT verifier for multiple User Pools
   *
   * @param verifyProperties An array of verification properties, one for each User Pool
   * @param additionalProperties Additional properties
   * @param additionalProperties.jwksCache Overriding JWKS cache that you want to use
   * @returns An Cognito JWT Verifier instance, that you can use to verify Cognito signed JWTs with
   */
  static create<T extends CognitoJwtVerifierMultiProperties>(
    props: (T & Partial<CognitoJwtVerifierMultiProperties>)[],
    additionalProperties?: { jwksCache: JwksCache }
  ): CognitoJwtVerifierMultiUserPool<T>;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static create(
    verifyProperties: | CognitoJwtVerifierProperties | CognitoJwtVerifierMultiProperties[],
    additionalProperties?: { jwksCache: JwksCache },
  ) {
    return new this(verifyProperties, additionalProperties?.jwksCache);
  }
  private constructor(
    props: CognitoJwtVerifierProperties | CognitoJwtVerifierMultiProperties[],
    jwksCache?: JwksCache,
  ) {
    const issuerConfig = Array.isArray(props)
      ? (props.map((p) => ({
        ...p,
        ...CognitoJwtVerifier.parseUserPoolId(p.userPoolId),
        audience: null, // checked instead by validateCognitoJwtFields
      })) as IssuerConfig[])
      : ({
        ...props,
        ...CognitoJwtVerifier.parseUserPoolId(props.userPoolId),
        audience: null, // checked instead by validateCognitoJwtFields
      } as IssuerConfig);
    super(issuerConfig, jwksCache);
  }

  /**
   * Verify (synchronously) a JWT that is signed by Amazon Cognito.
   *
   * @param jwt The JWT, as string
   * @param props Verification properties
   * @returns The payload of the JWT––if the JWT is valid, otherwise an error is thrown
   */
  // public verifySync<T extends SpecificVerifyProperties>(
  //   ...[jwt, properties]: CognitoVerifyParameters<SpecificVerifyProperties>
  // ): CognitoIdOrAccessTokenPayload<IssuerConfig, T> {
  //   const { decomposedJwt, jwksUri, verifyProperties } =
  //     this.getVerifyParameters(jwt, properties);
  //   this.verifyDecomposedJwtSync(decomposedJwt, jwksUri, verifyProperties);
  //   try {
  //     validateCognitoJwtFields(decomposedJwt.payload, verifyProperties);
  //   } catch (err) {
  //     if (
  //       verifyProperties.includeRawJwtInErrors &&
  //       err instanceof JwtInvalidClaimError
  //     ) {
  //       throw err.withRawJwt(decomposedJwt);
  //     }
  //     throw err;
  //   }
  //   return decomposedJwt.payload as CognitoIdOrAccessTokenPayload<
  //     IssuerConfig,
  //     T
  //   >;
  // }

  /**
   * Verify (asynchronously) a JWT that is signed by Amazon Cognito.
   * This call is asynchronous, and the JWKS will be fetched from the JWKS uri,
   * in case it is not yet available in the cache.
   *
   * @param jwt The JWT, as string
   * @param props Verification properties
   * @returns Promise that resolves to the payload of the JWT––if the JWT is valid, otherwise the promise rejects
   */
  public async verify<T extends SpecificVerifyProperties>(
    // ...[jwt, properties]: CognitoVerifyParameters<SpecificVerifyProperties>
    ...[jwt, properties]: any
  ): Promise<CognitoIdOrAccessTokenPayload<IssuerConfig, T>> {
    const { decomposedJwt, jwksUri, verifyProperties } =
      this.getVerifyParameters(jwt, properties);
    await this.verifyDecomposedJwt(decomposedJwt, jwksUri, verifyProperties);
    try {
      validateCognitoJwtFields(decomposedJwt.payload, verifyProperties);
    } catch (err) {
      if (
        verifyProperties.includeRawJwtInErrors &&
        err instanceof JwtInvalidClaimError
      ) {
        throw err.withRawJwt(decomposedJwt);
      }
      throw err;
    }
    return decomposedJwt.payload as CognitoIdOrAccessTokenPayload<IssuerConfig, T>;
  }

  /**
   * This method loads a JWKS that you provide, into the JWKS cache, so that it is
   * available for JWT verification. Use this method to speed up the first JWT verification
   * (when the JWKS would otherwise have to be downloaded from the JWKS uri), or to provide the JWKS
   * in case the JwtVerifier does not have internet access to download the JWKS
   *
   * @param jwks The JWKS
   * @param userPoolId The userPoolId for which you want to cache the JWKS
   *  Supply this field, if you instantiated the CognitoJwtVerifier with multiple userPoolIds
   * @returns void
   */
  // public cacheJwks(
  //   ...[_, userPoolId]: MultiIssuer extends false
  //     ? [jwks: Jwks, userPoolId?: string]
  //     : [jwks: Jwks, userPoolId: string]
  // ): void {
  //   let issuer: string | undefined;
  //   if (userPoolId !== undefined) {
  //     issuer = CognitoJwtVerifier.parseUserPoolId(userPoolId).issuer;
  //   } else if (this.expectedIssuers.length > 1) {
  //     throw new ParameterValidationError('userPoolId must be provided');
  //   }
  //   // const issuerConfig = this.getIssuerConfig(issuer);
  //   // super.cacheJwks(jwks, issuerConfig.issuer);
  // }
}

/**
 * Validate claims of a decoded Cognito JWT.
 * This function throws an error in case there's any validation issue.
 *
 * @param payload - The JSON parsed payload of the Cognito JWT
 * @param options - Validation options
 * @param options.groups - The cognito groups, of which at least one must be present in the JWT's cognito:groups claim
 * @param options.tokenUse - The required token use of the JWT: "id" or "access"
 * @param options.clientId - The required clientId of the JWT. May be an array of string, of which at least one must match
 * @returns void
 */
function validateCognitoJwtFields(
  payload: JwtPayload,
  options: {
    groups?: string | string[] | null;
    tokenUse?: 'id' | 'access' | null;
    clientId?: string | string[] | null;
  },
): void {
  // Check groups
  if (options.groups != null) {
    assertStringArraysOverlap(
      'Cognito group',
      payload['cognito:groups'],
      options.groups,
      CognitoJwtInvalidGroupError,
    );
  }

  // Check token use
  assertStringArrayContainsString(
    'Token use',
    payload.token_use,
    ['id', 'access'],
    CognitoJwtInvalidTokenUseError,
  );
  if (options.tokenUse !== null) {
    if (options.tokenUse === undefined) {
      throw new ParameterValidationError(
        'tokenUse must be provided or set to null explicitly',
      );
    }
    assertStringEquals(
      'Token use',
      payload.token_use,
      options.tokenUse,
      CognitoJwtInvalidTokenUseError,
    );
  }

  // Check clientId aka audience
  if (options.clientId !== null) {
    if (options.clientId === undefined) {
      throw new ParameterValidationError(
        'clientId must be provided or set to null explicitly',
      );
    }
    if (payload.token_use === 'id') {
      assertStringArrayContainsString(
        'Client ID ("audience")',
        payload.aud,
        options.clientId,
        CognitoJwtInvalidClientIdError,
      );
    } else {
      assertStringArrayContainsString(
        'Client ID',
        payload.client_id,
        options.clientId,
        CognitoJwtInvalidClientIdError,
      );
    }
  }
}


interface CognitoAccessTokenFields extends CognitoJwtFields {
  token_use: 'access';
  client_id: string;
  version: number;
  username: string;
  scope: string;
}
export declare type CognitoAccessTokenPayload = CognitoAccessTokenFields & JsonObject;
export interface CognitoJwt {
  header: JwtHeader;
  payload: CognitoAccessTokenPayload | CognitoIdTokenPayload;
}
interface CognitoIdTokenFields extends CognitoJwtFields {
  token_use: 'id';
  aud: string;
  at_hash: string;
  'cognito:username': string;
  email_verified: boolean;
  phone_number_verified: boolean;
  identities: {
    userId: string;
    providerName: string;
    providerType: string;
    issuer: null;
    primary: string;
    dateCreated: string;
  }[];
  'cognito:roles': string[];
  'cognito:preferred_role': string;
}
export declare type CognitoIdTokenPayload = CognitoIdTokenFields & JsonObject;
export declare type CognitoJwtPayload = CognitoJwtFields & JsonObject;

export declare type CognitoIdOrAccessTokenPayload<IssuerConfig, VerifyProps> = VerifyProps extends {
  tokenUse: null;
} ? CognitoJwtPayload : VerifyProps extends {
    tokenUse: 'id';
  } ? CognitoIdTokenPayload : VerifyProps extends {
      tokenUse: 'access';
    } ? CognitoAccessTokenPayload : IssuerConfig extends {
        tokenUse: 'id';
      } ? CognitoIdTokenPayload : IssuerConfig extends {
          tokenUse: 'access';
        } ? CognitoAccessTokenPayload : CognitoJwtPayload;
interface CognitoJwtFields {
  token_use: 'access' | 'id';
  'cognito:groups'?: string[];
  sub: string;
  iss: string;
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  origin_jti: string;
}

/**
 * Parameters used for verification of a JWT.
 * The first parameter is the JWT, which is (of course) mandatory.
 * The second parameter is an object with specific properties to use during verification.
 * The second parameter is only mandatory if its mandatory members (e.g. client_id) were not
 *  yet provided at verifier level. In that case, they must now be provided.
 */
// declare type CognitoVerifyParameters<SpecificVerifyProperties> = {
//   [key: string]: never;
// } extends SpecificVerifyProperties ? [jwt: string, props?: SpecificVerifyProperties] : [jwt: string, props: SpecificVerifyProperties];

/**
 * Cognito JWT Verifier for multiple user pools
 */
// eslint-disable-next-line max-len
export declare type CognitoJwtVerifierMultiUserPool<T extends CognitoJwtVerifierMultiProperties> = CognitoJwtVerifier<Properties<CognitoVerifyProperties, T>, T & JwtRsaVerifierProperties<CognitoVerifyProperties> & {
  userPoolId: string;
  audience: null;
}, true>;

/**
 * Base Error for all other errors in this file
 */
export abstract class JwtBaseError extends Error { }

export class ParameterValidationError extends JwtBaseError { }

/**
 * Type for Cognito JWT verifier properties, when multiple User Pools are used in the verifier.
 * In this case, you should be explicit in mapping `clientId` to User Pool.
 */
export declare type CognitoJwtVerifierMultiProperties = {
  /** The User Pool whose JWTs you want to verify */
  userPoolId: string;
} & CognitoVerifyProperties;

/**
 * Type that returns the list of fields in Base, that are not part of Provided
 *
 * @param Base The base object
 * @param Provided The object whose fields should be omitted from the field list of base
 */
declare type StillToProvideVerifyKeys<Base, Provided> = keyof Omit<Base, keyof Provided>;

/**
 * Type that returns all optional fields of the input type
 *
 * @param T The type to extract optional fields from
 */
declare type ExtractOptionalFields<T> = {
  [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];

/**
 * Type that is similar to the input type, but only contains its mandatory properties
 *
 * @param T The type to return without optional fields
 */
declare type WithoutOptionalFields<T> = Omit<T, ExtractOptionalFields<T>>;

/**
 * Type that returns the Base type, with only those properties, that are not part of Provided
 *
 * @param Base The base object
 * @param Provided The object whose fields should be omitted from base
 */
declare type StillToProvideProperties<Base, Provided> = {
  [key in StillToProvideVerifyKeys<WithoutOptionalFields<Base>, WithoutOptionalFields<Provided>>]: Base[key];
};

/**
 * Type that returns merged properties as follows:
 * - Properties in Base that are not in Provided, are mandatory
 * - Properties in Base that are in Provided, are optional
 */
export declare type Properties<Base, Provided> = StillToProvideProperties<Base, Provided> & Partial<Base>;

/**
 * Cognito JWT Verifier for a single user pool
 */
// eslint-disable-next-line max-len
export declare type CognitoJwtVerifierSingleUserPool<T extends CognitoJwtVerifierProperties> = CognitoJwtVerifier<Properties<CognitoVerifyProperties, T>, T & JwtRsaVerifierProperties<CognitoVerifyProperties> & {
  userPoolId: string;
  audience: null;
}, false>;

/** Type for Cognito JWT verifier properties, for a single User Pool */
export declare type CognitoJwtVerifierProperties = {
  /** The User Pool whose JWTs you want to verify */
  userPoolId: string;
} & Partial<CognitoVerifyProperties>;

export interface CognitoVerifyProperties {
  /**
   * The client ID that you expect to be present on the JWT
   * (In the ID token's aud claim, or the Access token's client_id claim).
   * If you provide a string array, that means at least one of those client IDs
   * must be present on the JWT.
   * Pass null explicitly to not check the JWT's client ID--if you know what you're doing
   */
  clientId: string | string[] | null;
  /**
   * The token use that you expect to be present in the JWT's token_use claim.
   * Usually you are verifying either Access token (common) or ID token (less common).
   * Pass null explicitly to not check the JWT's token use--if you know what you're doing
   */
  tokenUse: 'id' | 'access' | null;
  /**
   * The group that you expect to be present in the JWT's "cognito:groups" claim.
   * If you provide a string array, that means at least one of those groups
   * must be present in the JWT's "cognito:groups" claim.
   */
  groups?: string | string[] | null;
  /**
   * The scope that you expect to be present in the JWT's scope claim.
   * If you provide a string array, that means at least one of those scopes
   * must be present in the JWT's scope claim.
   */
  scope?: string | string[] | null;
  /**
   * The number of seconds after expiration (exp claim) or before not-before (nbf claim) that you will allow
   * (use this to account for clock differences between systems)
   */
  graceSeconds?: number;
  /**
   * Your custom function with checks. It will be called, at the end of the verification,
   * after standard verifcation checks have all passed.
   * Throw an error in this function if you want to reject the JWT for whatever reason you deem fit.
   * Your function will be called with a properties object that contains:
   * - the decoded JWT header
   * - the decoded JWT payload
   * - the JWK that was used to verify the JWT's signature
   */
  customJwtCheck?: (props: {
    header: JwtHeader;
    payload: JwtPayload;
    jwk: Jwk;
  }) => Promise<void> | void;
  /**
   * If you want to peek inside the invalid JWT when verification fails, set `includeRawJwtInErrors` to true.
   * Then, if an error is thrown during verification of the invalid JWT (e.g. the JWT is invalid because it is expired),
   * the Error object will include a property `rawJwt`, with the raw decoded contents of the **invalid** JWT.
   * The `rawJwt` will only be included in the Error object, if the JWT's signature can at least be verified.
   */
  includeRawJwtInErrors?: boolean;
}

/**
 * Parameters used for verification of a JWT.
 * The first parameter is the JWT, which is (of course) mandatory.
 * The second parameter is an object with specific properties to use during verification.
 * The second parameter is only mandatory if its mandatory members (e.g. audience) were not
 *  yet provided at verifier level. In that case, they must now be provided.
 */
// declare type VerifyParameters<SpecificVerifyProperties> = {
//   [key: string]: never;
// } extends SpecificVerifyProperties ? [jwt: string, props?: SpecificVerifyProperties] : [jwt: string, props: SpecificVerifyProperties];

export interface JwksCache {
  getJwk(jwksUri: string, decomposedJwt: DecomposedJwt): Promise<Jwk>;
  getCachedJwk(jwksUri: string, decomposedJwt: DecomposedJwt): Jwk;
  addJwks(jwksUri: string, jwks: Jwks): void;
  getJwks(jwksUri: string): Promise<Jwks>;
}

export declare type Jwks = JwksFields & JsonObject;

interface JwksFields {
  keys: readonly Jwk[];
}

interface DecomposedJwt {
  header: JwtHeader;
  payload: JwtPayload;
}

declare const optionalJwkFieldNames: readonly ['alg'];
declare const mandatoryJwkFieldNames: readonly ['e', 'kid', 'kty', 'n', 'use'];
declare type OptionalJwkFieldNames = typeof optionalJwkFieldNames[number];
declare type MandatoryJwkFieldNames = typeof mandatoryJwkFieldNames[number];
declare type OptionalJwkFields = {
  [key in OptionalJwkFieldNames]?: string;
};
declare type MandatoryJwkFields = {
  [key in MandatoryJwkFieldNames]: string;
};
export declare type Jwk = OptionalJwkFields & MandatoryJwkFields & JsonObject;

interface JwtPayloadStandardFields {
  exp?: number;
  iss?: string;
  aud?: string | string[];
  nbf?: number;
  iat?: number;
  scope?: string;
  jti?: string;
}
export declare type JwtPayload = JwtPayloadStandardFields & JsonObject;

interface JwtHeaderStandardFields {
  alg?: 'RS256' | 'RS384' | 'RS512' | string;
  kid?: string;
}
/** JSON type */
export declare type Json = null | string | number | boolean | Json[] | JsonObject;
/** JSON Object type */
export declare type JsonObject = {
  [name: string]: Json;
};
export declare type JwtHeader = JwtHeaderStandardFields & JsonObject;
