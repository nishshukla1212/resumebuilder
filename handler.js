const ejs = require('ejs');
var HtmlDocx = require('html-docx-js');
const fs = require('fs');
const AWS = require('aws-sdk');
const chromium = require('chrome-aws-lambda');
const path = require('path');
const imageToBase64 = require('image-to-base64');
const nodemailer = require("nodemailer");
var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');

var s3 = new AWS.S3();
const htmlPath = '/tmp/template.html';
const template = '/tmp/template.ejs';
var templateName = '';
var dt = new Date().getMilliseconds();
var url;
var response;

var data = {
  summary: {},
  template: "Template10.ejs",
  orderedSections: ["FILM & TELEVISION", "THEATER"],
  imageBase64: "https://www.kindpng.com/picc/m/495-4952535_create-digital-profile-icon-blue-user-profile-icon.png",
  personalArray: [{
    firstName: "Nish",
    lastName: "Shukla",
    email: "nishith.shukla@arvatosystems.com",
    phone: "8482429075",
    title: "Actor"

  }

  ],
  theaterArray: [{
    playName: "TestPlay",
    roleName: "TestRole",
    theaterName: "TestTheater"

  }

  ],
  filmArray: [{
    playName: "TestFilm",
    roleName: "TestRole",
    theaterName: "TestType"

  }

  ],
  tvArray: [{
    playName: "TestFilm",
    roleName: "TestRole",
    theaterName: "TestType"

  }

  ],
  trainingArray: [{
    playName: "School",
    roleName: "TestName",
    theaterName: "TestDesc"

  }

  ],
  skills: "Special Skills"
};
var emailProp = require("./emailProp.json");

module.exports.getpdf = (event, context, callback) => {
  const data = JSON.parse(event.body);
  const resumePath = `/tmp/${data.personalArray.firstName}_${dt}.pdf`;

  data.firstTitle = 'THEATER';
  data.secondTitle = 'FILM';
  data.thirdTitle = 'TV';
  data.fourthTitle = 'TRAINING';

  if (undefined !== data.orderedSections && data.orderedSections.length) {
    for (let i = 0; i < data.orderedSections.length; i++) {
      switch (i) {
        case 0:
          data.firstTitle = data.orderedSections[i];
          break;
        case 1:
          data.secondTitle = data.orderedSections[i];
          break;
        case 2:
          data.thirdTitle = data.orderedSections[i];
          break;
        case 3:
          data.fourthTitle = data.orderedSections[i];
          break;

        default:
          break;
      }

    }
  }


  if (data.imageBase64 != '' && data.template !== 'template2.ejs' && data.template !== 'template10.ejs' && data.template !== 'template11.ejs') {

    convert64(data.imageBase64).then(async (imagebase64) => {
      data.imageBase64 = imagebase64.toString();

      getObject('resumehtml', data.template, template).then((fileData) => {

        fs.writeFileSync(template, fileData, undefined, (data2) => {
          resolve(data2);
          console.log('EJS Written to a file');
        });

      }).then(() => {
        htmlGenerator(template, data)
          .then(async (html) => {
            if (html) console.log('html generated');
            //------AWS-LAMBDA------
            let browser = null;

            try {
              browser = await chromium.puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: true,
                ignoreHTTPSErrors: true,
              });

              let page = await browser.newPage();
              //put the html into a file
              fs.writeFileSync(htmlPath, html.toString(), undefined, (data) => {
                console.log(data);
                console.log('HTML Written to a file');
              });

              await page.goto(`file:///${htmlPath}`, {
                waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
              });

              await page.pdf({
                path: resumePath,
                printBackground: true,
                format: 'A4',
                displayHeaderFooter: false,
              }).then((pdfDocument)=>{
                sendEmail(data);
              }).catch((err)=>{
                console.log(err);
              });

            } catch (error) {
              console.log(error);
            } finally {
              if (browser !== null) {
                await browser.close();
              }
            }
            //-----!AWS-LAMBDA------
          }).then(async () => {
            url = await putObject('resume-html-pdf', `resume.pdf`, resumePath, 'application/pdf');
            return url;
          }).then(function (response) {
            console.log(response);
            callback(null, {
              statusCode: 200,
              body: JSON.stringify(response)
            });
          }).catch(function (err) {
            console.log('ERROR in PDF generation : ' + err);
          });
      });
    });
  }
  else {
    getObject('resumehtml', data.template, template).then((fileData) => {

      fs.writeFileSync(template, fileData, undefined, (data2) => {
        resolve(data2);
        console.log('EJS Written to a file');
      });

    }).then(() => {
      htmlGenerator(template, data)
        .then(async (html) => {
          if (html) console.log('html generated');
          //------AWS-LAMBDA------
          let browser = null;

          try {
            browser = await chromium.puppeteer.launch({
              args: chromium.args,
              defaultViewport: chromium.defaultViewport,
              executablePath: await chromium.executablePath,
              headless: true,
              ignoreHTTPSErrors: true,
            });

            let page = await browser.newPage();
            //put the html into a file
            fs.writeFileSync(htmlPath, html.toString(), undefined, (data) => {
              console.log(data);
              console.log('HTML Written to a file');
            });

            await page.goto(`file:///${htmlPath}`, {
              waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
            });

            await page.pdf({
              path: resumePath,
              printBackground: true,
              format: 'A4',
              displayHeaderFooter: false,
            }).then((pdfDocument)=>{
              sendEmail(data);
            }).catch((err)=>{
              console.log(err);
            });

          } catch (error) {
            console.log(error);
          } finally {
            if (browser !== null) {
              await browser.close();
            }
          }
          //-----!AWS-LAMBDA------
        }).then(async () => {
          url = await putObject('resume-html-pdf', `resume.pdf`, resumePath, 'application/pdf');
          return url;
        }).then(function (response) {
          console.log(response);
          callback(null, {
            statusCode: 200,
            body: JSON.stringify(response)
          });
        }).catch(function (err) {
          console.log('ERROR in PDF generation : ' + err);
        });
    });
  }
};

