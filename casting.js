const mysql = require('mysql');

var options = require('./options');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var loginDataCasting = mysql.createPool({
  host: options.storageConfig.host,
  user: options.storageConfig.user,
  password: options.storageConfig.password,
  database: options.storageConfig.databaseCasting
});

module.exports.insertProfile = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let responseCode = 200;
  let response = '';
  let queryString = '';
  const data = JSON.parse(event.body);
  console.log(data[0]);
  let user_id = data[0].user_id;
  let c_uid = data[0].c_uid;
  let first_name = data[0].first_name;
  let last_name = data[0].last_name;
  let email = data[0].email;
  let phone = data[0].phone;
  let bio = String(stringToHTML(data[0].bio).toString());
  let headshot1_url = data[0].headshot1_url;
  let headshot2_url = data[0].headshot2_url;
  let headshot3_url = data[0].headshot3_url;
  let headshot4_url = data[0].headshot4_url;
  let resume_url = data[0].resume_url;
  let demo_reel_url = data[0].demo_reel_url;
  let selecDeletetProm;

  queryString = `Insert into submission_profile (user_id,c_uid, first_name,last_name,email,phone,bio,headshot_url_1,headshot_url_2,headshot_url_3,headshot_url_4,resume_url,demo_reel_url,u_dt,c_dt)`;
  let valueString = `Values ('${user_id}','${c_uid}','${first_name}','${last_name}','${email}','${phone}','${bio}','${headshot1_url}','${headshot2_url}','${headshot3_url}','${headshot4_url}','${resume_url}','${demo_reel_url}',null,null)`

  queryString = queryString + ' ' + valueString;
  console.log(queryString);

  let initialQueryString = `select count(*) as COUNT from submission_profile sp where sp.user_id = '${user_id}'`
  loginDataCasting.getConnection((err, connection) => {
    connection.query(initialQueryString, function (err, result, fields) {
      if (err) { responseCode = 500; throw err; }
      result.forEach(element => {
        console.log(element);
        if (element.COUNT > 0) {
          let deleteQueryString = `delete from submission_profile where user_id = '${user_id}'`
          connection.query(deleteQueryString, function (err, result, fields) {
            if (err) { responseCode = 500; throw err; }
            console.log(result);
            connection.query(queryString, function (err, result, fields) {
              if (err) { responseCode = 500; throw err; }
              connection.release();
              callback(null, {
                statusCode: responseCode,
                body: response
              });
            });
          });
        } else {
          connection.query(queryString, function (err, result, fields) {
            if (err) { responseCode = 500; throw err; }
            connection.release();
            callback(null, {
              statusCode: responseCode,
              body: response
            });
          });
        }
      });
    });
  });
};

module.exports.insertJob = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let responseCode = 200;
  let response = '';
  let queryString = '';
  let valueString = '';
  const data = JSON.parse(event.body)[0];
  console.log(JSON.stringify(data,null,2));

  let project_id = data.project_id ? data.project_id : '';
  let casting_user_id = data.casting_user_id ? data.casting_user_id : '';
  let role_id = data.role_id ? data.role_id : '';
  let project_title = data.project_title ? data.project_title : '';
  let production_company = data.production_company ? data.production_company : '';
  let casting_director = data.casting_director ? data.casting_director : '';
  let start_date = data.start_date ? data.start_date : '';
  let end_date = data.end_date ? data.end_date : '';
  let production_details = data.production_details ? data.production_details : '';
  let rate_details = data.rate_details ? data.rate_details : '';
  let union_status = data.union_status ? data.union_status : '';
  let submission_deadline = data.submission_deadline ? data.submission_deadline : '';
  let sides_link = data.sides_link ? data.sides_link : '';

  data.roles.forEach(role => {
    queryString = `Insert into projects (project_id,casting_user_id, role_id,project_title,casting_director,start_date,end_date,production_details,rate_details,union_status,submission_deadline,sides_link)`;
    valueString = `Values ('${project_id}','${casting_user_id}','${role_id}','${project_title}','${casting_director}','${start_date}','${end_date}','${production_details}','${rate_details}','${union_status}','${submission_deadline}','${sides_link}')`;
  
    queryString = queryString + ' ' + valueString;
    console.log(queryString);
  
    let initialQueryString = `select count(*) as COUNT from projects pp where pp.project_id = '${project_id}'`
    loginDataCasting.getConnection((err, connection) => {
      connection.query(initialQueryString, function (err, result, fields) {
        if (err) { responseCode = 500; throw err; }
        result.forEach(element => {
          console.log(element);
          if (element.COUNT > 0) {
            let deleteQueryString = `delete from projects where project_id = '${project_id}'`
            let deleteRolesString = `delete from roles where project_id = '${project_id}'`
            connection.query(deleteQueryString, function (err, result, fields) {
              if (err) { responseCode = 500; throw err; }
              console.log(result);
              connection.query(queryString, function (err, result, fields) {
                if (err) { responseCode = 500; throw err; }
                connection.release();
                callback(null, {
                  statusCode: responseCode,
                  body: response
                });
              });
            });
          } else {
            connection.query(queryString, function (err, result, fields) {
              if (err) { responseCode = 500; throw err; }
              connection.release();
              callback(null, {
                statusCode: responseCode,
                body: response
              });
            });
          }
        });
      });
    });
  });
};

