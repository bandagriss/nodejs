const buscar = (Pais,Departamento, Provincia) => {
  return new Promise((resolve, reject) => {
    Pais.findOne({
      where: {deleted_at: null},
      include: [{
        model: Departamento,
        as: 'departamentos',
        required: false,
      }],
    })
      .then(resp => {
      resolve(resp);
    }).catch(error => {
      reject(error);
    });

  });
};

const buscar2 = (Pais, Departamento, Provincia ) => {
  return new Promise((resolve, reject) => {
    Departamento.findAll({
      where: {deleted_at: null},
      include: [{
        model: Pais,
        as: 'pais',
        required: false,
      }],
    })
    .then(resp => {
      resolve(resp);
    }).catch(error => {
      reject(error);
    });

  });
};


module.exports = {
  buscar,
  buscar2,
};

