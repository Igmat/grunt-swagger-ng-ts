module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        'swagger-ts': {
            options: {
                pathSwagger: 'swagger/swagger.json',
                dest: 'ssss',
                mainModule: 'profebook',
                pathToRef: false,
                pathToGenRefs: 'gen.ts'
                }
        }
    });
    
    // Load local tasks.
    grunt.loadTasks('tasks');
    grunt.registerTask('TsCodegen', ['swagger-ts']);
};