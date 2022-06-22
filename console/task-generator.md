


![image](https://user-images.githubusercontent.com/52392004/174970509-d3a59398-e4e5-4ac8-b684-6b591176f5ae.png)


```java
,
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:Query",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem"
            ],
            "Resource": "arn:aws:dynamodb:ap-northeast-2:677146750822:table/db-verification"
        },
        {
            "Effect": "Allow",
            "Action": [
              "sqs:SendMessage",
              "sqs:DeleteMessage"
            ],
            "Resource": "arn:aws:sqs:ap-northeast-2:677146750822:VerificationQueue"
        }
```        
