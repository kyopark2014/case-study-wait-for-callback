var aws = require('aws-sdk');
var stepfunctions = new aws.StepFunctions({apiVersion: '2016-11-23'});

exports.handler = async (event) => {
    console.log('event: '+JSON.stringify((event)));

    // Do something
    let requestId = event.Payload.requestId;
    let timestamp = event.Payload.timestamp;

    console.log('requestId: '+requestId);
    console.log('timestamp: '+timestamp);
    

    

    console.log('Mission completed!');

    const response = {
        statusCode: 200,
    };
    return response;
};

