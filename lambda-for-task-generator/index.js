const {v4: uuidv4} = require('uuid');
const aws = require('aws-sdk');

exports.handler = async (event) => {
    console.log('event: '+JSON.stringify((event)));
    
    let requestId = uuidv4(); // generate uuid for request id
    let date = new Date();        
    let timestamp = Math.floor(date.getTime()/1000).toString();
    
    const response = {
        statusCode: 200,
        requestId: requestId,
        timestamp: timestamp
    };
    return response;
};

