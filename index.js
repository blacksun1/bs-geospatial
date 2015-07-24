'use strict';
var Q = require('q');
var colors = require('colors');
var util = require('util');
var geojsonhint = require('geojsonhint');

var readFilePromise = function (filename) {
  return Q.Promise(function (resolve, reject, notify) {
    var fs = require('fs');

    console.log(colors.cyan(`Reading from file ${filename}`));
    fs.readFile(filename, {'flag': 'r'}, function (err, data) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
};


var holborn;
var home;

readFilePromise('./holborn.geojson')
  .then(function (data) {
    holborn = JSON.parse(data);
    let errors = geojsonhint.hint(holborn);

    if (errors && errors.length) {
      console.error(errors);
    } else {
      console.info('Holborn object linted.');
    }
  })

  .then(function() { return readFilePromise('./e9-7ea.geojson'); })
  .then(function (data) {
    home = JSON.parse(data);
    let errors = geojsonhint.hint(home);

    if (errors && errors.length) {
      console.error(errors);
    } else {
      console.info('Home object linted.');
    }
  })

  .then(function () {
    // console.log(JSON.stringify(holborn, null, 2));
    // console.log(JSON.stringify(home, null, 2));
  })

  .catch(function (err) {
    console.error(colors.red("Unexpected error"));
    console.error(colors.red(err));
  })

  .done();
