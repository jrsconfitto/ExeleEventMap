
function updateTreemap() {

    // Get parameters from fields on page
    var apiServer = document.getElementById("tUrl").value;
    var elementPath = document.getElementById("tElem").value;
    var tStart = document.getElementById("tStart").value;
    var tEnd = document.getElementById("tEnd").value;

    // Update treemap using selected parameters
    eventsModule.Update(apiServer, elementPath, tStart, tEnd);

}

function startDev() {
 
    // Update treemap once when page loads
    updateTreemap();

    // Update treemap every 5 seconds (mimic PI Vision behavior)
    setInterval(function () {
        updateTreemap();
    }, 5000);

}

// Start development when page is loaded
window.onload = startDev;
