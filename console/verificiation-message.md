# "lambda for verification message"의 생성 

1) Lambda console에서 [Create function]으로 Lambda를 생성합니다. 이때 Function name을 "lambda-for-verification-message"로 입력하고 나머지는 모두 기본값으로 합니다. 

https://ap-northeast-2.console.aws.amazon.com/lambda/home?region=ap-northeast-2#/functions

2) SQS에서 task 정보를 읽어와야 하고, Verification을 위한 요청을 email로 보내기 위하여 아래와 같은 퍼미션을 "lambda for verification message"의 Policy에 추가합니다. 

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

3) 환경 변수로 아래와 같은 값을 등록합니다. 

![noname](https://user-images.githubusercontent.com/52392004/175058962-f7a48437-4393-4e8e-b148-f5690b4b3a2b.png)

- apiName은 verification에 대한 응답을 받을대 사용하는 api 이름입니다. 
- apigwUrl은 API 서버의 endpoint입니다. 
- sqsUrl은 SQS의 URL 정보입니다.
- topinArn은 SNS의 ARN 정보입니다. 

4) 코드를 입력합니다. 

[lambda for verification message](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/lambda-for-verification-message/index.js)의 index.js를 복사하여 Lambda에 붙여넣기를 합니다. 

