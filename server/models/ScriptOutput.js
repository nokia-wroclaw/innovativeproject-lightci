/**
 * Created by ms on 21.12.14.
 */
module.exports = function(sequelize, DataTypes) {
  var ScriptOutput = sequelize.define('ScriptOutput', {
    scriptName:DataTypes.STRING,
    output: DataTypes.STRING,
    isSuccess:DataTypes.BOOLEAN
  },{
    timestamps: false,
    classMethods: {
      associate: function (models) {
        ScriptOutput.belongsTo(models.Build);
        ScriptOutput.hasMany(models.TestSuite);
      }
    }
  });
  return ScriptOutput;
};
