(function () {
  module.exports = function (grunt) {
    grunt.initConfig({
      ts: {
        default : {
          src: ["**/*.ts", "!node_modules/**/*.ts"],
          outDir: "dist",
          target: "es5"
        }
      }
    });
    grunt.loadNpmTasks("grunt-ts");
    grunt.registerTask("default", ["ts"]);
  };
}());