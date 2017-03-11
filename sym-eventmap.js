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

        var exeleTree = new EventMap();

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

        // sample event from trend
        timeProvider.onDisplayTimeChanged.subscribe();
        
        treemapUpdate(scope, element);
        
        function dataUpdate(data) {
            treemapUpdate(this.scope, this.elem);
        }

        function configChanged(newConfig, oldConfig) {

            treemapUpdate(this.scope, this.elem);

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

        function treemapUpdate(symbolScope, symbolElement) {

            // Set PI web API address
            var apiUrl = "https://pisrv01.pischool.int/piwebapi";

            // Get path from first data source
            var dataPath = symbolScope.symbol.DataSources[0].substr(3);

            // Remove attribute from element path
            var attributePipeLocation = dataPath.indexOf("|");
            if (attributePipeLocation > -1) {
                dataPath = dataPath.substr(0, attributePipeLocation)
            }
            
            // Update eventmap, providing URL, elementPath, start and end times
            exeleTree.Update(apiUrl, dataPath, symbolElement, timeProvider.displayTime.start, timeProvider.displayTime.end,
                symbolScope.config.TemplateSelected, symbolScope.config.AttributeSelected, symbolScope.config.ColorAttributeSelected);

        }

    };


    // Create symbol definition object
    var def = {
        typeName: 'EventMap',
        inject: ['timeProvider'],
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
		iconUrl: 'Scripts/app/editor/symbols/ext/icons/eventmap.svg',
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
        configTitle: 'Format Event Map'
    };
    
    PV.symbolCatalog.register(def);

})(window.PIVisualization);
