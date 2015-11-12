module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        smkdir: {
            noop: {},
            simple: {
                options: {
                    create: ['tmp'],
                    swagger: 'swagger/swagger.json',
                    content: 'Volodymyr Yeryhin',
                    fileName: 'single.html'
                }
            }
        }
    });
    
    // Load local tasks.
    grunt.loadTasks('tasks');
    grunt.registerTask('TsCodegen', ['smkdir']);
};