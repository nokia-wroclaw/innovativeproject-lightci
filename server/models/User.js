/**
 * Created by ms on 21.12.14.
 */
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
      validPassword : function(password) {
        return bcrypt.compareSync(password, this.user_pass);
      }
    }
  });
  return User;
};
