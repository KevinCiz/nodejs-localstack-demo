// Required Modules
const aws = require('aws-sdk');
const mssql = require('mssql')
const express = require('express');
const app = express();
require("dotenv").config();

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

aws.config.loadFromPath('./credentials.json');

// Healthcheck
app.get('/health', function (req, res) {
  console.log('Loading /health endpoint...');
  res.end("OK; Environment=" + process.env.ENVIRONMENT);
});

// Getting content of text file from S3
app.get('/s3', function (req, res) {
  console.log('Loading /s3 endpoint...');

  var s3 = new aws.S3({
    endpoint: process.env.ENDPOINT,
    region: process.env.REGION,
    s3ForcePathStyle: true
  });

  var params = {
    Bucket: process.env.BUCKET_NAME,
    Key: process.env.FILE_NAME
  };

  s3.getObject(params, function (err, data) {
    if (err) console.error(err);
    else {
      let objectData = data.Body.toString('utf-8');

      console.log("File retrieved from S3");
      console.log("Content of file: " + objectData);

      res.statusCode = 200;
      res.end(objectData);
    }
  });
})

// Getting Secrets from SecretsManager
app.get('/secrets', function (req, res) {
  console.log('Loading /secrets endpoint...');
  var secretsManager = new aws.SecretsManager({
    endpoint: process.env.ENDPOINT,
    region: process.env.REGION
  })

  var params = {
    SecretId: process.env.SECRETS_ID
  };

  console.log('Retrieving secret from SecretsManager...');

  secretsManager.getSecretValue(params, function (err, data) {
    if (err) console.error(err);
    else {
      console.log("Secrets retrieved from SecretsManager: " + data.SecretString);
      return res.end(data.SecretString);
    }
  });
});

app.get('/books', function (req, res) {
  const sqlConfig = {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    database: process.env.MSSQL_DATABASE,
    server: process.env.MSSQL_SERVER,
    port: normalizePort(process.env.MSSQL_PORT),
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      trustedConnection: true, // for kerboros usage
      encrypt: true, // for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
  }

  mssql.connect(sqlConfig).then(() => mssql.query('select * from book')).then((result) => {
    var myarr = new Array();

    for (var i = 0; i < result.recordset.length; ++i) {
      var id = result.recordset[i].id;
      var title = result.recordset[i].title;
      myarr.push({ 'Id': id, 'Title': title });
    }

    res.json(myarr);

    mssql.close();
  })
})

// Run Server
var server = app.listen(process.env.PORT, function () {
  var host = process.env.HOST
  var port = process.env.PORT
  console.log("Example app listening at http://%s:%s", host, port)
})