module.exports.getProfile = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let responseCode = 200;
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  console.log(event);
  let userID = event.queryStringParameters.userID;
  let queryString = `select distinct sp.first_name, sp.last_name, sp.email, sp.phone,sp.bio,sp.headshot_url_1,sp.headshot_url_2,sp.headshot_url_3,sp.headshot_url_4,sp.resume_url,sp.demo_reel_url from submission_profile sp where sp.user_id = '${userID}'`;
  let i = 0;
  loginDataCasting.getConnection((err, connection) => {
    connection.query(queryString, function (err, result, fields) {
      if (err) { responseCode = 500; throw err };
      result.forEach(element => {
        let stringified_bio = '<!DOCTYPE html>'+element.bio;
        let dom = new JSDOM(stringified_bio);
        stringified_bio = dom.window.document.querySelector("p").textContent;
        resultarr.push({ _id: i.toString(), first_name: element.first_name, last_name: element.last_name, email: element.email, phone: element.phone, bio: stringified_bio.toString(), headshot_url_1: element.headshot_url_1, headshot_url_2: element.headshot_url_2, headshot_url_3: element.headshot_url_3, headshot_url_4: element.headshot_url_4, resume_url: element.resume_url, demo_reel_url: element.demo_reel_url });
        i++;
      });
      resultJSON.resultarr = resultarr;
      response = JSON.stringify(resultJSON);
      connection.release();
      callback(null, {
        statusCode: responseCode,
        body: response
      });
    });
  });
};

module.exports.getAllProfiles = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let responseCode = 200;
  let resultJSON = {};
  let resultarr = [];
  let response = '';
  console.log(event);
  let queryString = `select distinct sp.first_name, sp.last_name, sp.email, sp.phone,sp.bio,sp.headshot_url_1,sp.headshot_url_2,sp.headshot_url_3,sp.headshot_url_4,sp.resume_url,sp.demo_reel_url from submission_profile sp`;
  let i = 0;
  loginDataCasting.getConnection((err, connection) => {
    connection.query(queryString, function (err, result, fields) {
      if (err) { responseCode = 500; throw err };
      result.forEach(element => {
        resultarr.push({ _id: i.toString(), first_name: element.first_name, last_name: element.last_name, email: element.email, phone: element.phone, bio: htmlToString(element.bio).toString(), headshot_url_1: element.headshot_url_1, headshot_url_2: element.headshot_url_2, headshot_url_3: element.headshot_url_3, headshot_url_4: element.headshot_url_4, resume_url: element.resume_url, demo_reel_url: element.demo_reel_url });
        i++;
      });
      resultJSON.resultarr = resultarr;
      response = JSON.stringify(resultJSON);
      connection.release();
      callback(null, {
        statusCode: responseCode,
        body: response
      });
    });
  });
};

var stringToHTML = function (str) {
  return str.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/"/g, "&#039;");
};
var htmlToString = function (str) {
  return str.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"").replace(/&#039;/g, "\'");
};
