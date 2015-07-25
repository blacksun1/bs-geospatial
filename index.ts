/// <reference path="./typings/node/node.d.ts" />

let Q = require('q');
let colors = require('colors');
let util = require('util');
let geojsonhint = require('geojsonhint');
let geoJsonFiles;

/**
 * Returns true if the string str ends with the suffix.
 * @param  {string} str    - The string to test for the string.
 * @param  {string} suffix - The suffix of the string to test for.
 * @return {bool}          - true if the string ends in the suffix. False if it doesn't.
 */
let endsWith = function (str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Returns a promise that eventually returns the contents of a file.
 * @param  {string} filename        - The name of the file to read.
 * @param  {string} [encoding=null] - The encoding to use when reading the file. Default is null.
 * @return {raw buffer}             - The contents of the file.
 */
let readFilePromise = function (filename, encoding) {
  return Q.Promise(function (resolve, reject, notify) {
    var fs = require('fs');

    // console.log(colors.cyan(`Reading from file ${filename}`));
    fs.readFile(filename, { flag: 'r', encoding: encoding === undefined ? null : encoding }, function (err, data) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
};

/**
 * Returns an array of strings containing the file names of the files at the path.
 * @param  {string} path - The folder path.
 * @return {string[]}    - An arry of strings containing the names of the files at the folder specified in path.
 */
let readdirPromise = function (path) {
  return Q.Promise(function (resolve, reject, notify) {
    var fs = require('fs');

    // console.log(colors.cyan(`Reading directory structure from folder ${path}`));
    fs.readdir(path, function (err, data) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
};

/**
 * Filter an array of file names with all files with an extension of .geojson.
 * @param {string[]} files - The array of files to filter
 * @return {string[]}      - A filtered array of files.
 */
let filterAllGeojsonFiles = function(files) {
  if (!files || files.length === 0) {
    return null
  }

  return files.filter(function (folder) { return endsWith(folder, '.geojson'); });
};

/**
 * A promise to eventually read and GeoJSON hint a file.
 * @param {string} file - The path of the file to be checked.
 * @return {Promise}
 */
let hintGeoJsonFile = function(file) {
  return Q.Promise(function(resolve, reject, notify) {
    let filePath = file;

    return readFilePromise(filePath, "UTF-8")
      .then(function(content) {
        let fileContent = content;
        let contentObject;
        let parseErrors;

        try {
          contentObject = JSON.parse(content)
        }
        catch (e) {
          let err = new Error(`App.InvalidJson: File ${filePath} could not be parsed as valid JSON.`);
          return reject(err);
        }

        try {
          parseErrors = geojsonhint.hint(contentObject);
        }
        catch (e) {
          let err = new Error(`App.InvalidGeoJson: File ${filePath} could not be hinted with Geo JSON.`);
          return reject(err);
        }

        if (parseErrors.length > 0) {
          let err = new Error();
          err.name = "App.InvalidGeoJson";
          err.message = `File ${filePath} is invalid Geo JSON.`;
          return reject(err);
        }

        console.log(colors.green(`✓ ${filePath}`));
        return resolve();
      })
  });
};

/**
 * A generic catch function to be used in a promise chain. Just outputs an error message.
 * @param  {object} err - The object that was rejected as part of the chain.
 * @return {void}
 */
let genericErrorCatcher = (err) => {
  if (err.message) {
    console.error(colors.red(err.message));
  }
};

readdirPromise(process.cwd())
  .then(filterAllGeojsonFiles)

  // Take the list of all files and add it to our page level variable.
  .then(function(files) {
    geoJsonFiles = files;
    return files;
  })

  .then(function(files) {
    return Q.all(files.map(function(file) {
      return hintGeoJsonFile(file);
    }));
  })

  .then(function() {
    console.log("All files have passed. Congratulations.")
  })

  .catch(genericErrorCatcher)
  .done();