var htmlGenerator = (templateFile, data) => {
  return new Promise(function (resolve, reject) {
    ejs.renderFile(templateFile, data, function (err, html) {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    });
  });
};


async function getObject(bucket, objectKey, filePath) {
  try {
    const params = {
      Bucket: bucket,
      Key: objectKey
    };

    const data = await s3.getObject(params).promise();

    return data.Body.toString('utf-8');
  } catch (e) {
    throw new Error(`Could not retrieve file from S3: ${e.message}`);
  }
}

async function putObject(bucket, objectKey, filePath, contentType) {
  try {
    const params = {
      Key: path.basename(filePath).toString().toLowerCase(),
      Body: fs.readFileSync(filePath),
      Bucket: bucket
    };
    s3.putObject(params, function (err, data) {
      if (err)
        console.log(err, err.stack); // an error occurred
      else
        console.log(data); // successful response
    });
    var url = `https://${bucket}.s3.amazonaws.com/${path.basename(filePath).toString().toLowerCase()}`;
    return url;
  } catch (e) {
    throw new Error(`Could not put file into S3: ${e.message}`);
  }
}

module.exports.getHTML = (event, context, callback) => {
  const data = JSON.parse(event.body);
  const resumePath = `/tmp/${data.personalArray.firstName}.html`;
  // console.log(data);
  getObject('resumehtml', data.template, template).then((fileData) => {
    htmlGenerator(template, data)
      .then(async (html) => {
        if (html) console.log('html generated');
        //------AWS-LAMBDA------
        fs.writeFileSync(htmlPath, html.toString(), undefined, (data) => {
          console.log(data);
          console.log('HTML Written to a file');
        });

        return result;
        //-----!AWS-LAMBDA------
      }).then(async () => {
        url = await putObject('resume-html-pdf', `resume.html`, resumePath, 'text/html');
        return url;
      }).then(function (response) {
        console.log(response);
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(response)
        });
      }).catch(function (err) {
        console.log('ERROR in PDF generation : ' + err);
      });
  });

};


