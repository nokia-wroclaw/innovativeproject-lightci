/**
 * Created by ms on 21.12.14.
 */
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    user_name: DataTypes.STRING,
    user_pass: DataTypes.STRING,
    user_level: DataTypes.INTEGER,
    user_email: DataTypes.STRING
  },{
    timestamps: false
  });
  return User;
};
