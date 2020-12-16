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
