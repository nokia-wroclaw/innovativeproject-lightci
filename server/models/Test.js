/**
 * Created by ms on 21.12.14.
 */
module.exports = function(sequelize, DataTypes) {
  var Test = sequelize.define('Test', {
    name:DataTypes.STRING,
    time: DataTypes.STRING,
    type: DataTypes.STRING,
    message: DataTypes.STRING
  },{
    timestamps: false,
    classMethods: {
      associate: function (models) {
        Test.belongsTo(models.TestSuite);
      }
    }
  });
  return Test;
};
