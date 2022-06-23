# Console에서 인프라 생성하기 

AWS Console을 이용해서 아래와 같이 순차적으로 인프라를 생성할 수 있습니다. 

## lambda-for-task-generator


[lambda for task generator의 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/task-generator.md)에 따라 task 정보를 만들기 위한 lambda를 생성합니다. 여기서는 간단한 예를 보여주기 위하여 requestId와 timestamp 정보만 만들었습니다. 만약 S3에 새로운 폴더가 생성되어서 처리가 되어야 한다면, requestId에 대한 job을 정의하여 사용 할 수 있습니다. 

## lambda-for-verification-message

[lambda for verification message의 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/verificiation-message.md)에 따라 verification을 위한 이메일 요청을 생성하기 위한 lambda를 만듧합니다. 

## lambda-for-verification-success

[Lambda for verification success의 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/verification-success.md)에 따라 verfication 완료 후에 Step Function에 결과를 전달하는 lambda를 생성합니다.

## lambda-for-processing

[Lambda for processing의 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/processing.md)에 따라서 사용자의 확인을 받고 원래 해야하는 processing을 수행 할 수 있습니다. 

## SNS 

Verfication을 위한 email을 보내기 위해, [SNS 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/sns.md)에 따라 SNS를 생성합니다. 

## SQS 

"VerificationQueue" 단계에 해당하는 [SQS를 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/sqs.md)합니다. 


## Step Functions

[Step Function](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/step-function.md)에 따라 "Workflow studio"로 Step function을 생성합니다. 

## API Gateway

[API Gateway 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/api-gw.md)에 따라 API Gateway를 생성하빈다. 

## Event Bridge

여기에서는 batch job을 수행하기 위해 Event bridge를 사용합니다. [Event Bridge 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/event-bridge.md)에 따라 생성합니다. 

