/**
 * Created by ms on 21.12.14.
 */
module.exports = function(sequelize, DataTypes) {
  var TestSuite = sequelize.define('TestSuite', {
    name:DataTypes.STRING,
    time: DataTypes.STRING,
    tests: DataTypes.INTEGER,
    failures: DataTypes.INTEGER,
    skipped: DataTypes.INTEGER,
    errors: DataTypes.INTEGER
  },{
    timestamps: false,
    classMethods: {
      associate: function (models) {
        TestSuite.belongsTo(models.TestSuite);
        TestSuite.hasMany(models.Test);
      }
    }
  });
  return TestSuite;
};
