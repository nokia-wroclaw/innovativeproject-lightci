/**
 * Created by ms on 21.01.15.
 */
module.exports = function(sequelize, DataTypes) {
  var Artifact = sequelize.define('Artifact', {
    file_name: DataTypes.STRING,
    date: DataTypes.DATE
  },{
    timestamps: false,
    classMethods: {
      associate: function (models) {
        Artifact.belongsTo(models.Build);
      }
    }
  });
  return Artifact;
};
