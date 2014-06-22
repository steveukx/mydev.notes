module.exports = function (grunt) {

    'use strict';

    grunt.registerTask('dist', 'dist content helper', function () {
        var done = this.async();
        var target = this.args[0];
        var Git = require('simple-git');
        var files = 'dist/*';

        switch (target) {
            case "purge":
                var git = new Git()
                    .rm(files, function (err) {
                        if (!err) {
                            grunt.log.writeln('No error adding dist files to be removed');
                            git.commit('Remove existing built content', files, function (err) {
                                grunt.log.writeln('Committed removing dist files');
                                if (err) {
                                    grunt.log.warn(err);
                                }
                                done(!err);
                            });
                        }
                        else if (/did not match/.test(err)) {
                            grunt.log.ok('No dist files to remove');
                            done(true);
                        }
                        else {
                            grunt.log.writeln('Got errors removing dist files');
                            grunt.fail.fatal(err);
                        }
                    });
                break;

            case "persist":
                new Git()
                    .add(files)
                    .commit('Adding built content', files, function (err) {
                        if (err) {
                            grunt.log.warn(err);
                        }

                        done(!err);
                    });
                break;

            default:
                grunt.fail.fatal("Unknown target: " + this.name + ":" + target);
        }
    });

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

    // removes any existing dist already added to git
    grunt.registerTask('clear', ['dist:purge', 'clean']);

    // bumps up the version builds the distribution content and commits it
    grunt.registerTask('create', ['release:bump:add:commit', 'install', 'dist:persist']);

    // tags the project on the new version and pushes everything to remote
    grunt.registerTask('deploy', ['clear', 'create', 'release:push:tag:pushTags:minor']);

};
