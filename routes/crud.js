const models = require('../db')().models;


/**
 * 
 * @param {Objecto} 
 * @return {Servicios}  //crea cruds automaticamente
 */

const crud = [
  { model: models.pais, autorization: [true], accept_request: ["GET", "POST", "PUT", "DELETE"] },
];


module.exports= {
  crud,
};
