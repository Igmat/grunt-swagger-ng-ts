module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        'swagger-ts': {
            options: {
                    pathSwagger: 'swagger/swagger.json'
                }
        }
    });
    
    // Load local tasks.
    grunt.loadTasks('tasks');
    grunt.registerTask('TsCodegen', ['swagger-ts']);
};