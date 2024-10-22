var AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();

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

module.exports.deleteBreakDown = async (event, context, callback) => {

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
  let dt = new Date().toISOString().substr(0, 10);
  let params = {};
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  let expressionAttributeValues = {};
  let indexName = '';

  let userID = '';
  let projectTitle = '';
  let productionCompany = '';
  let projectType = '';
  let startDate = '';
  let endDate = '';
  let unionStatus = '';
  let submissionDeadline = '';
  let remoteopportunity = '';
  let gender = '';
  let ageRange = '';
  let ethnicities = '';

  if (event.queryStringParameters !== undefined && event.queryStringParameters != null) {
    userID = event.queryStringParameters.userID === undefined ? '' : event.queryStringParameters.userID;
    projectTitle = event.queryStringParameters.projectTitle === undefined ? '' : event.queryStringParameters.projectTitle;
    productionCompany = event.queryStringParameters.productionCompany === undefined ? '' : event.queryStringParameters.productionCompany;
    projectType = event.queryStringParameters.projectType === undefined ? '' : event.queryStringParameters.projectType;
    startDate = event.queryStringParameters.startDate === undefined ? '' : event.queryStringParameters.startDate;
    endDate = event.queryStringParameters.endDate === undefined ? '' : event.queryStringParameters.endDate;
    unionStatus = event.queryStringParameters.unionStatus === undefined ? '' : event.queryStringParameters.unionStatus;
    submissionDeadline = event.queryStringParameters.submissionDeadline === undefined ? '' : event.queryStringParameters.submissionDeadline;
    remoteopportunity = event.queryStringParameters.remoteopportunity === undefined ? '' : event.queryStringParameters.remoteopportunity;
    gender = event.queryStringParameters.gender === undefined ? '' : event.queryStringParameters.gender;
    ageRange = event.queryStringParameters.ageRange === undefined ? '' : event.queryStringParameters.ageRange;
    ethnicities = event.queryStringParameters.ethnicities === undefined ? '' : event.queryStringParameters.ethnicities;
  }
  expressionAttributeValues[":dt"] = dt;

  if (String(userID).length > 0) {
    expressionAttributeValues[":userID"] = userID;
  }
  if (String(projectTitle).length > 0) {
    expressionAttributeValues[":projectTitle"] = projectTitle;
  }
  if (String(productionCompany).length > 0) {
    expressionAttributeValues[":productionCompany"] = productionCompany;
  }
  if (String(projectType).length > 0) {
    expressionAttributeValues[":projectType"] = projectType;
  }
  if (String(startDate).length > 0) {
    expressionAttributeValues[":startDate"] = startDate;
  }
  if (String(endDate).length > 0) {
    expressionAttributeValues[":endDate"] = endDate;
  }
  if (String(unionStatus).length > 0) {
    expressionAttributeValues[":unionStatus"] = unionStatus;
  }
  if (String(submissionDeadline).length > 0) {
    expressionAttributeValues[":submissionDeadline"] = submissionDeadline;
  }
  if (String(remoteopportunity).length > 0) {
    expressionAttributeValues[":remoteopportunity"] = remoteopportunity;
  }
  if (String(gender).length > 0) {
    expressionAttributeValues[":gender"] = gender;
  }
  if (String(ageRange).length > 0) {
    expressionAttributeValues[":ageRange"] = ageRange;
  }
  if (String(ethnicities).length > 0) {
    expressionAttributeValues[":ethnicities"] = ethnicities;
  }

  var table = "breakdownsTable";

  if (String(projectType).length > 0) {
    indexName = "projectType-projectTitle-index";
  }
  if (String(userID).length > 0) {
    indexName = "userID-index";
  }
  if (String(submissionDeadline).length > 0) {
    indexName = "submissionDeadline-creationDate-index";
  }

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
  filterExpression = filterExpression + String(dt).length > 0 ? 'creationDate <= :dt and ' : ' '; //dt

  filterExpression = String(filterExpression).trim();

  if (filterExpression.endsWith(" and")) {
    filterExpression = filterExpression.substr(0, filterExpression.length - 4);
  }

  console.log(filterExpression);

  var scanParams = {
    TableName: table,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues
  };

  var queryParams = {
    TableName: table,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues
  };

  if (String(projectType).length > 0) {
    params = queryParams;
    console.log(params);

    docClient.query(params, async (err, data) => {
      console.log("In query Function");
      if (err) {
        console.log("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        if(data.Items){
          console.log('successfully executed');
          console.log(data);
          console.log("data");
          resultarr.push(data);
          response = JSON.stringify(resultarr);
          callback(null, {
            statusCode: 200,
            body: response
          });
        }
      }
    });

  } else {
    params = scanParams;
    docClient.scan(params, onScan);
    response = JSON.stringify(resultarr);
    callback(null, {
      statusCode: 200,
      body: response
    });

    async function onScan(err, data) {
      return await new Promise((resolve, reject) => {
        if (err) {
          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
        } else {
          resultarr.push(data.Items);
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          docClient.scan(params, onScan);
        }
        resolve(resultarr);
      });
    }
  }  
};

var test = () => {
  let dt = new Date().toISOString().substr(0, 10);
  let params = {};
  let resultJSON = {};
  let resultarr = [];
  let response = '';

  let userID = '';
  let projectTitle = '';
  let productionCompany = '';
  let projectType = "Play";
  let startDate = '';
  let endDate = '';
  let unionStatus = '';
  let submissionDeadline = '';
  let remoteopportunity = '';
  let gender = '';
  let ageRange = '';
  let ethnicities = '';

  let expressionAttributeValues = {
    ":projectType": "Play",
    ":dt": dt
  };

  var table = "breakdownsTable";
  var indexName = "projectType-projectTitle-index";

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

  if (filterExpression.endsWith(" and")) {
    filterExpression = filterExpression.substr(0, filterExpression.length - 4);
  }

  console.log(filterExpression);

  var scanParams = {
    TableName: table,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues
  };

  var queryParams = {
    TableName: table,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues
  };

  if (projectType.length > 0) {
    params = queryParams;
    console.log(params);
    docClient.query(params, function (err, data) {
      if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log('successfully executed');
        console.log(data);
        resultarr.push(data);
      }
    });
  } else {
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
  console.log(resultarr);
  resultJSON.resultarr = resultarr;
  response = JSON.stringify(resultJSON);
};