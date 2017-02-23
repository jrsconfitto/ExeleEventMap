
function updateTreemap() {

    var apiServer = document.getElementById("tUrl").value;
    var elementPath = document.getElementById("tElem").value;
    var tStart = document.getElementById("tStart").value;
    var tEnd = document.getElementById("tEnd").value;

    eventsModule.Update(apiServer, elementPath, tStart, tEnd);
}

function startDev() {
 
    updateTreemap();

    setInterval(function () {
        updateTreemap();
    }, 5000);

}

window.onload = startDev;
