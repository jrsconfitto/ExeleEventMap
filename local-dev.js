// Start development when imported symbol template is loaded
function handleLoad(e) {
    // Get the imported document
    var importedDocument = document.querySelector('link[rel="import"]').import;

    // Update treemap once when page loads
    updateTreemap(importedDocument);

    // Update treemap every 5 seconds (mimic PI Vision behavior)
    setInterval(function () {
        updateTreemap();
    }, 5000);

}

// `symbolDocument` is the document containing our symbol's template (the one we import into this file)
function updateTreemap(symbolDocument) {

    // Get parameters from fields on page
    var apiServer = document.getElementById("tUrl").value;
    var elementPath = document.getElementById("tElem").value;
    var tStart = document.getElementById("tStart").value;
    var tEnd = document.getElementById("tEnd").value;

    // Update treemap using selected parameters
    eventsModule.Update(apiServer, elementPath, $('.exele-treemap-symbol', symbolDocument), tStart, tEnd);

}

function handleError(e) {
    console.log('Error loading import: ' + e.target.href);
}

