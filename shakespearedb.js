const mysql = require('mysql');

var options = require('./options');

const carbone = require('carbone-sdk')('test_eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIzMjg5IiwiYXVkIjoiY2FyYm9uZSIsImV4cCI6MjIzMzEwNTk5NywiZGF0YSI6eyJpZEFjY291bnQiOjMyODl9fQ.ACjfTi1JH-ESGghkQIP5Fsm3RaQMpsvmjshPPpuKBFrPji2Veu83B0HOP3nMZOWqbSoaTLnLsgiVEj_LxCZhucMRAdGGnEQSLhX73s93BDRj3iWwRiOm375lHpNTvDhqTu9WXo8GMBu54a5_2su9BdG90oNB8B66cSRErhhpzzn4MCXU');


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
      result.forEach(element => {
        resultarr.push({ label: element.Chapter.toString() + ' - ' + element.Description, value: element.Chapter.toString() });
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
        let paraText = String(element.PlainText).trimLeft().trimRight();
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

module.exports.saveView = (event, context, callback) => {
  carbone.setOptions({
    isReturningBuffer: false,
    convertTo: 'pdf'
  });

  const dataToRender = {
    convertTo: 'pdf'
  };

  dataToRender.data = JSON.parse(event.body);

  carbone.render('85ec05e0ef678e73ae72c181a205cb443ca27d5aaef470275e4e32f52b83e5da', dataToRender, (err, downloadLink, filename) => {
    console.log(err);
    console.log(downloadLink);
    resultarr.push({ paragraphNumber: element.ParagraphNum.toString(), character: element.CharName, paragraph: paraText });
    resultJSON.resultarr = resultarr;
    response = JSON.stringify(resultJSON);
    callback(null, {
      statusCode: 200,
      body: response
    });
  });
};

function test() {
  carbone.setOptions({
    isReturningBuffer: false,
    convertTo: 'pdf'
  });

  const dataToRender = {
    data: {
      result: [
        {
          paragraphNumber: "4",
          character: "Bertram",
          paragraph: "And I in going, madam, weep o'er my father's death\n[p]anew: but I must attend his majesty's command, to\n[p]whom I am now in ward, evermore in subjection.\n"
        },
        {
          paragraphNumber: "31",
          character: "Bertram",
          paragraph: "What is it, my good lord, the king languishes of?\n"
        }
      ],
      watermark: "we"
    },
    convertTo: 'pdf'
  };

  carbone.render('85ec05e0ef678e73ae72c181a205cb443ca27d5aaef470275e4e32f52b83e5da', dataToRender, (err, downloadLink, filename) => {
    console.log(err);
    console.log(downloadLink);
  });
}

test();