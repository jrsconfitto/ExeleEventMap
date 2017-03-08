(function (PV) {
    'use strict';

    // Create visualization object
    function symbolVis() { }
    PV.deriveVisualizationFromBase(symbolVis);

    // Symbol initialization
    symbolVis.prototype.init = function (scope, element, timeProvider) {
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = configChanged;
        this.onResize = resize;
        var mytemplate = "";
        // put runtimeData in scope
        var runtimeData = scope.runtimeData;

        var exeleTree = new Exele_TreeBuilder();

        // method use to get the current EF
        runtimeData.obtainTemplates = function() {
            var efTemplates = exeleTree.GetEFTemplates()
            return ['None'].concat(efTemplates);
        };

        // Initialize cached EF attributes
        var cachedAttributes = [{Name: 'None', Type: 'String'}].concat(exeleTree.GetEFAttributeNamesFromTemplate(mytemplate));
        // method used to get the current attributes from the template
        runtimeData.obtainAttributes = function() {
            // return like this so angular does not loop forever
            return cachedAttributes;
        };

        // Initialize cached sizeable attributes
        var cachedSizeableAttributes = [{Name: 'None', Type: 'String'}].concat(exeleTree.GetNumericalEFAttributeNamesFromTemplate(mytemplate));
        runtimeData.obtainSizeableAttributes = function() {
            return cachedSizeableAttributes;
        }

        function dataUpdate(data) {
            // ...
        }

        // sample event from trend
        timeProvider.onDisplayTimeChanged.subscribe();

        function configChanged(newConfig, oldConfig) {

            // Set PI web API address
            var apiUrl = "https://pisrv01.pischool.int/piwebapi";

            // Get path from first data source
            var dataPath = this.scope.symbol.DataSources[0].substr(3);

            // Remove attribute from element path
            var attributePipeLocation = dataPath.indexOf("|");
            if (attributePipeLocation > -1) {
                dataPath = dataPath.substr(0, attributePipeLocation)
            }
            // Update treemap, providing URL, elementPath, start and end times
            exeleTree.Update(apiUrl, dataPath, this.elem, timeProvider.displayTime.start, timeProvider.displayTime.end,
                this.scope.config.TemplateSelected, this.scope.config.AttributeSelected, this.scope.config.ColorAttributeSelected);


            // set the template if the config changes
            if (oldConfig.TemplateSelected != newConfig.TemplateSelected) {
                mytemplate = newConfig.TemplateSelected;

                // Adjust the attributes data to align with the new template selection
                //
                // Remove any attributes past the first ("None") and then add new ones
                cachedAttributes = cachedAttributes.slice(0, 1);
                cachedAttributes = cachedAttributes.concat(exeleTree.GetEFAttributeNamesFromTemplate(mytemplate));

                cachedSizeableAttributes = cachedSizeableAttributes.slice(0, 1);
                cachedSizeableAttributes = cachedSizeableAttributes.concat(exeleTree.GetNumericalEFAttributeNamesFromTemplate(mytemplate));
            }
        }

        function resize(width, height) {
            // ...
        }
    };


    // Create symbol definition object
    var def = {
        typeName: 'treemap',
        inject: ['timeProvider'],
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: 'Images/treemap.svg',
        visObjectType: symbolVis,
        getDefaultConfig: function () {
            return {
                DataShape: 'Value',
                Height: 500,
                Width: 600,
                TemplateSelected: "None",
                AttributeSelected: {Name: 'None', Type: 'String'},
                ColorAttributeSelected: {Name: 'None', Type: 'String'},
                Test: ''
            };
        },
        configTitle: 'Format Symbol'
        //Templates: templates,
        //Attributes: attributes,

    };
    PV.symbolCatalog.register(def);

})(window.PIVisualization);
