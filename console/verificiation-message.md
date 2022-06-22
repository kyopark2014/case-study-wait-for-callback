# "lambda for verification message"의 생성 

1) Lambda console에서 [Create function]으로 Lambda를 생성합니다. 이때 Function name을 "lambda-for-verification-message"로 입력하고 나머지는 모두 기본값으로 합니다. 

https://ap-northeast-2.console.aws.amazon.com/lambda/home?region=ap-northeast-2#/functions

2) SQS에서 task 정보를 읽어와야 하고, Verification을 위한 요청을 email로 보내기 위하여 아래와 같은 퍼미션을 "ㅣambda for verification message"의 Policy에 추가합니다. 

![noname](https://user-images.githubusercontent.com/52392004/175057995-08dbaea2-fc2b-480e-b1d6-fa856bc89b6a.png)

```java
        {
            "Effect": "Allow",
            "Action": [
                "sqs:ReceiveMessage",
                "sqs:GetQueueAttributes",
                "sqs:DeleteMessage"
            ],
            "Resource": "arn:aws:sqs:ap-northeast-2:123456789012:VerificationQueue"
        },
        {
            "Effect": "Allow",
            "Action": [
                "sns:Publish"
            ],
            "Resource": "arn:aws:sns:ap-northeast-2:123456789012:sns-callback"
        }
```        
