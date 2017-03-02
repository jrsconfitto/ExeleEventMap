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
        
        // method use to get the current EF
        runtimeData.obtainTemplates = function () {
            var efTemplates = eventsModule.GetEFTemplates()
            efTemplates.unshift('None');
            return efTemplates;
        };

        // method used to get the current attributes from the template
        runtimeData.obtainAttributes = function () {
            var efAttributes= eventsModule.GetEFAttributesFromTemplate(mytemplate);          
               // return like this so angular does not loop forever
                return ['None'].concat(efAttributes);                    
        };

        function dataUpdate(data) {

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
            eventsModule.Update(apiUrl, dataPath, this.elem, timeProvider.displayTime.start, timeProvider.displayTime.end,
                this.scope.config.TemplateSelected, this.scope.config.AttributeSelected, this.scope.config.ColorAttributeSelected);

        }
        // sample event from trend 
        timeProvider.onDisplayTimeChanged.subscribe();

        function configChanged(newConfig, oldConfig) {
            // set the template if the config changes
            if (oldConfig.TemplateSelected != newConfig.TemplateSelected) {
                mytemplate = newConfig.TemplateSelected;
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
                AttributeSelected: "None",
                ColorAttributeSelected: "None",
                Test: ''
            };
        },
        configTitle: 'Format Symbol'
        //Templates: templates,
        //Attributes: attributes,

    };
    PV.symbolCatalog.register(def);

})(window.PIVisualization);
