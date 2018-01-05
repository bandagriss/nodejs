const pruebaBL = require('../bls/pruebaBL.js');

module.exports = (app) => {
  const Pais = app.db.models.pais;
  const Departamento = app.db.models.departamento;
  const Provincia = app.db.models.provincia;

  app.route('/api/v1/prueba')
    .get((req, res) => {
      pruebaBL.buscar(Pais, Departamento, Provincia)
      .then(resp => {
        res.status(200).json({
          finalizado: true,
          mensaje: "Se listaron los  datos correctamente.",
          datos: resp,
        });
      })
        .catch(error => {
          res.status(412).json({
            finalizado: false,
            mensaje: error,
            datos: {},
          });
        });
    });

  app.route('/api/v1/prueba2')
    .get((req, res) => {
      pruebaBL.buscar2(Pais, Departamento, Provincia)
      .then(resp => {
        res.status(200).json({
          finalizado: true,
          mensaje: "Se listaron los  datos correctamente.",
          datos: resp,
        });
      })
        .catch(error => {
          console.log('==============>', "error response", error);
          res.status(412).json({
            finalizado: false,
            mensaje: error,
            datos: {},
          });
        });
    });


};
