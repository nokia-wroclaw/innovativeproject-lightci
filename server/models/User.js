/**
 * Created by ms on 21.12.14.
 */

var bcrypt = require('bcrypt-nodejs');


module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    user_name: DataTypes.STRING,
    user_pass: DataTypes.STRING,
    user_email: DataTypes.STRING
  },{
    timestamps: false,
    classMethods : {
      generateHash : function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
      },
      validPassword : function(password,user) {
        return bcrypt.compareSync(password, user.user_pass);
      },
      associate: function(models) {
        User.hasMany(models.UserRepo);
      }
    }
  });
  return User;
};
