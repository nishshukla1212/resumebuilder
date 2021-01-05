const mysql = require('mysql');

var options = require('./options');

var loginDataCasting = {
  host: options.storageConfig.host,
  user: options.storageConfig.user,
  password: options.storageConfig.password,
  database: options.storageConfig.databaseCasting
};

const con = connect().then((conn) => { return conn; });

function connect() {
  let conn = mysql.createConnection(loginDataCasting);
  console.log("connecting");
  return new Promise((resolve, reject) => {
    conn.connect(function (err) {
      if (err) reject(err);
      console.log("Connected!");
      resolve(conn);
    })
  });
}

module.exports.insertProfile = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let responseCode = 200;
  let response = '';
  let queryString = '';
  const data = JSON.parse(event.body);
  let parameters = [];
  parameters["user_id"] = data.user_id;
  parameters["first_name"] = data.first_name;
  parameters["last_name"] = data.last_name;
  parameters["email"] = data.email;
  parameters["phone"] = data.phone;
  parameters["bio"] = data.bio;
  parameters["headshot1_url"] = data.headshot1_url;
  parameters["headshot2_url"] = data.headshot2_url;
  parameters["headshot3_url"] = data.headshot3_url;
  parameters["resume_url"] = data.resume_url;
  parameters["demo_reel_url"] = data.demo_reel_url;

  let initialQueryString = `select count(sp.*) as COUNT from submission_profile sp where sp.user_id = ${parameters["user_id"]}`
  con.then((connect) => {
    connect.query(initialQueryString, function (err, result, fields) {
      if (err) {responseCode=500;throw err;}
      result.forEach(element => {
        console.log(element);
        if(element.COUNT > 0){
          let deleteQueryString = `delete from submission_profile where user_id = ${parameters["user_id"]}`
          con.then((connect) => {
            connect.query(deleteQueryString, function (err, result, fields) {
              if (err) {responseCode=500;throw err;}
              console.log(result);
            });
          });
        }
      });
    });
  });

  queryString = `Insert into submission_profile (user_id, first_name,last_name,email,phone,bio,headshot_url_1,headshot_url_2,headshot_url_3,resume_url,demo_reel_url,u_dt,c_dt)`;
  let valueString = `Values (${parameters["user_id"]},${parameters["first_name"]},${parameters["last_name"]},${parameters["email"]},${parameters["phone"]},${parameters["bio"]},${parameters["headshot1_url"]},${parameters["headshot2_url"]},${parameters["headshot3_url"]},${parameters["resume_url"]},${parameters["demo_reel_url"]},${parameters["u_dt"]},${parameters["c_dt"]})`
  
  queryString = queryString + ' ' + valueString;
  con.then((connect) => {
    connect.query(queryString, function (err, result, fields) {
      if (err) {responseCode=500;throw err;}
      response = JSON.stringify(resultJSON);
      callback(null, {
        statusCode: responseCode,
        body: response
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
  let queryString = `select distinct sp.first_name, sp.last_name. sp.email, sp.phone,sp.bio,sp.headshot_url_1,sp.headshot_url_2,sp.headshot_url_3,sp.resume_url,sp.demo_reel_url from submission_profile where sp.user_id = '${userID}'`;
  con.then((connect)=>{connect.query(queryString, function (err, result, fields) {
    if (err) {responseCode=500;throw err};
    result.forEach(element => {
      resultarr.push({first_name: element.first_name, last_name: element.last_name,email: element.email,phone: element.phone,bio: element.bio,headshot_url_1: element.headshot_url_1,headshot_url_2: element.headshot_url_2,headshot_url_3: element.headshot_url_3,resume_url: element.resume_url,demo_reel_url: element.demo_reel_url});
    });
    resultJSON.resultarr = resultarr;
    response = JSON.stringify(resultJSON);
    callback(null, {
      statusCode: responseCode,
      body: response
    });
  });
});
};
