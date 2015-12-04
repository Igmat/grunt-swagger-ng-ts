﻿/// <reference path="../typings/tsd.d.ts" />

import swaggerTsCodegen = require('swagger-ts-codegen');
import fs = require('fs');


interface MyOptions {
    SourceRoot: string; 
}
export = (grunt: IGrunt) => {
    'use strict';
    
    grunt.registerTask('swagger-ts', 'task description', function () {
        // Options that the user can use
        var options = this.options({
            pathSwagger: "swagger.json",
            pathToRef: "app.ts",
            pathToGenRefs:  "generated.ts",
            dest: 'app',
            mainModule: 'App',
            disabletslint: true
        });
        var changeCase = require('change-case');
        // use swagger - ts - codegen
        var swagger: Swagger.Spec = grunt.file.readJSON(options.pathSwagger);
        var generator = new swaggerTsCodegen.Generators.Services.ServiceGenerator();
        var renderer = new swaggerTsCodegen.Renderers.Component.ComponentRenderer(
            swaggerTsCodegen.enumTemplate,
            swaggerTsCodegen.modelTemplate,
            swaggerTsCodegen.serviceTemplate);
        var components = generator.GenerateComponents(swagger);
        var rendered = renderer.RenderComponents(components);


        var staticReference = "/// <reference path=\"../" + options.pathToRef + "\" />" + "\n";
        var allReference = '';
        var arrayRef = [];
        var disabletslint = options.disabletslint ? " /* tslint:disable */ \n" : "";
        // main folder for all files 
        grunt.file.mkdir(options.dest);

        for (var i = 0; i < rendered.length; i++) {
            var nameFolder = rendered[i].name;
            nameFolder = nameFolder.toLowerCase();

            grunt.file.mkdir(options.dest + '/' + nameFolder);
            var nameService: string = changeCase.paramCase(rendered[i].service.name) + '.service.ts';

            var referenceService = "/// <reference path=" + "\"" + nameFolder + "/" + nameService + "\" />" + "\n";
            var makeModule = "module " + options.mainModule + "." + rendered[i].name + " {" + "\n";
            var angularDescription = "angular.module('" + options.mainModule + "').service('" + rendered[i].service.name + "Service" + "', " + rendered[i].service.name + "Service" + ");" + "\n" + "}"
            var serviceContent = staticReference + disabletslint +  makeModule + rendered[i].service.content + "\n" + angularDescription;
           
            allReference += referenceService;
            for (var j = 0; j < rendered[i].models.length; j++){
                var nameModel: string = changeCase.paramCase(rendered[i].models[j].name);
                let lastPart = nameModel.slice(nameModel.lastIndexOf('-') + 1);
                // slice model name files 
                switch (lastPart) {
                    case 'model':
                        nameModel = nameModel.slice(0, nameModel.lastIndexOf('-')) + '.model.ts';
                        break;
                    case 'result':
                        nameModel = nameModel.slice(0, nameModel.lastIndexOf('-')) + '.result.ts';
                        break;
                    default:
                        nameModel += '.ts';
                }

                var modelContent = staticReference + disabletslint + makeModule + rendered[i].models[j].content + "\n" + "}";
                var referenceModel = "/// <reference path=" + "\"" + nameFolder + "/" + nameModel + "\" />" + "\n";
                // write model file
                fs.writeFileSync(options.dest + '/' + nameFolder + '/' + nameModel, modelContent, 'UTF-8')
                 allReference += referenceModel;
            }
            for (var p = 0; p < rendered[i].enums.length; p++) {
                var nameEnum: string = changeCase.paramCase(rendered[i].enums[p].name);
                let lastPart = nameEnum.slice(nameEnum.lastIndexOf('-') + 1);
                switch (lastPart) {
                    // slice enum name files 
                    case 'enum':
                        nameEnum = nameEnum.slice(0, nameEnum.lastIndexOf('-')) + '.enum.ts';
                        break;
                    default:
                        nameEnum += '.ts';
                }

                var enumContent = staticReference + disabletslint + makeModule + rendered[i].enums[p].content + "\n" + "}";
                var referenceEnum = "/// <reference path=" + "\"" + nameFolder + "/" + nameEnum + "\" />" + "\n";
                // write enum  file
                fs.writeFileSync(options.dest + '/' + nameFolder + '/' + nameEnum, enumContent, 'UTF-8')
                allReference += referenceEnum;
            }
            fs.writeFileSync(options.dest + '/' + nameFolder + '/' + nameService, serviceContent, 'UTF-8')
        }
        // write file reference 
        fs.writeFileSync(options.dest + '/' + options.pathToGenRefs, allReference, 'UTF-8');
        grunt.log.ok;
    });
}