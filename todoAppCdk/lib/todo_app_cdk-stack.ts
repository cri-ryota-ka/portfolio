import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_apigatewayv2 as apigatewayv2 } from 'aws-cdk-lib';
import { aws_sam as sam } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_cloudfront as cloudfront } from 'aws-cdk-lib';
import { aws_cloudfront_origins as origins } from 'aws-cdk-lib';
import { aws_s3_deployment as s3deploy } from 'aws-cdk-lib';

export class TodoAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    /* ----------
    dynamodb
    lambdaのitem操作のためのdynamoDBテーブルを作成
    プロビジョニングされたテーブルを作成したいため、cloud formationのtypeで作成している
    ---------- */
    const cdkTodoAppTable = new dynamodb.Table(this, 'cdkTodoAppTable', {
      partitionKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.NUMBER
      },
      tableName: 'cdkTodoApp',
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1
    });

    /* ----------
    iam
    lambdaにdynamoDBテーブルの権限を付与するiamを作成
    ---------- */
    const cdkTodoAppFunctionRole = new iam.Role(this, 'cdkTodoAppFunctionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'cdkTodoAppFunction-role',
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(
          this, 'service-role_AWSLambdaBasicExecutionRole', 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
        )
      ],
      inlinePolicies: {
        ['cdkTodoAppFunctionPolicy']: new iam.PolicyDocument({
          statements: [new iam.PolicyStatement({
            sid: 'cdkTodoAppLambdaApi',
            effect: iam.Effect.ALLOW,
            actions: [
              'dynamodb:Scan',
              'dynamodb:PutItem',
              'dynamodb:DeleteItem',
              'dynamodb:UpdateItem'
            ],
            resources: [cdkTodoAppTable.tableArn]
          })]
        })
      }
    });

    /* ----------
    api gateway
    lambdaのapiを共通化するためのapi gatewayを作成
    cdkではルートの設定はこちらでしかできないため、こちら側で設定を行っている
    その関係で、ステージの設定も行っている
    corsの設定も一緒に行なっている
    ---------- */
    // 事前定義しないとエラーになる
    const corsProperty: apigatewayv2.CfnApi.CorsProperty = {
      allowOrigins: ['*'],
      allowHeaders: ['content-type'],
      allowMethods: [
        'GET',
        'POST',
        'PATCH',
        'DELETE',
        'OPTIONS'
      ],
      maxAge: 0,
      allowCredentials: false
    };

    const cdkTodoAppHttpApi = new apigatewayv2.CfnApi(this, 'cdkTodoAppHttpApi', {
      name: 'cdkTodoAppHttpApi',
      corsConfiguration: corsProperty,
      protocolType: 'HTTP'
    });

    const cdkTodoAppHttpApiStage = new apigatewayv2.CfnStage(this, 'cdkTodoAppHttpApiStage', {
      apiId: cdkTodoAppHttpApi.ref,
      stageName: '$default',
      autoDeploy: true
    });

    /* ----------
    lambda
    dynamoDBテーブルからitemをget, post, update, deleteするlambdaを作成
    ---------- */
    const lambdaConstSetting = {
      timeout: 3,
      memorySize: 128,
      runtime: "python3.9",
      codeUri: "cdkTodoAppFunctions/"
    };
    const lambdaConstList = [
      {
        functionName: 'cdkTodoAppGetItemsFun',
        method: 'GET',
        path: '/cdk_todo'
      },
      {
        functionName: 'cdkTodoAppPostItemFun',
        method: 'POST',
        path: '/cdk_todo'
      },
      {
        functionName: 'cdkTodoAppUpdateItemFun',
        method: 'PATCH',
        path: '/cdk_todo'
      },
      {
        functionName: 'cdkTodoAppDeleteItemFun',
        method: 'DELETE',
        path: '/cdk_todo'
      }
    ];

    function lambdaFunctionCreateFun(scope: Construct, name: string, method: string, path: string) {
      // 事前定義しないとエラーになる
      let httpApiEventProperty: sam.CfnFunction.HttpApiEventProperty = {
        method: method,
        path: path,
        apiId: cdkTodoAppHttpApi.ref
      };
      let lambdaEventSourceProperty: sam.CfnFunction.EventSourceProperty = {
        type: 'HttpApi',
        properties: httpApiEventProperty
      };

      new sam.CfnFunction(scope, name, {
        functionName: name,
        timeout: lambdaConstSetting.timeout,
        memorySize: lambdaConstSetting.memorySize,
        runtime: lambdaConstSetting.runtime,
        codeUri: lambdaConstSetting.codeUri,
        handler: `${name}.lambda_handler`,
        role: cdkTodoAppFunctionRole.roleArn,
        events: {
          [name]: lambdaEventSourceProperty
        }
      });
    };

    for(let i = 0; i < lambdaConstList.length; i ++) {
      lambdaFunctionCreateFun(this, lambdaConstList[i].functionName, lambdaConstList[i].method, lambdaConstList[i].path);
    }

    /* ----------
    cloud front, s3
    前提: そもそもs3bucket > cloud front > s3bucket policyの順番で作成する必要があるので、項目をまとめる

    cloud front function、s3用のoac、httpsのurlを作成
    functionはbasic認証用

    s3のフロントを格納するバケット、cloud front oac用のポリシーを作成
    ポリシーはcloud frontで使用する

    最後にs3bucketにフロント資材を自動アップロード
    ---------- */
    // s3bucket
    const cdkTodoAppS3Bucket = new s3.Bucket(this, 'cdkTodoAppS3Bucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      bucketName: 'todo-app-cdk',
      objectLockEnabled: false,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      })
    });

    // cloud front
    const cdkTodoAppCloudFrontFun = new cloudfront.Function(this, 'cdkTodoAppCloudFrontFun', {
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var headers = request.headers;
          var user = "ほげ";
          var password = "hoge";
          var authValue = "Basic " + (user + ":" + password).toString('base64');
          if (typeof headers.authorization === 'undefined' || headers.authorization.value !== authValue) {
            var response = {
              statusCode: 401,
              statusDescription: "Unauthorized",
              headers: {
                "www-authenticate": { value: "Basic" }
              }
            };
            return response;
          }
          return request;
        };
      `),
      functionName: 'cdkTodoAppCFFun',
      comment: `
        Basic認証
        user, passwordは各自で書き換えてください
      `
    });

    const cdkTodoAppCloudFrontOAC = new cloudfront.CfnOriginAccessControl(this, 'cdkTodoAppCloudFrontOAC', {
      originAccessControlConfig: {
        name: "cdkTodoAppCloudFrontOAC",
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4"
      }
    });

    const cdkTodoAppCloudFrontDistribution = new cloudfront.Distribution(this, 'cdkTodoAppCloudFrontDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(cdkTodoAppS3Bucket, {
          originId: 'cdkTodoAppS3Origin',
          connectionAttempts: 1,
          connectionTimeout: cdk.Duration.seconds(5)
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.fromCachePolicyId(this, 'aws_CachingDisabled', '4135ea2d-6df8-44a3-9df3-4b5a84be39ad'), // CachingDisabled
        compress: true,
        functionAssociations: [{
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          function: cloudfront.Function.fromFunctionAttributes(this, 'fromCdkTodoAppCloudFrontFun', {
            functionArn: cdkTodoAppCloudFrontFun.functionArn,
            functionName: cdkTodoAppCloudFrontFun.functionName
          })
        }],
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      defaultRootObject: 'index.html',
      enableIpv6: false,
      enabled: true,
      geoRestriction: cloudfront.GeoRestriction.allowlist('JP'),
      httpVersion: cloudfront.HttpVersion.HTTP2,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL
    });

    const cdkTodoAppCloudFrontCfnDistribution = cdkTodoAppCloudFrontDistribution.node.defaultChild as cloudfront.CfnDistribution;
    cdkTodoAppCloudFrontCfnDistribution.addOverride('Properties.DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity', '');
    cdkTodoAppCloudFrontCfnDistribution.addOverride('Properties.DistributionConfig.Origins.0.OriginAccessControlId', cdkTodoAppCloudFrontOAC.attrId);

    // s3bucket policy
    const cdkTodoAppS3BucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
      actions: ['s3:GetObject'],
      resources: [`${cdkTodoAppS3Bucket.bucketArn}/*`],
      conditions: {
        StringEquals: {
          'AWS:SourceArn': `arn:aws:cloudfront::${cdk.Aws.ACCOUNT_ID}:distribution/${cdkTodoAppCloudFrontDistribution.distributionId}`
      }},
      sid: 'AllowCloudFrontServicePrincipal'
    });

    cdkTodoAppS3Bucket.addToResourcePolicy(cdkTodoAppS3BucketPolicy);

    // s3bucket deploy
    const cdkTodoAppS3BucketDeploy = new s3deploy.BucketDeployment(this, 'cdkTodoAppS3BucketDeploy', {
      destinationBucket: cdkTodoAppS3Bucket,
      sources: [s3deploy.Source.asset('front/')]
    });
  }
}
