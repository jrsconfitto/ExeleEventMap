
var apiServer = "https://dan-af-dev/piwebapi";
var elementPath = '\\\\DAN-AF-DEV\\Mineral Processing\\Toll Ore Delivery\\T-101';
var tStart = "*-1mo";
var tEnd = "*";

// creates an internal element object that the module uses
$('#btnUpdate').click(function () {
    eventsModule.Update(apiServer, elementPath, tStart, tEnd);
});
