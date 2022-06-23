var aws = require('aws-sdk');
var stepfunctions = new aws.StepFunctions({apiVersion: '2016-11-23'});

exports.handler = async (event) => {
    console.log('event: '+JSON.stringify((event)));

    const requestId = event.requestId;
    const timestamp = event.timestamp;
    const taskToken = event.token;

    console.log("requestid: "+requestId);
    console.log("timestamp: "+timestamp);
    console.log("taskToken: "+taskToken);
    
    const output = {
        requestId: requestId,
        timestamp: timestamp
    };

    const params = {
        output: JSON.stringify(output),
        taskToken: taskToken
    };

    console.log(`Calling Step Functions to complete callback task with params ${JSON.stringify(params)}`);
    try {
        let response = await stepfunctions.sendTaskSuccess(params).promise();
        console.log("response: %j", response);
    } catch(err) {
        console.log('err:'+err);
    } 

    const response = {
        statusCode: 200,
    };
    return response;
};
