module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        git: {
            options: {
                message: "Build release <%= pkg.version %>"
            },
            commit: {
                files: [
                    { src: [ 'src/web/release/*.js' ] }
                ]
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

        less: {
            development: {
                options: {
                    paths: ['src/web/css', 'src/web/img']
                },
                files: {
                    'dist/<%= pkg.version %>/css/style.css': 'src/web/css/style.less'
                }
            },
            production: {

            }
        },

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/web/',
                        src: ['img/**', 'js/**', '*'],
                        dest: 'dist/<%= pkg.version %>/'
                    }
                ]
            }
        },

        clean: ['dist']
    });

    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.loadNpmTasks('grunt-release-steps');

    grunt.loadNpmTasks('grunt-git');

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('install', ['clean', 'copy', 'less']);

    grunt.registerTask('deploy', ['release:bump:add:commit:push:tag:pushTags:minor']);

};
