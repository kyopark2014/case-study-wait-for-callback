
# Event Bridge 생성

1) Event Bridge Console에 접속하여 [Create rule]을 선택합니다. 

https://ap-northeast-2.console.aws.amazon.com/events/home?region=ap-northeast-2#/

2) [Name]에 "batch-job"으로 선택하고, [Schedule]을 선택한 후에 [Next]를 선택합니다. 

![noname](https://user-images.githubusercontent.com/52392004/175070605-ef926a1d-4ba8-4758-a576-fde9cb067808.png)

3) 원하는 시점으로 Batch job을 설정합니다.

![image](https://user-images.githubusercontent.com/52392004/175071037-0fa1c779-6e70-470e-82ff-a1f32ca39b69.png)

4) 아래와 같이 Target으로 Step Function을 선택합니다.

![noname](https://user-images.githubusercontent.com/52392004/175074168-7b61ab12-f5fa-4c81-91ca-c53dc5758323.png)

5) 이때 생성된 event bridge role은 아래와 같은 퍼미션을 가지고 있습니다.

```java
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "states:StartExecution"
            ],
            "Resource": [
                "arn:aws:states:ap-northeast-2:123456789012:stateMachine:MyStateMachine"
            ]
        }
    ]
}
```
