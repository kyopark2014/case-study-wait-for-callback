![Uploading image.png…]()


```java
        {
            "Effect": "Allow",
            "Action": [
                "sqs:SendMessage",
                "sqs:ReceiveMessage",
                "sqs:GetQueueAttributes",
                "sqs:DeleteMessage"
            ],
            "Resource": "arn:aws:sqs:ap-northeast-2:677146750822:VerificationQueue"
        }
```        
