const mysql = require('mysql');

const options = require('./options');

const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const hash = require('object-hash');

const mysqlOptions = {
    host: options.storageConfig.host,
    user: options.storageConfig.user,
    password: options.storageConfig.password,
    database: options.storageConfig.databaseCasting,
    socketPath: false,
    connectionLimit: 10
};

const loginDataCasting = mysql.createPool({
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
    let bio = data[0].bio;
    let headshot1_url = data[0].headshot1_url;
    let headshot2_url = data[0].headshot2_url;
    let headshot3_url = data[0].headshot3_url;
    let headshot4_url = data[0].headshot4_url;
    let resume_url = data[0].resume_url;
    let demo_reel_url = data[0].demo_reel_url;
    queryString = `Insert into submission_profile (user_id, c_uid, first_name, last_name, email, phone, bio,
                                                   headshot_url_1, headshot_url_2, headshot_url_3, headshot_url_4,
                                                   resume_url, demo_reel_url, u_dt, c_dt)`;
    let valueString = `Values ('${user_id}','${c_uid}','${first_name}','${last_name}','${email}','${phone}','${bio}','${headshot1_url}','${headshot2_url}','${headshot3_url}','${headshot4_url}','${resume_url}','${demo_reel_url}',null,null)`

    queryString = queryString + ' ' + valueString;
    console.log(queryString);

    let initialQueryString = `select count(*) as COUNT from submission_profile sp where sp.user_id = '${user_id}'`
    loginDataCasting.getConnection((err, connection) => {
        connection.query(initialQueryString, function (err, result, fields) {
            if (err) {
                responseCode = 500;
                throw err;
            }
            result.forEach(element => {
                console.log(element);
                if (element.COUNT > 0) {
                    let deleteQueryString = `delete from submission_profile where user_id = '${user_id}'`
                    connection.query(deleteQueryString, function (err, result, fields) {
                        if (err) {
                            responseCode = 500;
                            throw err;
                        }
                        console.log(result);
                        connection.query(queryString, function (err, result, fields) {
                            if (err) {
                                responseCode = 500;
                                throw err;
                            }
                            connection.release();
                            callback(null, {
                                statusCode: responseCode,
                                body: response
                            });
                        });
                    });
                } else {
                    connection.query(queryString, function (err, result, fields) {
                        if (err) {
                            responseCode = 500;
                            throw err;
                        }
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
    let rolesQueryString = '';
    let rolesValueString = '';
    const data = JSON.parse(event.body)[0];
    console.log(JSON.stringify(data, null, 2));

    data.project_id = hash.MD5({project_title: data.project_title, casting_user_id: data.casting_user_id}).toString();

    let project_id = data.project_id;
    let casting_user_id = data.casting_user_id ? data.casting_user_id : '';
    let project_title = data.project_title ? data.project_title : '';
    let project_type = data.project_type ? data.project_type : '';
    let production_company = data.production_company ? data.production_company : '';
    let casting_director = data.casting_director ? data.casting_director : '';
    let start_date = data.start_date ? data.start_date : '';
    let end_date = data.end_date ? data.end_date : '';
    let production_details = data.production_details ? data.production_details : '';
    let rate_details = data.rate_details ? data.rate_details : '';
    let union_status = data.union_status ? data.union_status : '';
    let submission_deadline = data.submission_deadline ? data.submission_deadline : '';
    let sides_link = data.sides_link ? data.sides_link : '';
    loginDataCasting.getConnection((err, connection) => {
        if (err) {
            responseCode = 500;
            throw err;
        }
        connection.beginTransaction(function (err) {
            if (err) {
                responseCode = 500;
                throw err;
            }
            data.roles.forEach(role => {
                console.log(role);

                let role_id = hash.MD5({project_id: project_id, role_name: role[0].role_name});
                let role_name = role[0].role_name ? role[0].role_name : '';
                let role_type = role[0].role_type ? role[0].role_type : '';
                let remote = role[0].remote ? role[0].remote : '';
                let gender = role[0].gender ? role[0].gender : '';
                let age_range = role[0].age_range ? role[0].age_range : '';
                let ethnicity = role[0].ethnicity ? role[0].ethnicity : '';
                let skills = role[0].skills ? role[0].skills : '';

                queryString = `insert into projects (project_id, production_company, project_type, casting_user_id,
                                                     role_id, project_title,
                                                     casting_director, start_date, end_date, production_details,
                                                     rate_details,
                                                     union_status, submission_deadline, sides_link)`;
                valueString = `Values ('${project_id}','${production_company}','${project_type}','${casting_user_id}','${role_id}','${project_title}','${casting_director}','${start_date}','${end_date}','${production_details}','${rate_details}','${union_status}','${submission_deadline}','${sides_link}')`;
                queryString = queryString + ' ' + valueString;
                rolesQueryString = `insert into roles (role_id, project_id, role_name, role_type, remote, gender,
                                                       age_range,
                                                       ethnicity, skills)`;
                rolesValueString = `Values ('${role_id}','${project_id}','${role_name}','${role_type}','${remote}','${gender}',${age_range},'${ethnicity}','${skills}')`;
                rolesQueryString = rolesQueryString + ' ' + rolesValueString;
                console.log(queryString);

                let initialQueryString = `select count(*) as COUNT from projects pp where pp.project_id = '${project_id}'`;

                connection.query(initialQueryString, function (err, result, fields) {
                    if (err) {
                        responseCode = 500;
                        connection.rollback(() => {
                            responseCode = 500;
                        });
                        throw err;
                    }
                    result.forEach(element => {
                            console.log(element);
                            if (element.COUNT > 0) {
                                let deleteQueryString = `delete from projects where project_id = '${project_id}'`;
                                let deleteRolesString = `delete from roles where role_id = '${role_id}'`;
                                connection.query(deleteQueryString, function (err, result, fields) {
                                    if (err) {
                                        responseCode = 500;
                                        connection.rollback(() => {
                                            responseCode = 500;
                                        });
                                        throw err;
                                    }
                                    console.log(result);
                                    connection.query(deleteRolesString, function (err, result, fields) {
                                        if (err) {
                                            responseCode = 500;
                                            connection.rollback(() => {
                                                responseCode = 500;
                                            });
                                            throw err;
                                        }
                                        connection.query(queryString, function (err, result, fields) {
                                            if (err) {
                                                responseCode = 500;
                                                connection.rollback(() => {
                                                    responseCode = 500;
                                                });
                                                throw err;
                                            }
                                            connection.release();
                                            callback(null, {
                                                statusCode: responseCode,
                                                body: response
                                            });
                                        });
                                        connection.query(rolesQueryString, function (err, result, fields) {
                                            if (err) {
                                                responseCode = 500;
                                                connection.rollback(() => {
                                                    responseCode = 500;
                                                });
                                                throw err;
                                            }
                                            connection.release();
                                            callback(null, {
                                                statusCode: responseCode,
                                                body: response
                                            });
                                        });
                                    });
                                });
                            } else {
                                connection.query(queryString, function (err, result, fields) {
                                    if (err) {
                                        responseCode = 500;
                                        connection.rollback(() => {
                                            responseCode = 500;
                                        });
                                        throw err;
                                    }
                                    connection.query(rolesQueryString, function (err, result, fields) {
                                        if (err) {
                                            responseCode = 500;
                                            connection.rollback(() => {
                                                responseCode = 500;
                                            });
                                            throw err;
                                        }
                                        connection.commit(err => {
                                            if (err) {
                                                connection.rollback(() => {
                                                    responseCode = 500;
                                                    throw('connection Rollback');
                                                });
                                            }
                                        });
                                        connection.release();
                                        callback(null, {
                                            statusCode: responseCode,
                                            body: response
                                        });
                                    });

                                });

                            }
                        }
                    );
                });


            });

        });

    });
};

module.exports.getJob = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let responseCode = 200;
    let response = '';
    let queryString = '';
    let valueString = '';
    const data = JSON.parse(event.body)[0];
    console.log(JSON.stringify(data, null, 2));

    let project_type = data.project_type ? data.project_type : '';
    let gender = data.gender ? data.gender : '';
    let age_range = data.age_range ? data.age_range : '';
    let remote = data.remote ? data.remote : '';
    let rate_details = data.rate_details ? data.rate_details : '';
    let union_status = data.union_status ? data.union_status : '';
    let start_date = data.start_date ? data.start_date : '';
    let end_date = data.end_date ? data.end_date : '';
    let submission_deadline = data.submission_deadline ? data.submission_deadline : '';
    let i = 0;
    loginDataCasting.getConnection((err, connection) => {
        if (err) {
            responseCode = 500;
            throw err;
        }

        queryString = `select pp.*, ro.role_name
                       from projects pp,
                            roles ro
                       where`;
        valueString = `pp.project_id = ro.project_id and pp.role_id = ro.role_id`;
        if (project_type.length > 0) {
            valueString = valueString + ' ' + 'and' + ' ' + `pp.project_type = '${project_type}'`;
        }
        if (gender.length > 0) {
            valueString = valueString + ' ' + 'and' + ' ' + `ro.gender = '${gender}'`;
        }
        if (age_range.length > 0) {
            valueString = valueString + ' ' + 'and' + ' ' + `ro.age_range <= ${age_range}`;
        }
        if (remote.length > 0) {
            valueString = valueString + ' ' + 'and' + ' ' + `ro.remote = ${remote}`;
        }
        if (rate_details.length > 0) {
            valueString = valueString + ' ' + 'and' + ' ' + `pp.rate_details = '${rate_details}'`;
        }
        if (union_status.length > 0) {
            valueString = valueString + ' ' + 'and' + ' ' + `pp.union_status = '${union_status}'`;
        }
        if (start_date.length > 0) {
            valueString = valueString + ' ' + 'and' + ' ' + `pp.start_date >= '${start_date}'`;
        }
        if (end_date.length > 0) {
            valueString = valueString + ' ' + 'and' + ' ' + `pp.end_date <= '${end_date}'`;
        }
        if (submission_deadline.length > 0) {
            valueString = valueString + ' ' + 'and' + ' ' + `pp.submission_deadline >= '${submission_deadline}'`;
        }

        queryString = queryString + ' ' + valueString;

        console.log(queryString);

        connection.query(queryString, function (err, result, fields) {
                if (err) {
                    responseCode = 500;
                    throw err;
                }
                result.forEach(element => {
                    console.log(element);
                    resultarr.push({
                        _id: i.toString(),
                        project_id: element.project_id,
                        casting_user_id: element.casting_user_id,
                        role_id: element.role_id,
                        role_name: element.role_name,
                        project_title: element.project_title,
                        production_company: element.production_company,
                        casting_director: element.casting_director,
                        start_date: element.start_date,
                        end_date: element.end_date,
                        production_details: element.production_details,
                        rate_details: element.rate_details,
                        union_status: element.union_status,
                        submission_deadline: element.submission_deadline,
                        sides_link: element.sides_link,
                    });
                    i++;
                });
                resultJSON.resultarr = resultarr;
                response = JSON.stringify(resultJSON);
                connection.release();
                callback(null, {
                    statusCode: responseCode,
                    body: response
                });

            }
        );
    });
};

function getAllAvailableRoles() {
    let queryString = `select distinct ro.*
                       from roles ro`;
    return new Promise((resolve, reject) => {
        loginDataCasting.getConnection((err, connection) => {
            if (err) {
                reject(err);
            }
            connection.query(queryString, function (error, result, fields) {
                if (error) {
                    console.error(error);
                    reject(err);
                }
                resolve(result);
            }).finally(() => {
                connection.release();
            });
        });
    })
}

module.exports.getAllJobs = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let responseCode = 200;
    let response = '';
    let resultJSON = {};
    let resultarr = [];
    let queryString = `select distinct pr.*
                       from projects pr`;
    return new Promise((resolve, reject) => {
        loginDataCasting.getConnection((err, connection) => {
            if (err) {
                console.error(err);
                responseCode = 500;
                response = err;
            }
            connection.query(queryString, function (error, result, fields) {
                if (error) {
                    console.error(err);
                    responseCode = 500;
                    response = err;
                }
                result.forEach((element, index) => {
                    resultarr.push({
                        _id: (index + 1).toString(),
                        project_id: element.project_id.toString(),
                        casting_user_id: element.casting_user_id,
                        role_id: element.role_id
                        ,
                        project_title: element.project_title,
                        production_company: element.production_company,
                        casting_director: element.casting_director,
                        start_date: element.start_date,
                        end_date: element.end_date
                        ,
                        production_details: element.production_details,
                        rate_details: element.rate_details,
                        union_status: element.union_status,
                        submission_deadline: element.submission_deadline,
                        sides_link: element.sides_link,
                        project_type: element.project_type
                    });
                });
                resultJSON.resultarr = resultarr;
                response = JSON.stringify(resultJSON);
                connection.release();
                callback(null, {
                    statusCode: 200,
                    body: response
                });
            })
        });
    })
}


function getSpecificRole(connection, role_id) {
    let queryString = `select distinct ro.*
                       from roles ro where ro.role_id = '${role_id}'`;

    return new Promise((resolve, reject) => {

        connection.query(queryString, function (error, result, fields) {
            if (error) {
                console.error(error);
                reject(err);
            }
            connection.release();
            console.table(result);
            resolve(result);

        })
    });
}

function getRolesForProject(connection, project_id) {
    let queryString = `select distinct ro.*
                       from roles ro
                       where ro.project_id = '${project_id}'`;
    return new Promise((resolve, reject) => {

        connection.query(queryString, function (error, result, fields) {
            if (error) {
                console.error(error);
                reject(err);
            }
            connection.release();
            console.table(result);
            resolve(result);
        })
    })
}

function getRoleForSpecificProject(connection, project_id, role_id) {
    let queryString = `select distinct ro.*
                       from roles ro, projects pp
                       where ro.project_id = pp.project_id
                       and ro.role_id = pp.role_id 
                       and pp.project_id = '${project_id}'
                       and pp.role_id = '${role_id}'`;
    return new Promise((resolve, reject) => {

        connection.query(queryString, function (error, result, fields) {
            if (error) {
                console.error(error);
                reject(err);
            }
            connection.release();
            console.table(result);
            resolve(result);
        })

    })
}

module.exports.getRole = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let responseCode = 200;
    let response = '';
    let resultJSON = {};
    let resultarr = [];
    let result;
    let project_id = undefined !== event.queryStringParameters.project_id ? event.queryStringParameters.project_id : '';
    let role_id = undefined !== event.queryStringParameters.role_id ? event.queryStringParameters.role_id : '';
    loginDataCasting.getConnection(async (err, connection) => {
        if (err) {
            reject(err);
        }
        if (project_id.length === 0) {
            if (role_id.length === 0) {
                result = await getAllAvailableRoles(connection);
            } else {
                result = await getSpecificRole(connection, role_id);
            }
        } else {
            if (role_id.length === 0) {
                result = await getRolesForProject(connection, project_id);
            } else {
                result = await getRoleForSpecificProject(connection, project_id, role_id);
            }
        }

        let i = 0;
             console.table(data);
            result.forEach(element => {
                resultarr.push({
                    _id: i.toString(),
                    role_id: element.role_id,
                    project_id: element.project_id,
                    role_name: element.role_name,
                    role_type: element.role_type,
                    remote: element.remote,
                    gender: element.gender,
                    age_range: element.age_range,
                    ethnicity: element.ethnicity,
                    skills: element.skills
                });
                i++;
            });
            resultJSON.resultarr = resultarr;
            response = JSON.stringify(resultJSON);
            callback(null, {
                statusCode: responseCode,
                body: response
            })

    });


};

module.exports.applyToRole = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let responseCode = 200;
    let response = '';
    let resultJSON = {};
    let resultarr = [];
    let result;
    let project_id = undefined !== event.queryStringParameters.project_id ? event.queryStringParameters.project_id : '';
    let role_id = undefined !== event.queryStringParameters.role_id ? event.queryStringParameters.role_id : '';
    if (project_id.length === 0) {
        if (role_id.length === 0) {
            result = getAllAvailableRoles();
        } else {
            result = getSpecificRole(role_id);
        }
    } else {
        if (role_id.length === 0) {
            result = getRolesForProject(project_id);
        } else {
            result = getRoleForSpecificProject(project_id, role_id);
        }
    }
    let i = 0;
    Promise.all([result]).then((data) => {
        data.forEach(element => {
            resultarr.push({
                _id: i.toString(),
                role_id: element.role_id,
                project_id: element.project_id,
                role_name: element.role_name,
                role_type: element.role_type,
                remote: element.remote,
                gender: element.gender,
                age_range: element.age_range,
                ethnicity: element.ethnicity,
                skills: element.skills
            });
            i++;
        });
        resultJSON.resultarr = resultarr;
        response = JSON.stringify(resultJSON);
    }).catch((err) => {
        responseCode = 500;
        throw err;
    }).then(
        callback(null, {
            statusCode: responseCode,
            body: response
        })
    );
};

module.exports.getProfile = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let responseCode = 200;
    let resultJSON = {};
    let resultarr = [];
    let response = '';
    console.log(event);
    let userID = event.queryStringParameters.userID;
    let queryString = `select distinct sp.c_uid, sp.first_name, sp.last_name, sp.email, sp.phone,sp.bio,sp.headshot_url_1,sp.headshot_url_2,sp.headshot_url_3,sp.headshot_url_4,sp.resume_url,sp.demo_reel_url from submission_profile sp where sp.user_id = '${userID}'`;
    let i = 0;
    console.log("connecting to db");
    loginDataCasting.getConnection((err, connection) => {
        if (err) {
            responseCode = 500;
            console.log(err);
            throw err;
        }
        let queryPromise = new Promise((resolve, reject) => {
            connection.query(queryString, function (err, result, fields) {
                if (err) {
                    responseCode = 500;
                    console.log(err);
                    reject(err);
                }
                result.forEach(element => {
                    resultarr.push({
                        _id: i.toString(),
                        c_uid: element.c_uid,
                        first_name: element.first_name,
                        last_name: element.last_name,
                        email: element.email,
                        phone: element.phone,
                        bio: element.bio,
                        headshot_url_1: element.headshot_url_1,
                        headshot_url_2: element.headshot_url_2,
                        headshot_url_3: element.headshot_url_3,
                        headshot_url_4: element.headshot_url_4,
                        resume_url: element.resume_url,
                        demo_reel_url: element.demo_reel_url
                    });
                    i++;
                });
                resultJSON.resultarr = resultarr;
                response = JSON.stringify(resultJSON);
                connection.release();
                resolve(response);
            });
        });
        queryPromise.then((values) => {
            callback(null, {
                statusCode: responseCode,
                body: values
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
    let queryString = `select distinct sp.first_name,
                                       sp.last_name,
                                       sp.email,
                                       sp.phone,
                                       sp.bio,
                                       sp.headshot_url_1,
                                       sp.headshot_url_2,
                                       sp.headshot_url_3,
                                       sp.headshot_url_4,
                                       sp.resume_url,
                                       sp.demo_reel_url
                       from submission_profile sp`;
    let i = 0;
    loginDataCasting.getConnection((err, connection) => {
        connection.query(queryString, function (err, result, fields) {
            if (err) {
                responseCode = 500;
                throw err
            }
            result.forEach(element => {
                resultarr.push({
                    _id: i.toString(),
                    first_name: element.first_name,
                    last_name: element.last_name,
                    email: element.email,
                    phone: element.phone,
                    bio: htmlToString(element.bio).toString(),
                    headshot_url_1: element.headshot_url_1,
                    headshot_url_2: element.headshot_url_2,
                    headshot_url_3: element.headshot_url_3,
                    headshot_url_4: element.headshot_url_4,
                    resume_url: element.resume_url,
                    demo_reel_url: element.demo_reel_url
                });
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

const stringToHTML = function (str) {
    return str.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/"/g, "&#039;");
};
const htmlToString = function (str) {
    return str.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"").replace(/&#039;/g, "\'");
};


let test = () => {
    let responseCode = 200;
    let response = '';
    let resultJSON = {};
    let resultarr = [];
    let result;
    let project_id = '';
    let role_id = '816bfee1209922c1fd3e';
    loginDataCasting.getConnection(async (err, connection) => {
        if (err) {
            reject(err);
        }
        if (project_id.length === 0) {
            if (role_id.length === 0) {
                result = await getAllAvailableRoles(connection);
            } else {
                result = await getSpecificRole(connection, role_id);
            }
        } else {
            if (role_id.length === 0) {
                result = await getRolesForProject(connection, project_id);
            } else {
                result = await getRoleForSpecificProject(connection, project_id, role_id);
            }
        }

        let i = 0;
            result.forEach(element => {
                resultarr.push({
                    _id: i.toString(),
                    role_id: element.role_id,
                    project_id: element.project_id,
                    role_name: element.role_name,
                    role_type: element.role_type,
                    remote: element.remote,
                    gender: element.gender,
                    age_range: element.age_range,
                    ethnicity: element.ethnicity,
                    skills: element.skills
                });
                i++;
            });
            resultJSON.resultarr = resultarr;
            response = JSON.stringify(resultJSON);
            console.table(response);
    });

};