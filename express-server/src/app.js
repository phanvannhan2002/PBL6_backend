"use strict";
const express = require("express");
const app = express();
const { NotFoundRequestError } = require("./core/error.response");
require("dotenv").config();
app.use(express.json());
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yaml");
const morgan = require("morgan");

// init db
require('./dbs/init.mongo').getInstance();
const initRedis = require("./dbs/init.redis");
initRedis.initRedis();

// init routes
app.use("/v1/api", require("./routes/index"));
// init swagger and morgan in dev
if(process.env.NODE_ENV === "dev") {
    const yamlFile = fs.readFileSync('swagger-api.yaml', 'utf8');
    const options = yaml.parse(yamlFile);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(options));
    app.use((req, res) => {
      const url = req.url;
      res.status(404).json({
        message: `API ${url} not found!`,
      });
    });
    app.use(morgan("dev"));
}

// handle errors
app.use("*", (req, res, next) => {
  next(new NotFoundRequestError());
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: "error",
    code: statusCode,
    error: error.message || error.error || "Internal Server Error",
  });
});

module.exports = app;
