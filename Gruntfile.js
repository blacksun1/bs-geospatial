(function () {
  "use strict";

  module.exports = function (grunt) {
    grunt.initConfig({
      ts: {
        default : {
          src: ["**/*.ts", "!node_modules/**/*.ts"],
          outDir: "dist",
          target: "es5"
        }
      },
      geojsonhint: {
        files: [
          '*.geojson'
        ]
      }
    });
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-geojsonhint");
    grunt.registerTask("default", ["ts", "geojsonhint"]);
  };
}());