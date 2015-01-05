/**
 * Created by ms on 21.12.14.
 */
module.exports = function(sequelize, DataTypes) {
  var Commit = sequelize.define('Commit', {
    commit_id: DataTypes.STRING,
    commit_date: DataTypes.DATE,
    commit_author: DataTypes.STRING,
    commit_comment: DataTypes.STRING
  },{
    timestamps: false,
    classMethods: {
      associate: function (models) {
        Commit.belongsTo(models.Project);
        Commit.hasMany(models.Build);
      }
    }
  });
  return Commit;
};
