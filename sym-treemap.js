(function (PV) {
    'use strict';

    // Create visualization object
    function symbolVis() { }
    PV.deriveVisualizationFromBase(symbolVis);

    // Symbol initialization
    symbolVis.prototype.init = function (scope, element) {
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = configChanged;
        this.onResize = resize;

        function dataUpdate(data) {

            // Set PI web API address
            var apiUrl = "https://pisrv01.pischool.int/piwebapi";

            // Get path from first data source
            var dataPath = this.scope.symbol.DataSources[0].substr(3, 9999);
            dataPath = dataPath.replace(/\\|\\/g,"\\\\");

            // Remove attribute from element path
            var attributePipeLocation = dataPath.indexOf("|");
            if (attributePipeLocation > -1) {
                dataPath = dataPath.substr(0, attributePipeLocation)
            }

            // Update treemap
            eventsModule.Update(apiUrl, dataPath)

        }

        function configChanged(newConfig, oldConfig) {
            // ...
        }

        function resize(width, height) {
            // ...
        }

    };

    // Create symbol definition object
    var def = {
        typeName: 'treemap',
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
        visObjectType: symbolVis,
        getDefaultConfig: function () {
            return {
                DataShape: 'Value',
                Height: 300,
                Width: 600
            };
        }
    };
    PV.symbolCatalog.register(def);
    
})(window.PIVisualization);
