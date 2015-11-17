/// <reference path="../typings/tsd.d.ts" />

 import swaggerTsCodegen = require('swagger-ts-codegen');

interface MyOptions {
    SourceRoot: string; 
}
export = (grunt: IGrunt) => {
    'use strict';
    var fs = require('fs');
    grunt.registerTask('swagger-ts', 'task description', function () {
        var options = this.options({
            pathSwagger: "swagger.json",
            dest: 'gen'
        });
        
        var swagger: Swagger.Spec = grunt.file.readJSON(options.pathSwagger);
        //var serviceGenerator = codeGen.Generators.Services.ServiceGenerator();
        //var components = codeGen.serviceGenerator.GenerateComponents(swagger);
        var generator = new swaggerTsCodegen.Generators.Services.ServiceGenerator();
        var renderer = new swaggerTsCodegen.Renderers.Component.ComponentRenderer(
            swaggerTsCodegen.enumTemplate,
            swaggerTsCodegen.modelTemplate,
            swaggerTsCodegen.serviceTemplate);
        var components = generator.GenerateComponents(swagger);
        var rendered = renderer.RenderComponents(components);

        for (var i = 0; i < rendered.length; i++) {
            var nameFolder = rendered[i].name;
            grunt.file.mkdir(nameFolder);
            for (var j = 0; j < rendered[i].models.length; j++){
                var nameModel = rendered[i].models[j].name;
                fs.writeFileSync(nameFolder + '/' + nameModel + '.ts', rendered[i].models[j].content, 'UTF-8')
            }
            for (var p = 0; p < rendered[i].enums.length; p++) {
                var nameEnum = rendered[i].enums[p].name;
                fs.writeFileSync(nameFolder + '/' + nameEnum + '.ts', rendered[i].enums[p].content, 'UTF-8')
            }
            fs.writeFileSync(nameFolder + '/' + rendered[i].service.name + '.ts', rendered[i].service.content, 'UTF-8')
        }
        var obj = fs.readFileSync(options.pathSwagger, 'utf8');

        var fname = "ssss.ts"
        grunt.file.mkdir(options.dest);
        fs.writeFileSync(options.dest + '/' + fname, rendered[0].service.content, 'UTF-8');

        grunt.log.ok;
    });
}