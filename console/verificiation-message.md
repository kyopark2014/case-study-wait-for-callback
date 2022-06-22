![image](https://user-images.githubusercontent.com/52392004/174974691-6886b63b-8a72-4fc2-b7c4-47aac18256b0.png)

```java
        {
            "Effect": "Allow",
            "Action": [
                "sqs:SendMessage",
                "sqs:ReceiveMessage",
                "sqs:DeleteMessage"
            ],
            "Resource": "arn:aws:sqs:ap-northeast-2:677146750822:VerificationQueue"
        }
```        