module.exports.getWord = (event, context, callback) => {
  const data = JSON.parse(event.body);
  const resumePath = `/tmp/${data.personalArray.firstName}_${dt}.docx`;

  data.firstTitle = 'THEATER';
  data.secondTitle = 'FILM';
  data.thirdTitle = 'TV';
  data.fourthTitle = 'TRAINING';

  if (undefined !== data.orderedSections && data.orderedSections.length) {
    for (let i = 0; i < data.orderedSections.length; i++) {
      switch (i) {
        case 0:
          data.firstTitle = data.orderedSections[i];
          break;
        case 1:
          data.secondTitle = data.orderedSections[i];
          break;
        case 2:
          data.thirdTitle = data.orderedSections[i];
          break;
        case 3:
          data.fourthTitle = data.orderedSections[i];
          break;
        default:
          break;
      }

    }
  }


    return new Promise((resolve,reject)=>{
      //Load the docx file as a binary
      var content = fs
      .readFileSync(path.resolve('./wordTemplates', String(data.template).split('.')[0]+'.docx'), 'binary');

      var zip = new PizZip(content);
      var doc;
      try {
        doc = new Docxtemplater(zip,{
          nullGetter(part, scopeManager) {
            if (!part.module) {
                return "";
            }
            if (part.module === "rawxml") {
                return "";
            }
            return "";
        }
        });
      } catch(error) {
      // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
      errorHandler(error);
      }
            //set the templateVariables
      doc.setData(data);

      try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render();
      }
      catch (error) {
        // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
        errorHandler(error);
      }

      var buf = doc.getZip()
                .generate({type: 'nodebuffer'});

      // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
      fs.writeFileSync(resumePath, buf);
      resolve(resumePath);
    }).then(async () => {
      url = await putObject('resume-html-pdf', `resume.docx`, resumePath, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      return url;
    }).then(function (response) {
      console.log(response);
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(response)
      });
    }).catch(function (err) {
      console.log('ERROR in PDF generation : ' + err);
    });
  
};

function convert64(url) {
  if (!url || url === '') {
    return '';
  } else {
    return imageToBase64(url) // you can also to use url
      .then(
        (response) => {
          // console.log(response); //cGF0aC90by9maWxlLmpwZw==
          return Promise.resolve(response);
        }
      )
      .catch(
        (error) => {
          console.log(error); //Ex
          return Promise.reject(error);
        }
      );
  }
}




var getPrint = async () => {
  // const data = JSON.parse(event.body);
  const resumePath2 = `C:/Users/mypc_shuk012/Documents/resume.pdf`;
  const resumePath = `C:/Users/mypc_shuk012/Documents/resume.docx`;
  let htmlPath2 = 'C:/Users/mypc_shuk012/Documents/test.html';
  const ejsPath = 'C:/Users/SHUK012/Downloads/Resume Templates/template11.ejs';
  data.imageBase64 = 'https://static.wixstatic.com/media/1bf8c6_9ccccc8771914070aa55622d1b067774~mv2.jpg';
  //let imagebase64 = await convert64(data.imageBase64);
  //data.imageBase64 = await imagebase64.toString();
  data.firstTitle = 'THEATER';
  data.secondTitle = 'FILM';
  data.thirdTitle = 'TV';
  data.fourthTitle = 'TRAINING';
  data.personalArray.firstName = 'Test';
  data.personalArray.lastName = 'Test';
  data.personalArray.email = 'Test@Test.com';
  data.personalArray.phone = '1234567890';

  if (undefined !== data.orderedSections && data.orderedSections.length) {
    for (let i = 0; i < data.orderedSections.length; i++) {
      switch (i) {
        case 0:
          data.firstTitle = data.orderedSections[i];
          break;
        case 1:
          data.secondTitle = data.orderedSections[i];
          break;
        case 2:
          data.thirdTitle = data.orderedSections[i];
          break;
        case 3:
          data.fourthTitle = data.orderedSections[i];
          break;

        default:
          break;
      }

    }
  }


  htmlGenerator(ejsPath, data)
    .then(async (html) => {
      // console.log(data);s

      fs.writeFileSync(htmlPath2, html.toString(), undefined);

      let browser = null;

      try {
        var docx = HtmlDocx.asBlob(html);
        fs.writeFileSync(resumePath, docx, function (err) {
          if (err) throw err;
        });

        browser = await chromium.puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath,
          headless: true,
          ignoreHTTPSErrors: true,
        });

        let page = await browser.newPage();
        //put the html into a file

        await page.goto(`file:///${htmlPath2}`, {
          waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
        });

        await page.pdf({
          path: resumePath2,
          printBackground: true,
          format: 'A4',
          displayHeaderFooter: false,
        });

      } catch (error) {
        console.log(error);
      } finally {
        if (browser !== null) {
          await browser.close();
        }
      }
    }).catch((err) => {
      console.log(err);
    });
};

