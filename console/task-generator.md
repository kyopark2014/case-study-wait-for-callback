

![image](https://user-images.githubusercontent.com/52392004/174963816-97e40230-1b81-4ebf-b1d4-e748242092f6.png)

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
        }
