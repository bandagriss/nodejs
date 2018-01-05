'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('pais', [
      { nombre: 'ARGENTINA', created_at: new Date(), updated_at: new Date()},
      { nombre: 'URUGUAY', created_at: new Date(), updated_at: new Date()},
      { nombre: 'MEXICO', created_at: new Date(), updated_at: new Date()},
      { nombre: 'COSTA RICA', created_at: new Date(), updated_at: new Date()},
      { nombre: 'DUBAI', created_at: new Date(), updated_at: new Date()},
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('pais', null, {});
  },
};
