const mysql = require('mysql');

var options = require('./options');

const carbone = require('carbone-sdk')('eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIzMjg5IiwiYXVkIjoiY2FyYm9uZSIsImV4cCI6MjIzMzIzNDgwNywiZGF0YSI6eyJpZEFjY291bnQiOjMyODl9fQ.ALJ8cjMEzFUZ2eTapX7tXQjhmlletaJq-TiYzSmyLiDIf1QyPRW4-chZi-ops5CUF8TZCObpjjjp_ZouJjRQiBTJAAr8Id8ijnJZkFr2_4xh-5MvfHxFVzIkulDaycl0USZNjDAK6ElKAiP4uSHhbzZyXJEfxK_UIXDko8MPHUm-fWxU');


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
  let queryString = '';
  let isSonnets = event.queryStringParameters.isSonnets;
  if(isSonnets == "false"){
    queryString = `select distinct wk.Title, wk.WorkID from Works wk where wk.WorkID != 'sonnets' order by wk.Title`;
  }else{
    queryString = `select distinct wk.Title, wk.WorkID from Works wk where wk.WorkID = 'sonnets' order by wk.Title`;
  }
  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) throw err;
      result.forEach(element => {
        resultarr.push({ label: element.Title, value: element.WorkID });
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
        resultarr.push({ label: element.CharName + (element.Description ? ' - ' + element.Description : ''), value: element.CharID });
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
      if(workId !== 'sonnets'){
        result.forEach(element => {
          resultarr.push({ label: element.Chapter.toString() + ' - ' + element.Description, value: element.Chapter.toString() });
        });
      }else{
        result.forEach(element => {
          resultarr.push({ label: element.Chapter.toString(), value: element.Chapter.toString() });
        });
      }
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
  let workID = event.queryStringParameters.workID;
  let queryString = `select ch.Section from Chapters ch where ch.Chapter = ${chapter} and ch.WorkID = '${workID}'`;
  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) throw err;
      result.forEach(element => {
        resultarr.push({ label: element.Section.toString(), value: element.Section.toString() });
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
  let queryString = `select ph.ParagraphNum, ch.CharName, ph.PlainText from Paragraphs ph, Characters ch where ch.CharID = ph.CharID `;

  if (workID.length) {
    queryString = queryString + `and ph.WorkID = '${workID}' `;
  }
  if (chapterID.length) {
    queryString = queryString + `and ph.Chapter = ${chapterID} `;
  }
  if (sectionID.length) {
    queryString = queryString + `and ph.Section = ${sectionID} `;
  }
  if (characterID.length) {
    queryString = queryString + `and ph.CharID = '${characterID}' `;
  }

  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) throw err;
      result.forEach(element => {
        let paraText = String(element.PlainText).replace(/\[[p]]/g,"<br>");
        paraText = String(paraText).replace(/\\n/g,"");
        resultarr.push({ paragraphNumber: element.ParagraphNum.toString(), character: element.CharName, paragraph: paraText });
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

module.exports.getParagraphsRepeater = (event, context, callback) => {
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  console.log(event);
  let workID = undefined !== event.queryStringParameters.workID ? event.queryStringParameters.workID : '';
  let chapterID = undefined !== event.queryStringParameters.chapterID ? event.queryStringParameters.chapterID : '';
  let sectionID = undefined !== event.queryStringParameters.sectionID ? event.queryStringParameters.sectionID : '';
  let characterID = undefined !== event.queryStringParameters.characterID ? event.queryStringParameters.characterID : '';
  let queryString = `select ph.ParagraphNum, ch.CharName, ph.PlainText from Paragraphs ph, Characters ch where ch.CharID = ph.CharID `;

  if (workID.length) {
    queryString = queryString + `and ph.WorkID = '${workID}' `;
  }
  if (chapterID.length) {
    queryString = queryString + `and ph.Chapter = ${chapterID} `;
  }
  if (sectionID.length) {
    queryString = queryString + `and ph.Section = ${sectionID} `;
  }
  if (characterID.length) {
    queryString = queryString + `and ph.CharID = '${characterID}' `;
  }

  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) throw err;
      let i = 0;
      result.forEach(element => {
        let paraText = String(element.PlainText).replace(/\[[p]]/g,"");
        paraText = String(paraText).replace(/\\n/g,"");
        resultarr.push({ _id: i.toString(), paragraphNumber: element.ParagraphNum.toString(), character: element.CharName, paragraph: paraText });
        i++;
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

module.exports.saveView = (event, context, callback) => {
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  carbone.setOptions({
    isReturningBuffer: false,
    convertTo: 'pdf',
  });

  const dataToRender = {
    convertTo: 'pdf'
  };
  dataToRender.data = JSON.parse(event.body);
  console.log(dataToRender);

  carbone.render('5aa6ab79d765a8baa8284e24f9ddc4e2f155257e9b92b264328bf43618b83cf4', dataToRender, (err, downloadLink, filename) => {
    resultarr.push({url:downloadLink.toString()});
    resultJSON.resultarr = resultarr;
    response = JSON.stringify(resultJSON);
    callback(null, {
      statusCode: 200,
      body: response
    });
  });
};

function test() {
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  let queryString = `select ph.ParagraphNum, ch.CharName, ph.PlainText from Paragraphs ph, Characters ch where ch.CharID = ph.CharID `;

    queryString = queryString + `and ph.WorkID = 'sonnets' `;
  

    queryString = queryString + `and ph.Chapter = 1 `;

    queryString = queryString + `and ph.Section = 1 `;
  

  connect().then((con) => {
    con.query(queryString, function (err, result, fields) {
      if (err) throw err;
      result.forEach(element => {
        let paraText = String(element.PlainText).replace(/\[[p]]/g,"<br>");
        //paraText = String(paraText).replace(/\\n/g,"\\\\n");
        console.log(paraText);
        resultarr.push({ paragraphNumber: element.ParagraphNum.toString(), character: element.CharName, paragraph: paraText });
      });
      resultJSON.resultarr = resultarr;
      response = resultJSON;
      console.log(response);
    });
    con.end();
  });
}