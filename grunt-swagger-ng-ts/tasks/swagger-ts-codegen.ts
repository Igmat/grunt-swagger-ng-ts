module.exports = function (grunt) {
    'use strict';
    var fs = require('fs');

    grunt.registerMultiTask('smkdir', 'Log stuff.', function () {
        var options;
        options = this.options({
            mode: null,
            create: [],
            content: null,
            swagger: null,
            fileName: null
        });
      
        return options.create.forEach(function (filepath, fileName, content) {
            grunt.log.write('Creating "' + filepath + '"...');
                fileName = options.fileName;
                filepath = grunt.template.process(filepath);
                grunt.file.mkdir(filepath, options.mode);
                fs.writeFileSync(filepath + '/' + fileName, content, 'UTF-8');
               // grunt.file.write(fileName, options.content);
                return grunt.log.ok();        
        });
    });
};

