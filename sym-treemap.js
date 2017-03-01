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

        // Initialize the element path
        this.elementPath = getElementPath(this.scope.symbol.DataSources[0]);

        var mytemplate = "";
        // put runtimeData in scope
        var runtimeData = scope.runtimeData;

        // method use to get the current EF
        runtimeData.obtainTemplates = function () {
            return eventsModule.GetEFTemplates()
        };

        // method used to get the current attributes from the template
        runtimeData.obtainAttributes = function () {
            return eventsModule.GetEFAttributesFromTemplate(mytemplate);
        };

        function getElementPath(dataPath) {
            // Get path from first data source
            var pipeIndex = dataPath.substr(3).indexOf("|");
            var endIndex = (pipeIndex !== -1 ? pipeIndex : dataPath.length);
            return dataPath.substr(3, endIndex);
        }

        function dataUpdate(data) {

            // Set PI web API address
            var apiUrl = "https://pisrv01.pischool.int/piwebapi";

            // If `data` has a `Path` property, then the element path has changed on us.
            if (data && data.Path) {
                this.elementPath = getElementPath(this.scope.symbol.DataSources[0]);
            }

            // Update treemap, providing URL, elementPath, start and end times
            eventsModule.Update(apiUrl, this.elementPath, this.elem, timeProvider.displayTime.start, timeProvider.displayTime.end,
            this.scope.config.TemplateSelected, this.scope.config.AttributeSelected);

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
                Test: ''
            };
        },
        configTitle: 'Format Symbol'
        //Templates: templates,
        //Attributes: attributes,

    };
    PV.symbolCatalog.register(def);

})(window.PIVisualization);
