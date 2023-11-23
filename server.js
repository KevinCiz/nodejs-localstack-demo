// Required Modules
const aws = require('aws-sdk');
const mssql = require('mssql')
const express = require('express');
const app = express();
require("dotenv").config();

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

// function fetchBooks(callback) {
//   async () => {
//     try {
//       // make sure that any items are correctly URL encoded in the connection string
//       await mssql.connect(process.env.DATASOURCE_URL)
//       const result = await mssql.query`SELECT * FROM book`
//       console.dir(result)
//     } catch (err) {
//       console.log(err)
//     }
//   }
// }


// PROBLEM IS HERE ONWARDS
app.get('/books', function (req, res) {

  const sqlConfig = {
    user: 'sa',
    password: 'Secret1234',
    database: 'dockerdb',
    server: 'mssql',
    port: 1433,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
  }

  async () => {
  try {
    console.log('hit1')
    // make sure that any items are correctly URL encoded in the connection string
    mssql.connect(sqlConfig)
    console.log('hit2')
    const result = await mssql.query`select * from books`
    console.log(result)
  } catch (err) {
    console.log(err)
  }
}
})

// Run Server
var server = app.listen(process.env.PORT, function () {
  var host = process.env.HOST
  var port = process.env.PORT
  console.log("Example app listening at http://%s:%s", host, port)
})