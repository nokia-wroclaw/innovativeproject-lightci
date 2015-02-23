AGRIPPA CI
==========
Agrippa is a lightweight continuous integration tool with web interface. It was developed in 2014 under the Innovative Projects program, realising the theme - Lightweight & energy saving continuous integration tool.

![Logo](https://raw.githubusercontent.com/nokia-wroclaw/innovativeproject-lightci/master/client/assets/images/logo.png)

---

##Installation

###Requirements
* *git* ([installation](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git))
* *svn* ([installation](https://subversion.apache.org/packages.html))
* *node.js* ([installation](https://github.com/joyent/node/wiki/installing-node.js-via-package-manager))

###Setup
(we're assuming you're using Linux)

```sh
$ git clone https://github.com/nokia-wroclaw/innovativeproject-lightci.git your-directory
$ cd your-directory
$ npm install
```

####Run the project
If you have installed everything succesfully, you can run Agrippa CI. Go to server catalog and run command: 
```sh
$ npm start
```
in Agrippa directory. You should see server output in your console, and the frontend client GUI should open in your web browser. Server will run on _your-ip_:9000

---

## General info

###Version
1.0.0

###Why Agrippa?
The main assumption to this project was to be lightweight. Agrippa uses node.js for backend, which doesn't consume much memory. It needs about 60 MB of RAM to start, which is very little comparing to e.g. Jenkins - written in heavy Java.
Also, check the awesome features below.

###Features
* __authorization__ system
* simple __dashboard__ with information about each project, including:
 * __status__ of the last build - an icon signalising whether the last build was successful/failed or is currrently pending/queued
 * __trend__ of the last five builds - emoticon describing what's been happening to the project over the last five builds
 * __progress__ of ongoing builds - progress bars measuring estimated build time
 * build __queue__ - you can see which projects will build after currently pending ones
* __project history__ with every build's date and status, and a chart presenting successes/failures over time
* __build page__, with information including: 
 * every __script's result__: test results with charts, bash console output (available in real-time while project is building)
 * __artifacts__ to download
 * __deployment__ status
 * __commits__ associated with this build
* project __configuration__, including attributes such as:
 * __repository__ configuration - SVN and GIT repositories are supported so far
 * __periodical update__ - you can set Crone pattern and apllication will periodically check if there were any changes on your repository
 * __update strategy__ - you can set whether you want the repository to be updated, or cleared and checked out every time there are new contributions
 * project __dependencies__ - you can set the project to be dependent on other projects, so when those projects build successfuly, the dependent project will build as well
 * user __notification__ - you can set a notification strategy - e-mails will be sent in case of build failure to: no users/all users/users assigned to this project/users, whose repository accounts were in one of the commits assigned to the failed build
 * build __scripts__ - you can define as many scripts as you want. You can also set a JUnit parser to parse the output file of your tests from given file path
 * __deployment__ - you can set server credentials, path to the files you want to send to the server and a bash script to run on remote server side
 * __artifacts__ - you can define paths to the files you want to download later. They will be copied to the special catalog so they won't be overwritten by future builds
* __global settings__, including:
 * specyfying a maximum number of projects building at the same time. If you try to build more projects, they will be added to the build __queue__
 * __e-mail settings__ - e-mail credentials needed for the notification system
 * __configuration backups__ - you can restore projects' configuration file from any point in time
* __account settings__, where you can change your e-mail, password and associate your account with usernames on repositories

###Technologies
Agrippa CI uses many cool open source projects:

* [AngularJS](http://angularjs.org)
* [node.js](http://nodejs.org)
* [Express](http://expressjs.com)
* [SQLite](http://www.sqlite.org/)
* [Bootstrap](http://getbootstrap.com/)

###Check also
* [nokia wroclaw github](https://github.com/nokia-wroclaw) - check the other groups' projects from _Innovative Projects_ program
* [what's agrippa?](http://en.wikipedia.org/wiki/Heinrich_Cornelius_Agrippa) - a little bit of history, also [this dude](http://en.wikipedia.org/wiki/Marcus_Vipsanius_Agrippa)