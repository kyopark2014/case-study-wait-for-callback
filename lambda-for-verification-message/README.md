# lambda-for-verification-message

SQS에 메시지가 쌓이면 lambda-for-verification-message를 trigger하게 됩니다. 이때, 내려오는 event에는 여러개의 message가 내려올 수 있으므로 아래와 같이 Records를 for 루프를 돌면서 하나씩 처리 합니다. 

```java
exports.handler = async (event) => {
    console.log('event: '+JSON.stringify((event)));

    for(let i=0;i<event.Records.length;i++) {
```    

하나의 record에는 requestId, timestamp, task token 정보가 있습니다. 

        let record = event.Records[i];
        console.log('record: %j', record);

        const receiptHandle = event['Records'][i]['receiptHandle'];
        console.log('receiptHandle: '+receiptHandle);

        const body = JSON.parse(record.body);

        const requestId = body.Payload.requestId;
        const timestamp = body.Payload.timestamp;
        const token = encodeURIComponent(body.TaskToken);
        
verification을 email을 보내서 사람이 처리하도록 아래와 같이 api gateway의 endpoint를 host로 하는 url을 생성합니다. 또 이를 베이스로 SNS로 보낼 메시지를 생성합니다. 

```java
        const url = apigwUrl+'/'+apiName+'?requestId='+requestId+'&timestamp='+timestamp+'&token='+token;
    
        const message = 'User verification is required.\n'+url;
``` 

SNS로 메시지를 전송합니다. 

```java
        var snsParams = {
            Subject: 'Verification Request',
            Message: message,        
            TopicArn: topicArn
        }; 
        console.log('snsParams: '+JSON.stringify(snsParams));
        
        let snsResult;
        try {
            snsResult = await sns.publish(snsParams).promise();
            console.log('snsResult:', snsResult);
        } catch (err) {
            console.log(err);
        }      
```        

전송이 되었으니 중복처리를 하지 않기 위하여 SQS의 메시지를 삭제합니다. 

```java
        try {
            var deleteParams = {
                QueueUrl: sqsUrl,
                ReceiptHandle: receiptHandle
            };
    
            sqs.deleteMessage(deleteParams, function(err, data) {
                if (err) {
                    console.log("Delete Error", err);
                }else {
                    // console.log("Success to delete messageQueue: data.ResponseMetadata.RequestId);
                }
            });
        } catch (err) {
            console.log(err);
        } 
```        

