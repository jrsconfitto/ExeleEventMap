var apiServer = "https://dan-af-dev/piwebapi";
var elementPath = '\\\\DAN-AF-DEV\\Mineral Processing\\Toll Ore Delivery\\T-101';
var tStart = "*-1mo";
var tEnd = "*";

function handleLoad(e) {
    var importedContent = document.querySelector('link[rel="import"]').import;

    // creates an internal element object that the module uses
    $('#btnUpdate').click(function () {
        eventsModule.Update(apiServer, elementPath, tStart, tEnd);
    }.bind(importedContent));
}

function handleError(e) {
    console.log('Error loading import: ' + e.target.href);
}
