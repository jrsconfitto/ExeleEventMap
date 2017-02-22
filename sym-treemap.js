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
       // 'this.timeProvider = timeProvider;
      


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

            // Update treemap
            eventsModule.Update(apiUrl, dataPath, timeProvider.displayTime.start, timeProvider.displayTime.end)

        }

        timeProvider.onDisplayTimeChanged.subscribe();

        function configChanged(newConfig, oldConfig) {
            // ...
            var b = 1;
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
                Height: 300,
                Width: 600
            };
        }
    };
    PV.symbolCatalog.register(def);
    
})(window.PIVisualization);
