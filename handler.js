const axios = require('axios');
const process = require('process');
const serverless = require("serverless-http");
const express = require("express");
const app = express();

const tmdbApiKey = process.env.TMDB_API_KEY
const baseTMDBApi = process.env.TMDB_BASE_URL

/**
 * Default Header
 */
app.use("*", (_, res, next) => {
  res.setHeader("X-Powered-By", "PSM Dev")
  res.setHeader("Access-Control-Allow-Headers", "*")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "*")
  next()
})

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from proxy server 🤗",
    time: Date.now()
  });
});

app.all("/tmdb/*", async (req, res, next) => {
  try {
    const url = `${baseTMDBApi}${req.path.replace('/tmdb/', '')}`
    const query = {}
    Object.assign(query, req.query)
    if(!req.query.api_key) {
      Object.assign(query, { api_key: tmdbApiKey })
    }
    console.log(req.method)
    const result = await axios(
      {
        method: req.method,
        url: url,
        params: query
      }
    );
    console.log(result);
    return res.status(result.status).json(result.data);
  } catch (err) {
    return res.status(404).json({ message: "Not Found" })
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
