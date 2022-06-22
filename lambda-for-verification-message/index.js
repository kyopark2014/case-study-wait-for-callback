const aws = require('aws-sdk');
const sns = new aws.SNS();

const apigwUrl = process.env.apigwUrl;
const apiName = process.env.apiName;
const topicArn = process.env.topicArn;
const sqsUrl = process.env.sqsUrl;

exports.handler = async (event) => {
    console.log('event: '+JSON.stringify((event)));

    for(let i=0;i<event.Records.length;i++) {
        let record = event.Records[i];
        console.log('record: %j', record);

        const receiptHandle = event['Records'][i]['receiptHandle'];
        console.log('receiptHandle: '+receiptHandle);

        const body = JSON.parse(record.body);

        const requestId = body.Payload.requestId;
        const timestamp = body.Payload.timestamp;
        const token = encodeURIComponent(body.TaskToken);

        console.log('original token: '+body.TaskToken);
        console.log('encoded token: '+token);
        
        const url = apigwUrl+'/'+apiName+'?requestId='+requestId+'&timestamp='+timestamp+'&token='+token;
    
        const message = 'User verification is required.\n'+url;
    
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
    }
      
    const response = {
        statusCode: 200,
    };
    return response;
};
