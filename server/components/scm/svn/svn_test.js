/**
 * Created by michal on 10.11.14.
 */
SVN = require("./svn.js");

/*SVN.checkout("https://subversion.assembla.com/svn/mp-svntest/","svn_test_01", "", "", function(err, info) {
 console.log(info);
 });*/

SVN.update("https://subversion.assembla.com/svn/mp-svntest/", "svn_test_01", "", "", function (err, info) {
  if (info)
    console.log(info);
  else
    console.log(err);
});

