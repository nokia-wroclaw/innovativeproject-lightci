/**
 * Created by ms on 21.12.14.
 */
module.exports = function (sequelize, DataTypes) {
  var Build = sequelize.define('Build', {
    build_date: DataTypes.DATE,
    build_status: DataTypes.STRING
  },{
    timestamps: false,
    classMethods:{
    associate: function(models) {
        Build.belongsTo(models.Project);
        Build.hasMany(models.Commit);
        Build.hasMany(models.ScriptOutput);
        Build.hasMany(models.Deploy);
      }
    }
  });
  return Build;
};
