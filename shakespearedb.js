const mysql = require('mysql');

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

module.exports.getWorks = (event, context, callback) => {
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  let queryString = `select distinct wk.Title, wk.WorkID from Works wk order by wk.Title`;
  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) throw err;
      result.forEach(element => {
        resultarr.push({label:element.Title,value:element.WorkID});
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

module.exports.getCharacters = (event, context, callback) => {
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  console.log(event);
  let workId = event.queryStringParameters.workId;
  let queryString = `select distinct ch.CharName,ch.CharID, ch.Description from Characters ch ,Works wk where ch.Works = '${workId}'`;
  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) throw err;
      result.forEach(element => {
        resultarr.push({label:element.CharName + (element.Description ? ' - '+ element.Description : ''),value:element.CharID});
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

module.exports.getChapters = (event, context, callback) => {
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  console.log(event);
  let workId = event.queryStringParameters.workId;
  let queryString = `select distinct ch.Chapter,ch.Description from Chapters ch ,Works wk where ch.WorkID = '${workId}'`;
  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) throw err;
      result.forEach(element => {
        resultarr.push({label:element.Chapter.toString() +' - '+ element.Description,value:element.Chapter.toString()});
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

module.exports.getSections = (event, context, callback) => {
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  console.log(event);
  let chapter = event.queryStringParameters.chapter;
  let queryString = `select distinct ch.Section from Chapters ch where ch.chapter = '${chapter}'`;
  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) throw err;
      result.forEach(element => {
        resultarr.push({label:element.Section.toString(), value:element.Section.toString()});
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

module.exports.getParagraphs = (event, context, callback) => {
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  console.log(event);
  let workID = undefined !== event.queryStringParameters.workID ? event.queryStringParameters.workID : '';
  let chapterID = undefined !== event.queryStringParameters.chapterID ? event.queryStringParameters.chapterID : '';
  let sectionID = undefined !== event.queryStringParameters.sectionID ? event.queryStringParameters.sectionID : '';
  let characterID = undefined !== event.queryStringParameters.characterID ? event.queryStringParameters.characterID : '';
  let queryString = `select ph.ParagraphNum, ph.PlainText from Paragraphs ph where `;

  if(workID.length){
    queryString = queryString + `ph.workID = '${workID}' `;
  }
  if(chapterID.length){
    queryString = queryString + `and ph.chapter = ${chapterID} `;
  }  
  if(sectionID.length){
    queryString = queryString + `and ph.section = ${sectionID} `;
  }
  if(characterID.length){
    queryString = queryString + `and ph.charID = '${characterID}' `;
  }

  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) throw err;
      result.forEach(element => {
        resultarr.push({label:element.ParagraphNum.toString(), value:element.PlainText});
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