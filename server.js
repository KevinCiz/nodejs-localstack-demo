// Required Modules
// const { Pool } = require('pg');
const pg = require('pg');
const aws = require('aws-sdk');
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
//   const config = {
//     user: 'dockeruser',
//     host: 'postgres',
//     database: 'dockerdb',
//     password: 'dockerpassword',
//     port: 5432,
//   }
//   const pool = new pg.Pool(config);
//   pool.connect((err, client, done) => {
//     if (err) throw err;
//     client.query('SELECT  * FROM  Book', (err, res) => {
//       if (err)
//         console.log(err.stack);
//       else {
//         console.log(res.rows);
//       }
//       pool.end()
//     })
//   });
// }

function fetchBooks(callback) {
  const config = {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT
  }
  const pool = new pg.Pool(config);
  pool.query("SELECT * FROM Book", (err, data) => {
    if(err) {
        return callback(err);
    }
    return callback(undefined, data.rows);
  });
}

app.get('/books', function (req, res) {
  fetchBooks((err, data) => {
    if (err) {
      console.log(err);
    }
    // res.status(200).send(data);
    console.log(data);
    res.write(JSON.stringify(data));
    res.end();
  });
});



// Run Server
var server = app.listen(process.env.PORT, function () {
  var host = process.env.HOST
  var port = process.env.PORT
  console.log("Example app listening at http://%s:%s", host, port)
})