module.exports.getpreviewpdf = (event, context, callback) => {
  const data = JSON.parse(event.body);
  const resumePath = `/tmp/${data.personalArray.firstName}_${dt}.pdf`;

  data.firstTitle = 'THEATER';
  data.secondTitle = 'FILM';
  data.thirdTitle = 'TV';
  data.fourthTitle = 'TRAINING';
  data.imageBase64 = 'https://static.wixstatic.com/media/1bf8c6_9ccccc8771914070aa55622d1b067774~mv2.jpg';

  data.template = data.template.substring(0, data.template.length - 4) + ' - Copy.ejs';
  console.log(data.template);

  if (undefined !== data.orderedSections && data.orderedSections.length) {
    for (let i = 0; i < data.orderedSections.length; i++) {
      switch (i) {
        case 0:
          data.firstTitle = data.orderedSections[i];
          break;
        case 1:
          data.secondTitle = data.orderedSections[i];
          break;
        case 2:
          data.thirdTitle = data.orderedSections[i];
          break;
        case 3:
          data.fourthTitle = data.orderedSections[i];
          break;
        default:
          break;
      }

    }
  }


  if (data.imageBase64 != '' && data.template !== 'template2.ejs - Copy.ejs' && data.template !== 'template10.ejs - Copy.ejs' && data.template !== 'template11.ejs - Copy.ejs') {

    convert64(data.imageBase64).then(async (imagebase64) => {
      data.imageBase64 = imagebase64.toString();

      getObject('resumehtml', data.template, template).then((fileData) => {

        fs.writeFileSync(template, fileData, undefined, (data2) => {
          resolve(data2);
          console.log('EJS Written to a file');
        });

      }).then(() => {
        htmlGenerator(template, data)
          .then(async (html) => {
            if (html) console.log('html generated');
            //------AWS-LAMBDA------
            let browser = null;

            try {
              browser = await chromium.puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: true,
                ignoreHTTPSErrors: true,
              });

              let page = await browser.newPage();
              //put the html into a file
              fs.writeFileSync(htmlPath, html.toString(), undefined, (data) => {
                console.log(data);
                console.log('HTML Written to a file');
              });

              await page.goto(`file:///${htmlPath}`, {
                waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
              });

              await page.pdf({
                path: resumePath,
                printBackground: true,
                format: 'A4',
                displayHeaderFooter: false,
              });

            } catch (error) {
              console.log(error);
            } finally {
              if (browser !== null) {
                await browser.close();
              }
            }
            //-----!AWS-LAMBDA------
          }).then(async () => {
            url = await putObject('resume-html-pdf', `resume.pdf`, resumePath, 'application/pdf');
            return url;
          }).then(function (response) {
            console.log(response);
            callback(null, {
              statusCode: 200,
              body: JSON.stringify(response)
            });
          }).catch(function (err) {
            console.log('ERROR in PDF generation : ' + err);
          });
      });
    });
  }
  else {
    getObject('resumehtml', data.template, template).then((fileData) => {

      fs.writeFileSync(template, fileData, undefined, (data2) => {
        resolve(data2);
        console.log('EJS Written to a file');
      });

    }).then(() => {
      htmlGenerator(template, data)
        .then(async (html) => {
          if (html) console.log('html generated');
          //------AWS-LAMBDA------
          let browser = null;

          try {
            browser = await chromium.puppeteer.launch({
              args: chromium.args,
              defaultViewport: chromium.defaultViewport,
              executablePath: await chromium.executablePath,
              headless: true,
              ignoreHTTPSErrors: true,
            });

            let page = await browser.newPage();
            //put the html into a file
            fs.writeFileSync(htmlPath, html.toString(), undefined, (data) => {
              console.log(data);
              console.log('HTML Written to a file');
            });

            await page.goto(`file:///${htmlPath}`, {
              waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
            });

            await page.pdf({
              path: resumePath,
              printBackground: true,
              format: 'A4',
              displayHeaderFooter: false,
            });

          } catch (error) {
            console.log(error);
          } finally {
            if (browser !== null) {
              await browser.close();
            }
          }
          //-----!AWS-LAMBDA------
        }).then(async () => {
          url = await putObject('resume-html-pdf', `resume.pdf`, resumePath, 'application/pdf');
          return url;
        }).then(function (response) {
          console.log(response);
          callback(null, {
            statusCode: 200,
            body: JSON.stringify(response)
          });
        }).catch(function (err) {
          console.log('ERROR in PDF generation : ' + err);
        });
    });
  }
};

