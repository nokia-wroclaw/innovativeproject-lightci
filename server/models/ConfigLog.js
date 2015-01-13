/**
 * Created by ms on 13.01.15.
 */
module.exports = function (sequelize, DataTypes) {
  var ConfigLog = sequelize.define('ConfigLog', {
    date: DataTypes.DATE,
    before_operation: DataTypes.STRING,
    file_name: DataTypes.STRING
  },{
    timestamps: false,
    classMethods:{
    }
  });
  return ConfigLog;
};
