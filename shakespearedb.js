const mysql = require('mysql');
const AWS = require('aws-sdk');
const path = require('path');

var options = require('./options');

var loginData = {
  host: options.storageConfig.host,
  user: options.storageConfig.user,
  password: options.storageConfig.password,
  database: options.storageConfig.database
};

function connect() {
  return new Promise((resolve, reject) => {
    let con = mysql.createConnection(loginData);
    console.log("connecting");
    con.connect(function (err) {
      if (err) rejec(err);
      console.log("Connected!");
      resolve(con);
    });
  });
}

module.exports.getCharacters = (event, context, callback) => {
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  console.log(event);
  let workId = event.queryStringParameters.workId;
  let queryString = `select distinct ch.CharName from Characters ch ,Works wk where ch.Works = '${workId}'`;
  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) throw err;
      result.forEach(element => {
        resultarr.push(element.CharName);
      });
      resultJSON.resultarr = resultarr;
      response = JSON.stringify(resultJSON);
      callback(null, {
        statusCode: 200,
        body: response
      });
    });
    con.end();
  });
};

function test() {
  let workId = 'macbeth';
  let resultarr = [];
  let resultJSON = {};
  let queryString = `select distinct ch.CharName from Characters ch ,Works wk where ch.Works = '${workId}'`;
  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) {con.end(); throw err;}
      result.forEach(element => {
        resultarr.push({"name":element.CharName});
      });
      resultJSON.resultarr = resultarr;
      let response = JSON.stringify(resultJSON);
      con.end();
    });
    
  });
}