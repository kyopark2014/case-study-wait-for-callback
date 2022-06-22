# Lambda for verification success


1) Lambda console에서 [Create function]으로 Lambda를 생성합니다. 이때 Function name을 "lambda-for-verification-message"로 입력하고 나머지는 모두 기본값으로 합니다. 

https://ap-northeast-2.console.aws.amazon.com/lambda/home?region=ap-northeast-2#/functions

2) SQS와 Step Function에 대한 퍼미션을 "Lambda for verification success"의 Policy에 추가합니다.

![noname](https://user-images.githubusercontent.com/52392004/175063278-66adcd8a-2ad4-4808-b571-4e4f712acd38.png)

```java
        {
            "Effect": "Allow",
            "Action": [
                "sqs:SendMessage",
                "sqs:DeleteMessage"
            ],
            "Resource": "arn:aws:sqs:ap-northeast-2:677146750822:VerificationQueue"
        },
        {
            "Effect": "Allow",
            "Action": [
                "states:SendTaskSuccess"
            ],
            "Resource": "arn:aws:states:ap-northeast-2:677146750822:stateMachine:MyStateMachine"
        }
```

3) ["lambda for verification success" git repository](https://github.com/kyopark2014/case-study-wait-for-callback/tree/main/lambda-for-verification-success)에서 index.js를 복사하여  
