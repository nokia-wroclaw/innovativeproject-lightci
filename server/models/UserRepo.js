/**
 * Created by michal on 21.02.15.
 */
module.exports = function(sequelize, DataTypes) {
  var UserRepo = sequelize.define('UserRepo', {
    repo_name:    DataTypes.STRING,
    repo_address: DataTypes.STRING,
    repo_type:    DataTypes.STRING
  },{
    timestamps: false,
    classMethods : {
      associate: function(models) {
        UserRepo.belongsTo(models.User);
      }
    }
  });
  return UserRepo;
};
