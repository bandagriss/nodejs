module.exports = (sequelize, DataTypes) => {
  return sequelize.define('pais', {
    id_pais: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
  },
  {
    timestamps: true,
    paranoid: true,
    freezeTableName: true,
    classMethods: {
      associate: (models) => {
        // models.pais.hasMany(models.departamento, {as: 'departamentos', foreignKey:'fid_pais'});
      },
    },
  });
};
