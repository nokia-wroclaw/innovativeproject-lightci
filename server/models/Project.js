/**
 * Created by ms on 21.12.14.
 */
module.exports = function(sequelize, DataTypes) {
  var Project = sequelize.define('Project', {
    project_url: DataTypes.STRING,
    project_name: DataTypes.STRING,
    project_average_build_time: DataTypes.DATE
  },{
    timestamps: false,
    classMethods: {
      associate: function(models) {
        Project.hasMany(models.Commit);
        Project.hasMany(models.Build);
      }
    }
  });
  return Project;
};
