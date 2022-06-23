# CDK로 "Wait-for-Callback"을 Step Function으로 구현하기 

IaC 툴인 [AWS CDK](https://github.com/kyopark2014/technical-summary/blob/main/cdk-introduction.md)을 이용해 인프라를 생성합니다. 여기서는 Typescript로 CDK2.0 기준으로 코드를 작성하고 있습니다.

## lambda-for-verfication-success

wait가 끝날때 StepFunction으로 success를 보내는 Lambda를 아래와 같이 생성합니다. 

```java
    // Lambda for verification success
    const lambdaVerificationSuccess = new lambda.Function(this, "LambdaVerificationSuccess", {
      description: 'make verification success',
      runtime: lambda.Runtime.NODEJS_14_X, 
      code: lambda.Code.fromAsset("../lambda-for-verification-success"), 
      handler: "index.handler", 
      timeout: cdk.Duration.seconds(3),
      environment: {
      }
    }); 
```


## API Gateway

이메일을 받고 링크를 선택하면 Verification 동작이 시작됩니다. 이때 링크가 접속하는 경로가 API Gateway의 Endpoint입니다. 여기서는 RESTful API로 GET을 사용하고, querystring을 통해 Verification 대상에 대한 정보를 가져옵니다. 


```java
// API GATEWAY
    const stage = "dev";

    // log group api
    const logGroup = new logs.LogGroup(this, 'AccessLogsFowStepFunction', {
      retention: 90, // Keep logs for 90 days
    });
    logGroup.grantWrite(new iam.ServicePrincipal('apigateway.amazonaws.com')); 

    // api-role
    const apiRole = new iam.Role(this, "api-role-stepfunction", {
      roleName: "ApiRoleStepFunction",
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com")
    });
    apiRole.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['lambda:InvokeFunction']
    }));
    apiRole.addManagedPolicy({
      managedPolicyArn: 'arn:aws:iam::aws:policy/AWSLambdaExecute',
    }); 

    // define api gateway
    const apigw = new apiGateway.RestApi(this, 'ApiStepFunction', {
      description: 'API Gateway for Step Function',
      endpointTypes: [apiGateway.EndpointType.REGIONAL],
      defaultMethodOptions: {
        authorizationType: apiGateway.AuthorizationType.NONE
      },
      deployOptions: {
        stageName: stage,
        accessLogDestination: new apiGateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true
        }),
      },
    });   

    // define template
    const templateString: string = `#set($inputRoot = $input.path('$'))
    {
        "requestId": "$input.params('requestId')",
        "timestamp": "$input.params('timestamp')",
        "token": "$input.params('token')"
    }`;

    const requestTemplates = { // path through
      'application/json': templateString,
    };
    // define method
    const apiName = "verification";
    const status = apigw.root.addResource(apiName);

    status.addMethod('GET', new apiGateway.LambdaIntegration(lambdaVerificationSuccess, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,  // options: NEVER
      credentialsRole: apiRole,
      requestTemplates: requestTemplates,
      integrationResponses: [{
        statusCode: '200',
      }], 
      proxy:false, 
    }), {
      requestParameters: {
        'method.request.querystring.deviceid': true,
        'method.request.querystring.startTimestamp': true,
      },
      methodResponses: [   // API Gateway sends to the client that called a method.
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          }, 
        }
      ]
    });
    
    new cdk.CfnOutput(this, 'EndpointUrl', {
      value: apigw.url,
      description: 'The endpoint of API Gateway',
    });    
```


## SQS

Step Function이 Wait 되었다가 callback으로 다시 구동할때 Taken Token이 필요하므로 SQS를 사용합니다. 

```java
    // SQS - queueVerification
    const queue = new sqs.Queue(this, 'VerificationQueue');
    new cdk.CfnOutput(this, 'sqsVerificationUrl', {
      value: queue.queueUrl,
      description: 'The url of the Verification Queue',
    });
```    


## SNS

이메일로 Verification Request를 보내기 위하여 SNS를 준비합니다. 아래와 같이 subscription된 후에 승인된 이메일만 수신이 되므로 메일 주소를 바꿔서 사용하여야 합니다. 

```java
    // SNS
    const topic = new sns.Topic(this, 'cdk-sns-callback', {
      topicName: 'cdk-sns-callback',
      fifo: false  // standard
    });
    topic.addSubscription(new subscriptions.EmailSubscription('storytimebot21@gmail.com'));

    new cdk.CfnOutput(this, 'snsTopicArn', {
      value: topic.topicArn,
      description: 'The arn of the SNS topic',
    });
```    


## lambda-for-task-generator

Task를 정의하는 Lambda를 정의 합니다. 

```java
    // Lambda for task generator 
    const lambdaTaskGenerator = new lambda.Function(this, "LambdaTaskGenerator", {
      description: 'generate task info',
      runtime: lambda.Runtime.NODEJS_14_X, 
      code: lambda.Code.fromAsset("../lambda-for-task-generator"), 
      handler: "index.handler", 
      timeout: cdk.Duration.seconds(3),
      environment: {
      }
    }); 
    new cdk.CfnOutput(this, 'LambdaTaskGeneratorARN', {
      value: lambdaTaskGenerator.functionArn,
      description: 'The arn of lambda for task generator',
    });
```

## lambda-for-verification-message 

SNS를 통해 이메일을 보낼때에 제목과 본문을 준비하는 Lambda를 선언합니다. 이 Lambda는 SQS를 통해 trigger 됩니다. 

```java
    // Lambda for task generator 
    const lambdaTaskGenerator = new lambda.Function(this, "LambdaTaskGenerator", {
      description: 'generate task info',
      runtime: lambda.Runtime.NODEJS_14_X, 
      code: lambda.Code.fromAsset("../lambda-for-task-generator"), 
      handler: "index.handler", 
      timeout: cdk.Duration.seconds(3),
      environment: {
      }
    }); 
    new cdk.CfnOutput(this, 'LambdaTaskGeneratorARN', {
      value: lambdaTaskGenerator.functionArn,
      description: 'The arn of lambda for task generator',
    });
    
    // grant permission to sqs:ReceiveMessage
    queue.grantConsumeMessages(lambdaVerificationMessage);

    // grant permission to publish toward topic
    topic.grantPublish(lambdaVerificationMessage);

    // add event source 
    lambdaVerificationMessage.addEventSource(new SqsEventSource(queue)); 
```

## lambda-for-processing

callback으로 다시 workflow가 restart되었을때 실제 job을 수행하는 lambda 입니다. 

```java
    const lambdaProcessing = new lambda.Function(this, "LambdaProcessing", {
      description: 'main processing',
      runtime: lambda.Runtime.NODEJS_14_X, 
      code: lambda.Code.fromAsset("../lambda-for-processing"), 
      handler: "index.handler", 
      timeout: cdk.Duration.seconds(3),
      environment: {
      }
    }); 
```    


## Step Function

Step function을 아래와 같이 정의 합니다. 

```java
//Lambda invocation for generating task
    const lambdaTaskGeneratorInvocation = new tasks.LambdaInvoke(this, 'Generate task', {
      lambdaFunction: lambdaTaskGenerator,
      outputPath: '$.Payload',
    });

    // task for SQS
    const sqsVerificationTask = new tasks.SqsSendMessage(this, 'Request user varification', {
      queue,
      messageBody: sfn.TaskInput.fromObject({
        "Payload.$": "$",
        TaskToken:  sfn.JsonPath.taskToken
      }),       
      integrationPattern: sfn.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
    });

    // Lambda invocation for processing
    const lambdaProcessingInvocation = new tasks.LambdaInvoke(this, 'Return to main processing', {
      lambdaFunction: lambdaProcessing,
      inputPath: '$',
      outputPath: '$.Payload',
      payload: sfn.TaskInput.fromObject({
        "Task.$": "$",
      })
    });

    //Create the workflow definition
    const definition = lambdaTaskGeneratorInvocation.next(sqsVerificationTask)
      .next(lambdaProcessingInvocation);

    //Create the statemachine
    this.Machine = new sfn.StateMachine(this, "StateMachine", {
      definition,
      stateMachineName: 'WaitForCallback',
      stateMachineType: sfn.StateMachineType.STANDARD,
      timeout: cdk.Duration.minutes(5),
    }); 
    new cdk.CfnOutput(this, 'StateMachineARN', {
      value: this.Machine.stateMachineArn,
      description: 'The arn of StateMachineARN',
    });
    
    // grant permission to step function
    queue.grantSendMessages(this.Machine);
    lambdaTaskGenerator.grantInvoke(this.Machine);
    lambdaProcessing.grantInvoke(this.Machine);

    // policy for lambda to send report toward step function
    const sendTaskPolicyStatement = new iam.PolicyStatement({
      resources: [this.Machine.stateMachineArn],
      actions: [
        "states:SendTaskFailure",
        "states:SendTaskHeartbeat",
        "states:SendTaskSuccess",
      ],
    });
    lambdaVerificationSuccess.addToRolePolicy(sendTaskPolicyStatement);

    // role for state machine
    const roleStateMachine = new iam.Role(this, 'RoleStateMachine', {  // To-Do check required??
      assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
    });
    this.Machine.grantTaskResponse(roleStateMachine); 
```

## Event Bridge

Batch와 같이 정기적 또는 부정기적으로 Job을 생성할때 event bridge를 이용하여 어떤 job을 시작 할 수 있습니다. 여기서는 편의상 10분만다 event bridge가 Step Function에 job을 요청하도록 하고 있습니다. 

```java
// event bridge for batch
    const eventRole = new iam.Role(this, 'EventBridgeRole', {
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
    });

    const rule = new events.Rule(this, 'Cron', {
      description: "Schedule for cron job",
      schedule: events.Schedule.expression('rate(10 minutes)'),
    }); 
    rule.addTarget(new targets.SfnStateMachine(this.Machine, {
      input: events.RuleTargetInput.fromObject({}),
      role: eventRole
    }));
```    
