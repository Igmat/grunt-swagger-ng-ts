/// <reference path="../typings/tsd.d.ts" />

import swaggerTsCodegen = require('swagger-ts-codegen');
import fs = require('fs');

export = (grunt: IGrunt) => {
    'use strict';
    
    grunt.registerTask('swagger-ts', 'task description', function () {
        // Options that the user can use
        var options = this.options({
            pathSwagger: "swagger.json",
            pathToRef: "app.ts",
            pathToGenRefs: "generatedServices.ts",
            pathToMockRefs: "generatedMocks.ts",
            pathToLibHelper: "mockHelper.ts",
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
            swaggerTsCodegen.serviceTemplate,
            swaggerTsCodegen.mockTemplates,
            swaggerTsCodegen.mockHelpersTemplate);
        var components = generator.GenerateComponents(swagger);
        var rendered = renderer.RenderComponents(components);


        var staticReference = "/// <reference path=\"../" + options.pathToRef + "\" />" + "\r\n";
        var servicesReference = '';
        var mocksReference = '';
        mocksReference += "/// <reference path=" + "\"" + options.pathToLibHelper + "\" />" + "\r\n" + "\r\n";
        var arrayRef = [];
        var disabletslint = options.disabletslint ? " /* tslint:disable */ \r\n" : "";
        // main folder for all files 
        grunt.file.mkdir(options.dest);

        for (var i = 0; i < rendered.Components.length; i++) {
            var component = rendered.Components[i];
            var nameFolder = component.name;
            nameFolder = nameFolder.toLowerCase();

            grunt.file.mkdir(options.dest + '/' + nameFolder);
            grunt.file.mkdir(options.dest + '/' + nameFolder + '/models');
            grunt.file.mkdir(options.dest + '/' + nameFolder + '/mocks');
            var nameService: string = changeCase.paramCase(component.service.name) + '.service.ts';

            var referenceService = "/// <reference path=" + "\"" + nameFolder + "/" + nameService + "\" />" + "\r\n";
            var makeModule = "module " + options.mainModule + "." + component.name + " {" + "\r\n";
            var angularDescription = "angular.module('" + options.mainModule + "').service('" + component.service.name + "Service" + "', " + component.service.name + "Service" + ");" + "\r\n" + "}"
            var serviceContent = staticReference + disabletslint + makeModule + component.service.content + "\r\n" + angularDescription;

            servicesReference += "/* " + component.name + " Service */" + "\r\n";
            servicesReference += referenceService;

            var nameMock: string = changeCase.paramCase(component.name) + '.mock.ts';

            var referenceMock = "/// <reference path=" + "\"" + nameFolder + "/mocks/" + nameMock + "\" />" + "\r\n";
            var makeModuleMocks = "module " + options.mainModule + "." + component.name + ".Mocks {" + "\r\n";
            var angularMockDescription = "angular.module('" + options.mainModule + "').run(" + component.name + "Requests);" + "\r\n" + "}"
            var mockContent = staticReference + disabletslint + makeModuleMocks + component.mocks.content + "\r\n" + angularMockDescription;

            mocksReference += "/* " + component.name + " Service */" + "\r\n";
            mocksReference += referenceMock;

            var nameMockOverride: string = changeCase.paramCase(component.name) + '.override.mock.ts';

            var referenceMockOverride = "/// <reference path=" + "\"" + nameFolder + "/mocks/" + nameMockOverride + "\" />" + "\r\n";
            var mockOverrideContent = staticReference + disabletslint + makeModuleMocks + component.mocks.contentOverride + "\r\n" + "}";

            mocksReference += referenceMockOverride;

            var nameChance: string = changeCase.paramCase(component.name) + '.chance.ts';

            var referenceChance = "/// <reference path=" + "\"" + nameFolder + "/mocks/" + nameChance + "\" />" + "\r\n";
            var chanceContent = staticReference + disabletslint + makeModuleMocks + component.mocks.chanceHelper + "\r\n" + "}";

            mocksReference += referenceChance;

            var nameChanceOverride: string = changeCase.paramCase(component.name) + '.override.chance.ts';

            var referenceChanceOverride = "/// <reference path=" + "\"" + nameFolder + "/mocks/" + nameChanceOverride + "\" />" + "\r\n";
            var chanceOverrideContent = staticReference + disabletslint + makeModuleMocks + component.mocks.chanceOverride + "\r\n" + "}";

            mocksReference += referenceChanceOverride;
            for (var j = 0; j < component.models.length; j++){
                var nameModel: string = changeCase.paramCase(component.models[j].name);
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

                var modelContent = staticReference + disabletslint + makeModule + component.models[j].content + "\r\n" + "}";
                var referenceModel = "/// <reference path=" + "\"" + nameFolder + "/models/" + nameModel + "\" />" + "\r\n";
                // write model file
                fs.writeFileSync(options.dest + '/' + nameFolder + '/models/' + nameModel, modelContent, 'UTF-8')
                 servicesReference += referenceModel;
            }
            for (var p = 0; p < component.enums.length; p++) {
                var nameEnum: string = changeCase.paramCase(component.enums[p].name);
                let lastPart = nameEnum.slice(nameEnum.lastIndexOf('-') + 1);
                switch (lastPart) {
                    // slice enum name files 
                    case 'enum':
                        nameEnum = nameEnum.slice(0, nameEnum.lastIndexOf('-')) + '.enum.ts';
                        break;
                    default:
                        nameEnum += '.ts';
                }

                var enumContent = staticReference + disabletslint + makeModule + component.enums[p].content + "\r\n" + "}";
                var referenceEnum = "/// <reference path=" + "\"" + nameFolder + "/models/" + nameEnum + "\" />" + "\r\n";
                // write enum  file
                fs.writeFileSync(options.dest + '/' + nameFolder + '/models/' + nameEnum, enumContent, 'UTF-8')
                servicesReference += referenceEnum;
            }
            fs.writeFileSync(options.dest + '/' + nameFolder + '/' + nameService, serviceContent, 'UTF-8');

            fs.writeFileSync(options.dest + '/' + nameFolder + '/mocks/' + nameMock, mockContent, 'UTF-8');
            if (!fs.existsSync(options.dest + '/' + nameFolder + '/mocks/' + nameMockOverride)) {
                fs.writeFileSync(options.dest + '/' + nameFolder + '/mocks/' + nameMockOverride, mockOverrideContent, 'UTF-8');
            }
            fs.writeFileSync(options.dest + '/' + nameFolder + '/mocks/' + nameChance, chanceContent, 'UTF-8');
            if (!fs.existsSync(options.dest + '/' + nameFolder + '/mocks/' + nameChanceOverride)) {
                fs.writeFileSync(options.dest + '/' + nameFolder + '/mocks/' + nameChanceOverride, chanceOverrideContent, 'UTF-8');
            }
            servicesReference += "\r\n";
            mocksReference += "\r\n";
        }
        // write file reference 
        fs.writeFileSync(options.dest + '/' + options.pathToGenRefs, servicesReference, 'UTF-8');
        fs.writeFileSync(options.dest + '/' + options.pathToMockRefs, mocksReference, 'UTF-8');
        fs.writeFileSync(options.dest + '/' + options.pathToLibHelper, rendered.MockHelpers, 'UTF-8');
        grunt.log.ok;
    });
}