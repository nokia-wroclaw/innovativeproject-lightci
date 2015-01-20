/**
 * Created by ms on 21.12.14.
 */
module.exports = function(sequelize, DataTypes) {
  var Deploy = sequelize.define('Deploy', {
    deploy_server: DataTypes.STRING,
    deploy_status: DataTypes.STRING,
    deploy_message: DataTypes.STRING
  },{
    timestamps: false,
    classMethods: {
      associate: function (models) {
        Deploy.belongsTo(models.Build);
      }
    }
  });
  return Deploy;
};
