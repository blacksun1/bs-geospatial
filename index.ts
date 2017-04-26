/// <reference path="./typings/node/node.d.ts" />

const Q = require('q');
const colors = require('colors');
const util = require('util');
const geojsonhint = require('geojsonhint');
let geoJsonFiles;


/**
 * Returns true if the string str ends with the suffix.
 * @param  {string} str    - The string to test for the string.
 * @param  {string} suffix - The suffix of the string to test for.
 * @return {bool}          - true if the string ends in the suffix. False if it doesn't.
 */
function endsWith(str: string, suffix: string) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * Filter an array of file names with all files with an extension of .geojson.
 * @param {string[]} files - The array of files to filter
 * @return {string[]}      - A filtered array of files.
 */
function filterAllGeojsonFiles(files: string[]) {
  if (!files || files.length === 0) {
    return null
  }

  return files.filter(function (folder) { return endsWith(folder, '.geojson'); });
}

/**
 * A generic catch function to be used in a promise chain. Just outputs an error message.
 * @param  {Any} err - The object that was rejected as part of the chain.
 * @return {void}
 */
function genericErrorCatcher(err) {
  if (err.name && err.message) {
    console.error(colors.red(`An exception has occured: ${err.name}, ${err.message}`));
    return;
  }

  console.error(colors.red(err.message));
}

/**
 * A promise to eventually read and GeoJSON hint a file.
 * @param {string} fileName - The path of the file to be checked.
 * @return {Promise}
 */
function hintGeoJsonFile(fileName: string) {
  return Q.Promise(function(resolve, reject, notify) {
    return readFilePromise(fileName, "UTF-8")
      .then(function(content) {
        let fileContent = content;
        let contentObject;
        let parseErrors;

        try {
          contentObject = JSON.parse(content)
        }
        catch (e) {
          const err = new Error(`File ${fileName} could not be parsed as valid JSON.`);
          err.name = 'App.InvalidJson'

          return reject(err);
        }

        try {
          parseErrors = geojsonhint.hint(contentObject);
        }
        catch (e) {
          const err = new Error(`App.InvalidGeoJson: File ${fileName} could not be hinted with Geo JSON.`);
          err.name = 'App.InvalidGeoJson';

          return reject(err);
        }

        if (parseErrors.length > 0) {
          const err = new Error();
          err.name = "App.InvalidGeoJson";
          err.message = `File ${fileName} is invalid Geo JSON.`;

          return reject(err);
        }

        console.log(colors.green(`✓ ${fileName}`));
        return resolve();
      })
  });
}

/**
 * Returns a promise that eventually returns the contents of a file.
 * @param  {string} filename        - The name of the file to read.
 * @param  {string} [encoding=null] - The encoding to use when reading the file. Default is null.
 * @return {raw buffer}             - The contents of the file.
 */
function readFilePromise(filename: string, encoding: string) {
  return Q.Promise(function(resolve: Function, reject: Function, notify: Function) {
    var fs = require('fs');

    // console.log(colors.cyan(`Reading from file ${filename}`));
    fs.readFile(filename, { flag: 'r', encoding: encoding === undefined ? null : encoding }, function(err, data) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}

/**
 * Returns an array of strings containing the file names of the files at the path.
 * @param  {string} path - The folder path.
 * @return {string[]}    - An arry of strings containing the names of the files at the folder specified in path.
 */
function readDirPromise(path: string) {
  return Q.Promise(function(resolve, reject, notify) {
    var fs = require('fs');

    // console.log(colors.cyan(`Reading directory structure from folder ${path}`));
    fs.readdir(path, function(err, data) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}

readDirPromise(process.cwd())
  .then(filterAllGeojsonFiles)

  // Take the list of all files and add it to our page level variable.
  .then((files) => {
    geoJsonFiles = files;
    return files;
  })

  .then((files) => {
    return Q.all(files.map(function(file) {
      return hintGeoJsonFile(file);
    }));
  })

  .then(() => {
    console.log("All files have passed. Congratulations.")
  })

  .catch(genericErrorCatcher)
  .done();
