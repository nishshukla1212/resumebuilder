var AWS = require("aws-sdk");

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.insertBreakDown = (event, context, callback) => {

  context.callbackWaitsForEmptyEventLoop = false;
  const data = JSON.parse(event.body);
  console.log(data);
  var table = "breakdownsTable";

  var params = {
    TableName: table,
    Item: data[0]
  };

  console.log("Adding a new item...");
  docClient.put(params, function (err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
      callback(null, {
        statusCode: 200
      });
    }
  });

};

module.exports.deleteBreakDown = (event, context, callback) => {

  context.callbackWaitsForEmptyEventLoop = false;
  const data = JSON.parse(event.body);
  console.log(data);
  var table = "breakdownsTable";

  var params = {
    TableName: table,
    Item: data[0]
  };

  console.log("Deleting item...");
  docClient.delete(params, function (err, data) {
    if (err) {
      console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Deleted item:", JSON.stringify(data, null, 2));
      callback(null, {
        statusCode: 200
      });
    }
  });

};

module.exports.getBreakDowns = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let dt = String(new Date().toDateString).substr(0,9);
  let params = {};
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  
  let userID = undefined !== event.queryStringParameters.userID ? event.queryStringParameters.userID : '';
  let projectTitle = undefined !== event.queryStringParameters.projectTitle ? event.queryStringParameters.projectTitle : '';
  let productionCompany = undefined !== event.queryStringParameters.productionCompany ? event.queryStringParameters.productionCompany : '';
  let projectType = undefined !== event.queryStringParameters.projectType ? event.queryStringParameters.projectType : '';
  let startDate = undefined !== event.queryStringParameters.startDate ? event.queryStringParameters.startDate : '';
  let endDate = undefined !== event.queryStringParameters.endDate ? event.queryStringParameters.endDate : '';
  let unionStatus = undefined !== event.queryStringParameters.unionStatus ? event.queryStringParameters.unionStatus : '';
  let submissionDeadline = undefined !== event.queryStringParameters.submissionDeadline ? event.queryStringParameters.submissionDeadline : '';
  let remoteopportunity = undefined !== event.queryStringParameters.remoteopportunity ? event.queryStringParameters.remoteopportunity : '';
  let gender = undefined !== event.queryStringParameters.gender ? event.queryStringParameters.gender : '';
  let ageRange = undefined !== event.queryStringParameters.ageRange ? event.queryStringParameters.ageRange : '';
  let ethnicities = undefined !== event.queryStringParameters.ethnicities ? event.queryStringParameters.ethnicities : '';
  
  let expressionAttributeValues = {
    "userID" : userID,    
    "projectTitle" : projectTitle,    
    "productionCompany" : productionCompany,    
    "projectType" : projectType,    
    "startDate" : startDate,    
    "endDate" : endDate,    
    "unionStatus" : unionStatus,    
    "submissionDeadline" : submissionDeadline,    
    "remoteopportunity" : remoteopportunity,    
    "gender" : gender,    
    "ageRange" : ageRange,    
    "ethnicities" : ethnicities,
    "dt" : dt
  };

  var table = "breakdownsTable";

  let keyConditionExpression = 'projectType = :projectType';

  let filterExpression = '';
  filterExpression = filterExpression + String(userID).length > 0 ? 'userID = :userID and ' : ' '; //userID
  filterExpression = filterExpression + String(projectTitle).length > 0 ? 'projectTitle = :projectTitle and ' : ' '; //projectTitle
  filterExpression = filterExpression + String(productionCompany).length > 0 ? 'productionCompany = :productionCompany and ' : ' '; //productionCompany
  filterExpression = filterExpression + String(startDate).length > 0 ? 'startDate >= :startDate and ' : ' '; //startDate
  filterExpression = filterExpression + String(endDate).length > 0 ? 'endDate >= :endDate and ' : ' '; //endDate
  filterExpression = filterExpression + String(unionStatus).length > 0 ? 'unionStatus >= :unionStatus and ' : ' '; //unionStatus
  filterExpression = filterExpression + String(submissionDeadline).length > 0 ? 'submissionDeadline >= :submissionDeadline and ' : ' '; //submissionDeadline
  filterExpression = filterExpression + String(remoteopportunity).length > 0 ? 'remoteopportunity >= :remoteopportunity and ' : ' '; //remoteopportunity
  filterExpression = filterExpression + String(gender).length > 0 ? 'gender >= :gender and ' : ' '; //gender
  filterExpression = filterExpression + String(ageRange).length > 0 ? 'ageRange >= :ageRange and ' : ' '; //ageRange
  filterExpression = filterExpression + String(ethnicities).length > 0 ? 'ethnicities >= :ethnicities and ' : ' '; //ethnicities
  filterExpression = filterExpression + String(dt).length > 0 ? 'creationDate <= :dt and ' : ' '; //ethnicities

  filterExpression = String(filterExpression).trim();
  
  if(filterExpression.substr(filterExpression.length - 1, 3) === "and"){
    filterExpression = filterExpression.slice(0,filterExpression.length - 3)[0];
  }

  console.log(filterExpression);
  
  var scanParams = {
    TableName: table,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues
  };

  var queryParams = {
    TableName : table,
    KeyConditionExpression: keyConditionExpression,
    filterExpressions: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues
  };

  if(projectType.length > 0){
    params = queryParams;
    console.log(params);
    docClient.query(params, function(err, data) {
      if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log('successfully executed');
        console.log(data);
        resultarr.push(data);
      }
    });
  }else{
    params = scanParams;
    docClient.scan(params, onScan);

    function onScan(err, data) {
      if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        resultarr.push(data.Items);
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);            
      }
    }
  }
  resultJSON.resultarr = resultarr;
  response = JSON.stringify(resultJSON);
  callback(null, {
    statusCode: 200,
    body: response
  });
};
