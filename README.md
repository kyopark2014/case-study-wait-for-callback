# "Wait for Callback" 구현

여기서는 Step Functions을 이용하여 "Wait for Callback"을 구현하고자 합니다. 

전체적인 Architecture는 아래와 같습니다. 

<img width="742" alt="image" src="https://user-images.githubusercontent.com/52392004/175043966-6bda055d-8b18-4487-9aa3-02e76b5fa384.png">

1) 여기서는 Step function에 대한 event trigger로서 Event Bridge를 사용합니다. 주기적으로 또는 특정 조건에 의해 Event Trigger로 batch job을 수행하도록 할 수 있습니다. 이때 Step Functions의 "Generate task"는 실행해야할 task에 대한 기본정보를 설정합니다. 그리고 SQS에 관련 정보를 push 하고, SQS에 대한 "Wait for callback" option을 enable하면, sendTaskSuccess 또는 sendTaskFailure가 도착할때까지 workflow가 진행되지 않고 대기하게 됩니다. 

2) SQS에 task 정보가 push되면 "Lambda for verification message"가 trigger가 되는데, 이때 email로 사용자의 확인을 SNS를 통해 요청하게 됩니다.

3) 사용자가 email을 받고, 수신된 이메일을 선택해서 approval하면, 해당 URL이 가리키는 API Gateway로 HTTPS GET request가 RESTful API로 요청됩니다. 

4) 이때, "Lambda for verification success"에 task token이 함께 전달되면, sendTaskSuccess를 이용해 callback으로 Step Function에 결과를 전달하게 됩니다.

5) Step Function은 결과를 받으면 "Return to main processin" 단계로 state가 바뀌고 원래 계획했던 일을 수행할 수 있습니다. 


## lambda-for-task-generator


[lambda for task generator의 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/task-generator.md)에 따라 task 정보를 만들기 위한 lambda를 생성합니다. 여기서는 간단한 예를 보여주기 위하여 requestId와 timestamp 정보만 만들었습니다. 만약 S3에 새로운 폴더가 생성되어서 처리가 되어야 한다면, requestId에 대한 job을 정의하여 사용 할 수 있습니다. 

## lambda-for-verification-message

[lambda for verification message의 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/verificiation-message.md)에 따라 verification을 위한 이메일 요청을 생성하기 위한 lambda를 만듧합니다. 

## lambda-for-verification-success

## SQS 

"VerificationQueue" 단계에 해당하는 [SQS를 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/sqs.md)합니다. 


## Step Functions

[Step Function](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/step-function.md)에 따라 "Workflow studio"로 Step function을 생성합니다. 

## Lambda for verification success

[Lambda for verification success의 생성](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/verification-success.md)에 따라 verfication 완료 후에 Step Function에 결과를 전달하는 lambda를 생성합니다.

## lambda-for-processing