function sendEmail(data) {
  console.log("Sending Email");

  let subject = data.personalArray.firstName.toString() +' '+ data.personalArray.lastName.toString() + ' Used Resume Builder';

  transporter = nodemailer.createTransport({
    SES: new AWS.SES({
      apiVersion: '2010-12-01'
    })
  });

  transporter.sendMail({
    from: emailProp.from, // sender address
    to: emailProp.to, // list of receivers
    cc: '', // list of receivers
    bcc: '', // list of receivers
    subject: subject, // Subject line
    html: JSON.stringify(data, null, 2)
  })
    .catch(error => {
      console.error('Error sending mail: '+ error);
      console.log(error);
      return Promise.reject(error);
    });

    console.log("Email Sent");
}


function replaceVariables(string, arr) {
  let str;
  str = string.replace(/%\w+%/g, function (all) {
    return arr[all] || all;
  });
  return str;
}

// The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
function replaceErrors(key, value) {
  if (value instanceof Error) {
      return Object.getOwnPropertyNames(value).reduce(function(error, key) {
          error[key] = value[key];
          return error;
      }, {});
  }
  return value;
}

function errorHandler(error) {
  console.log(JSON.stringify({error: error}, replaceErrors));

  if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors.map(function (error) {
          return error.properties.explanation;
      }).join("\n");
      console.log('errorMessages', errorMessages);
      // errorMessages is a humanly readable message looking like this :
      // 'The tag beginning with "foobar" is unopened'
  }
  throw error;
}

function getTestWord(){
  const resumePath = `C:/Users/mypc_shuk012/Documents/resume.docx`;
  data.imageBase64 = 'https://static.wixstatic.com/media/1bf8c6_9ccccc8771914070aa55622d1b067774~mv2.jpg';
  data.template = 'template10.ejs';
  data.firstTitle = 'THEATER';
  data.secondTitle = 'FILM';
  data.thirdTitle = 'TV';
  data.fourthTitle = 'TRAINING';
  data.personalArray.firstName = 'Test';
  data.personalArray.lastName = 'Test';
  data.personalArray.email = 'Test@Test.com';
  data.personalArray.phone = '1234567890';

  data.firstTitle = 'THEATER';
  data.secondTitle = 'FILM';
  data.thirdTitle = 'TV';
  data.fourthTitle = 'TRAINING';

  if (undefined !== data.orderedSections && data.orderedSections.length) {
    for (let i = 0; i < data.orderedSections.length; i++) {
      switch (i) {
        case 0:
          data.firstTitle = data.orderedSections[i];
          break;
        case 1:
          data.secondTitle = data.orderedSections[i];
          break;
        case 2:
          data.thirdTitle = data.orderedSections[i];
          break;
        case 3:
          data.fourthTitle = data.orderedSections[i];
          break;
        default:
          break;
      }

    }
  }


  if (data.imageBase64 != '' && data.template !== 'template2.ejs') {

    convert64(data.imageBase64).then(async (imagebase64) => {
      //Load the docx file as a binary
      var content = fs
      .readFileSync(path.resolve('./wordTemplates', String(data.template).split('.')[0]+'.docx'), 'binary');

      var zip = new PizZip(content);
      var doc;
      try {
      doc = new Docxtemplater(zip,{
        nullGetter(part, scopeManager) {
          if (!part.module) {
              return "";
          }
          if (part.module === "rawxml") {
              return "";
          }
          return "";
      }
      });
      } catch(error) {
      // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
      errorHandler(error);
      }

            //set the templateVariables
      doc.setData(data);

      try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render();
      }
      catch (error) {
        // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
        errorHandler(error);
      }

      var buf = doc.getZip()
                .generate({type: 'nodebuffer'});

      // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
      fs.writeFileSync(resumePath, buf);
      
    });
  }
  else {

    getObject('resumehtml', data.template, template).then((fileData) => {

      fs.writeFileSync(template, fileData, undefined, (data2) => {
        resolve(data2);
        console.log('EJS Written to a file');
      });
    }).then(() => {
      htmlGenerator(template, data)
        .then(async (html) => {
          if (html) console.log('html generated');
          //------AWS-LAMBDA------
          var docx = HtmlDocx.asBlob(html);
          fs.writeFileSync(resumePath, docx, function (err) {
            if (err) throw err;
          });
          sendEmail(data);  
          //-----!AWS-LAMBDA------
        }).then(async () => {
          url = await putObject('resume-html-pdf', `resume.docx`, resumePath, 'application/msword');
          console.log('url-' + url);
          return url;
        }).then(function (response) {
          console.log(response);
          callback(null, {
            statusCode: 200,
            body: JSON.stringify(response)
          });
        }).catch(function (err) {
          console.log('ERROR in PDF generation : ' + err);
        });
    });
  }
}