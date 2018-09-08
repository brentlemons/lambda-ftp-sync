var AWS = require('aws-sdk');
var PromiseFtp = require('promise-ftp');
var moment = require('moment');
// Set the region 
AWS.config.update({region: 'us-west-2'});
// Create the DynamoDB service object
// var ddb = new AWS.DynamoDB({region: 'us-west-2', apiVersion: '2012-08-10'});
var docClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2', apiVersion: '2012-08-10'});
const tableName = 'ftpStatus';

const stringHash = require('string-hash');


const getFtpList = async (event, ftp) => {
  console.log("Getting the list...");

  return ftp.connect(event.connection)
    .then(function (serverMessage) {
      return ftp.list(event.path);
    }).then(function (list) {
      return list.map(file => ({name:file.name, date:file.date}));
    });
};

const getFtpStatus = async (docClient) => {
  console.log("Getting the item...");
  var params = {
    TableName:tableName,
    Key: {
      'serviceName': 'sample'
    }
  };
  
  return docClient.get(params).promise()
    .then(function (ftpStatus) {return ftpStatus.Item;});
};

// const compareHashes = async (currentHash, storedHash) => {
//   return new Promise((resolve, reject) => {
//     if (currentHash)
    
//   });
//   console.log("Getting the item...");
//   var params = {
//     TableName:tableName,
//     Key: {
//       'serviceName': 'sample'
//     }
//   };
  
//   return docClient.get(params).promise();
// };

const updateHashList = async (docClient, ftpStatus, listHash) => {
  console.log("Updating the item...");
  var params = {
    TableName:tableName,
    Key: {
      'serviceName': ftpStatus.serviceName
    },
    UpdateExpression: "set listHash = :h, timestamp=:t",
    ExpressionAttributeValues:{
        ":h":listHash,
        ":t":moment().toISOString()
    },
    ReturnValues:"UPDATED_NEW"
  };
  
  return docClient.update(params).promise();
};

exports.handler = async (event) => {
  
  try {
    console.log('checkFtpServer: ' + event.connection);
    
    var ftp = new PromiseFtp();
    let list = await getFtpList(event, ftp);
    ftp.close;
    let ftpStatus = await getFtpStatus(docClient);
    
    var listHash = stringHash(JSON.stringify(list));
    
    if (ftpStatus.listHash != listHash) {
      let updatedStatus = await updateHashList(docClient, ftpStatus, listHash);
    }

    console.log('new hash: ' + stringHash(JSON.stringify(list)));
    console.log(ftpStatus);
    
  } catch (error) {
    console.log(error.message);
  }
  

  
//   // return ftp.connect(event.connection)
//   // .then(function (serverMessage) {
//   //   // console.log('Server message: '+serverMessage);
//   //   return ftp.list(event.path);
//   // }).then(function (list) {
//   //   // console.log('Directory listing:');
//   //   var dir = list.map(file => ({name:file.name, date:file.date}));
//   //   //   PutRequest: {
//   //   //     Item: file
//   //   //   }
//   //   // }))
//   //   // console.log(dir);
//   //   return dir;
//   }).then(function (dir) {
//       var listHash = stringHash(JSON.stringify(dir));
//         console.log(listHash);
        
//         return new Promise(resolve => {
// if (ftpStatus.listHash != listHash) {
//           console.log('listHash is not the same: ' + listHash + ' : ' + ftpStatus.listHash);
//           // var updateParams = {
//           // TableName:'ftpStatus',
//           // Key: {
//           //   'serviceName': 'sample'
//           // },
//           //     UpdateExpression: "set listHash = :h",//, timestamp=:t",
//           //     ExpressionAttributeValues:{
//           //         ":h":listHash//,
//           //         //":t":["Larry", "Moe", "Curly"]
//           //     },
//           //     ReturnValues:"UPDATED_NEW"
//           // };
          
//           // console.log("Updating the item...");
//           // docClient.update(updateParams, function(err, data) {
//           //   console.log('here');
//           //     if (err) {
//           //         console.log("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
//           //     } else {
//           //         console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
//           //     }
//           // });

//         } else {
//           console.log('listHash is the same; ignoring');
//         }
//         });
//   }).then(function (dir) {        
        
        
//   //       var params = {
//   // RequestItems: {
//   //   "MetarFtpList": dir
//   // }
//   //       };
  
//   //   ddb.getItem(params, function(err, data) {
//   //       console.log("now");
//   //     if (err) {
//   //       console.log("Error", err);
//   //     } else {
//   //       console.log("Success", data.Item);
//   //     }
//   //   });
  
//   return ftp.close;
//   });


//     // TODO implement
//     // const response = {
//     //     statusCode: 200,
//     //     body: event.key2 //JSON.stringify('Hello from Lambda!')
//     // };
//     // return response;



//     // // Create the DynamoDB service object
//     // var ddb = new AWS.DynamoDB({region: 'us-west-2', apiVersion: '2012-08-10'});

//     // var params = {
//     //   TableName: 'testing',
//     //   Key: {
//     //     'brentkey': {S: 'lemons'}
//     //   },
//     //   ProjectionExpression: 'other'
//     // };

//     // console.log("getting");
//     // ddb.getItem(params, function(err, data) {
//     //     console.log("now");
//     //   if (err) {
//     //     console.log("Error", err);
//     //   } else {
//     //     console.log("Success", data.Item);
//     //   }
//     // });
//     // // TODO implement
//     // const response = {
//     //     statusCode: 200,
//     //     body: event.key2 //JSON.stringify('Hello from Lambda!')
//     // };
//     // return response;
};



