module.exports = app => {
/**
* @api {get} / Estado de la API
* @apiGroup Estado
* @apiSuccess {String} muestra un mensaje del estado de la aplicacion 
* @apiSuccessExample {json} Success
*
HTTP/1.1 200 OK
*
{"status": "Servicio funcionando"}
*/

  app.get("/", (req,res) => {
    res.json({status:"Servicio funcionando Correctamente"});
  });
};
