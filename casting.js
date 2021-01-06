const mysql = require('mysql');

var options = require('./options');

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
  let first_name = data[0].first_name;
  let last_name = data[0].last_name;
  let email = data[0].email;
  let phone = data[0].phone;
  let bio = data[0].bio;
  let headshot1_url = data[0].headshot1_url;
  let headshot2_url = data[0].headshot2_url;
  let headshot3_url = data[0].headshot3_url;
  let headshot4_url = data[0].headshot4_url;
  let resume_url = data[0].resume_url;
  let demo_reel_url = data[0].demo_reel_url;
  let u_dt = Date.now();
  let c_dt = Date.now();

  let initialQueryString = `select count(*) as COUNT from submission_profile sp where sp.user_id = '${user_id}'`
  loginDataCasting.getConnection((err, connection) => {
    connection.query(initialQueryString, function (err, result, fields) {
      if (err) {responseCode=500;throw err;}
      result.forEach(element => {
        console.log(element);
        if(element.COUNT > 0){
          let deleteQueryString = `delete from submission_profile where user_id = '${user_id}'`
          connection.query(deleteQueryString, function (err, result, fields) {
            if (err) {responseCode=500;throw err;}
            console.log(result);
          });
        }
      });
    });

  queryString = `Insert into submission_profile (user_id, first_name,last_name,email,phone,bio,headshot_url_1,headshot_url_2,headshot_url_3,headshot_url_4,resume_url,demo_reel_url,u_dt,c_dt)`;
  let valueString = `Values ('${user_id}','${first_name}','${last_name}','${email}','${phone}',"${bio}",'${headshot1_url}','${headshot2_url}','${headshot3_url}','${headshot4_url}','${resume_url}','${demo_reel_url}','${u_dt}','${c_dt}')`
  
  queryString = queryString + ' ' + valueString;
  console.log(queryString);
 
  connection.query(queryString, function (err, result, fields) {
      if (err) {responseCode=500;throw err;}
      connection.release();
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
  let queryString = `select distinct sp.first_name, sp.last_name, sp.email, sp.phone,sp.bio,sp.headshot_url_1,sp.headshot_url_2,sp.headshot_url_3,sp.resume_url,sp.demo_reel_url from submission_profile sp where sp.user_id = '${userID}'`;
  let i=0;
  loginDataCasting.getConnection((err, connection) =>{
    connection.query(queryString, function (err, result, fields) {
    if (err) {responseCode=500;throw err};
    result.forEach(element => {
      resultarr.push({_id: i.toString(), first_name: element.first_name, last_name: element.last_name,email: element.email,phone: element.phone,bio: element.bio,headshot_url_1: element.headshot_url_1,headshot_url_2: element.headshot_url_2,headshot_url_3: element.headshot_url_3,headshot_url_4: element.headshot_url_4,resume_url: element.resume_url,demo_reel_url: element.demo_reel_url});
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
