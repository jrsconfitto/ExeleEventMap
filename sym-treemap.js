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
        
        scope.obtainTemplates = function(){
            return eventsModule.GetEFTemplates()}

        function dataUpdate(data) {

            // Set PI web API address
            var apiUrl = "https://pisrv01.pischool.int/piwebapi";

            // Get path from first data source
            var dataPath = this.scope.symbol.DataSources[0].substr(3, 9999);

            // Remove attribute from element path
            var attributePipeLocation = dataPath.indexOf("|");
            if (attributePipeLocation > -1) {
                dataPath = dataPath.substr(0, attributePipeLocation)
            }

            // Update treemap, providing URL, elementPath, start and end times
            eventsModule.Update(apiUrl, dataPath, this.elem, timeProvider.displayTime.start, timeProvider.displayTime.end)

        }
        // sample event from trend 
        timeProvider.onDisplayTimeChanged.subscribe();

        function configChanged(newConfig, oldConfig) {
            // ...
           newConfig.TemplateSelect;
        }

        function resize(width, height) {
            // ...
        }

    };


    // This function returns selection of Event Frame templates available
    // This can be used to populate a selection menu to drill down
    function templates(){
        return eventsModule.GetEFTemplates();
    }
    // this populates the attributes givena template is selected
    function attributes(){
       //     return ["attribute1", "attribute2"];
        return eventsModule.GetEFAttributesFromTemplate(TemplateSelected);
    }

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
                Height: 300,
                Width: 600, 
                TemplateSelected: "none" ,
                AttributeSelected: "none" ,
                Test: ''                        
            };
        },
        configTitle: 'Format Symbol',
        Templates: templates,
        Attributes: attributes,
        
    };
    PV.symbolCatalog.register(def);
    
})(window.PIVisualization);
