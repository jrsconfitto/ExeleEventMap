// Start development when imported symbol template is loaded
function handleLoad(e) {
    // Get the imported document
    var importedDocument = document.querySelector('link[rel="import"]').import;
    var importedSymbol = importedDocument.querySelector('body').innerHTML;
    
    // Insert imported content into our page
    var $symbol = $('#imported-symbol')
    $symbol.html(importedSymbol);

    // Update treemap once when page loads
    updateTreemap($symbol);

    // Update treemap every 5 seconds (mimic PI Vision behavior)
    setInterval(function () {
        updateTreemap(this);
    }.bind($symbol), 5000);

}

// `symbolDocument` is the document containing our symbol's template (the one we import into this file)
function updateTreemap($symbol) {

    // Get parameters from fields on page
    var apiServer = document.getElementById("tUrl").value;
    var elementPath = document.getElementById("tElem").value;
    var tStart = document.getElementById("tStart").value;
    var tEnd = document.getElementById("tEnd").value;

    // Update treemap using selected parameters
    eventsModule.Update(apiServer, elementPath, $('.exele-treemap-symbol'), tStart, tEnd);

}

function handleError(e) {
    console.log('Error loading import: ' + e.target.href);
}

