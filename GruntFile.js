module.exports = function (grunt) {

   'use strict';

   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      clean: [
         'dist/<%= pkg.version %>'
      ],

      less: {
         dist: {
            options: {
               paths: ['src/web/css', 'src/web/img']
            },
            files: {
               'dist/<%= pkg.version %>/css/style.css': 'src/web/css/style.less'
            }
         }
      },

      mkdir: {
         dist: {
            options: {
               mode: 0o755,
               create: [
                  'dist/<%= pkg.version %>/css',
                  'dist/<%= pkg.version %>/js'
               ]
            }
         }
      },

      release: {
         options: {
            file: 'package.json',
            tagName: '<%= version %>', //default: '<%= version %>'
            commitMessage: 'Release <%= version %>', //default: 'release <%= version %>'
            tagMessage: 'Tag version <%= version %>' //default: 'Version <%= version %>'
         }
      },

      requirejs: {
         dist: {
            options: {
               baseUrl: "src/web/js",
               mainConfigFile: "src/web/js/require.config.js",
               name: "../../../node_modules/almond/almond",
               // assumes a production build using almond, if you don't use almond, you
               // need to set the "includes" or "modules" option instead of name

               exclude: [],
               include: [
                  "<%= pkg.app.main %>"
               ],
               insertRequire: [
                  "<%= pkg.app.main %>"
               ],

               optimize: 'none',
               out: "dist/<%= pkg.version %>/js/<%= pkg.name %>.js",

               wrap: {
                  start: `
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module 
        //in another project. That other project will only 
        //see this AMD call, not the internal modules in 
        //the closure below. 
        define([], factory);
    } else {
        //Browser globals case. Just assign the 
        //result to a property on the global. 
        root.<%= pkg.app.name %> = factory();
    }
}(this, function () {

`,
                  end: `

    return require('<%= pkg.app.main %>');
}));

`
               }
            }
         }
      },

      uglify: {
         dist: {
            options: {
               mangle: false,
               sourceMap: 'dist/<%= pkg.version %>/js/<%= pkg.name %>.map',
               sourceMappingURL: '/<%= pkg.version %>/js/<%= pkg.name %>.map'
            },
            files: {
               'dist/<%= pkg.version %>/js/<%= pkg.name %>.min.js': 'dist/<%= pkg.version %>/js/<%= pkg.name %>.js'
            }
         }
      }

   });

   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-less');
   grunt.loadNpmTasks('grunt-contrib-requirejs');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-mkdir');
   grunt.loadNpmTasks('grunt-release-steps');

   'minor major patch'.split(' ').forEach(revision => {
      grunt.registerTask(
         `deploy${revision}`,
         [
            `release:bump:add:commit:${revision}`,
            'release:push:tag:pushTags'
         ]
      );
   });

   grunt.registerTask('deploy', 'Alias for deploy-minor', ['deploy-minor']);

   grunt.registerTask('install', [
      'mkdir:dist',
      'less:dist',
      'requirejs:dist',
      'uglify:dist'
   ]);


};
