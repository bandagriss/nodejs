import express from "express";
import consign from "consign";
const cors = require('cors');



const app= express();


console.log("inicio");
consign({verbose:false});
consign()
  .include("libs/config.js")
  .then("libs/util.js")
  .then("db.js")
  .then("auth.js")
  .then("libs/middlewares.js")
  .then("routes")
  .then("libs/boot.js")
  .into(app);

//aplicando resauto

const models = require('./db')().models;
const resauto = require('./libs/resauto');
const rest = require('./routes/crud');

resauto.setSequelize(models.Sequelize);
resauto.addModels(rest.crud);
app.all('/*/:id_tabla', resauto.public);
app.all('/*', resauto.public);

module.exports=app;

// app.models.user  https://www.npmjs.com/package/consign
// app.models.company 
// app.controllers.user 
// app.controllers.company 
