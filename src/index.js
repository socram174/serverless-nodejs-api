const serverless = require("serverless-http");
const express = require("express");
const crud = require('./db/crud');
const validators = require('./db/validators');
const { getDbClient } = require('./db/clients');

const app = express();
const STAGE = process.env.STAGE || 'prod';
app.use(express.json());


app.get("/", async (req, res, next) => {
  console.log(process.env.DEBUG);
  const sql = await getDbClient();
  const now = Date.now();
  const [dbNowResult] = await sql`select now();`
  const delta = (dbNowResult.now.getTime() - now) / 1000;
  return res.status(200).json({
    message: "Change test",
    delta: delta,
    stage: STAGE
  });
});

app.get("/hello", (req, res, next) => {

  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.get("/leads", async (req, res, next) => {
  const results = await crud.listLeads();
  return res.status(200).json({
    results: results
  });
});

app.post("/leads", async (req, res, next) => {
  // POST -> create data
  //curl -X POST -H "Content-Type: application/json" -d '{"email": "test@test.com"}' http://localhost:3000/leads
  const postData = await req.body;
  //const { email } = data; validation??
  const { data, hasError, message } = await validators.validateLead(postData);
  if(hasError === true){
    return res.status(400).json({
      message: message ? message : 'Invalid request, please try again.'
    });
  }else if( hasError === undefined){
    return res.status(500).json({
      message: 'Server error'
    });
  }


  const result = await crud.newLead(data);
  // insert data to the database
  return res.status(201).json({
    results: result
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

//server-full app
// app.listen(3000, ()=>{
//   console.log("Running on http://localhost:3000");
// });

exports.handler = serverless(app);
