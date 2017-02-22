//need to get unique templates, need to get attributes of template, need to calculate duration

//next need to return the templates, return two attributes and more

var _WebAPIServer = "https://dan-af-dev/piwebapi";
var afServer = "dan-af-dev"
var afDatabase = "Mineral Processing";
var databaseRootURLComplete;
var elementPath = '\\\\DAN-AF-DEV\\Mineral Processing\\Toll Ore Delivery\\T-101'


var eventsModule = function (flinks) {
    let templates = [];
    let efDataHolder = {};
    let myel = {};
    let myTreemap = treemap();

    // Treemap function that returns a treemap!
    //
    // Much of this is formed on the foundation of Mike Bostock's wonderful
    // Towards Reusable Charts article: https://bost.ocks.org/mike/chart/
    function treemap() {
        var width = 960,
            height = 570;

        treemap.width = function (value) {
            if (!arguments.length) return width
            width = value
            return treemap;
        };

        treemap.height = function (value) {
            if (!arguments.length) return height
            height = value
            return myTreemap;
        };

        function treemap(selection) {
            selection.each(function (data, i) {
                var svg = d3.select(this).selectAll('svg');

                var fader = function (color) { return d3.interpolateRgb(color, "#fff")(0.2); },
                    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
                    format = d3.format(",d");

                // Put it into a d3 treemap
                var d3treemap = d3.treemap()
                    .tile(d3.treemapResquarify)
                    .size([width, height])
                    .round(true)
                    .paddingInner(1);

                console.log("Using the following data", data);

                d3treemap(data);
                
                var cell = svg.selectAll("g")
                  .data(data.leaves())
                  .enter().append("g")
                    .attr("transform", function (d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
                    .on('click', function (d)
                    {                    
                        //the webID is the unique identifier for each Event Frames.
                        let efID = d.data.ef.webId;
                        console.log("You clicked on ef with ID", efID);
                        GetSingleEFAttributes(efID);
                    });

                cell.append("rect")
                    .attr("id", function (d) { return d.data.id; })
                    .attr("width", function (d) { return d.x1 - d.x0; })
                    .attr("height", function (d) { return d.y1 - d.y0; })
                    .attr("fill", function (d) { return color(d.parent.data.id); })
                    .attr("data-web-id", function (d) { return d.data.ef.webId; });

                cell.append("clipPath")
                    .attr("id", function (d) { return "clip-" + d.data.id; })
                  .append("use")
                    .attr("xlink:href", function (d) { return "#" + d.data.id; });

                cell.append("text")
                    .attr("clip-path", function (d) { return "url(#clip-" + d.data.id + ")"; })
                  .selectAll("tspan")
                    .data(function (d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
                  .enter().append("tspan")
                    .attr("x", 4)
                    .attr("y", function (d, i) { return 13 + i * 10; })
                    .text(function (d) { return d; });

                cell.append("title")
                    .text(function (d) {
                      return d.data.name + "\n" + format(d.value) + ' duration (mins)' + '\n' + 'Start: ' + d.data.startTime + '\nEnd: ' + d.data.endTime;
                    });

                d3treemap(data);
//                 d3.selectAll('input[type="radio"]')
//                     .data([sumByDuration, sumByCount], function(d) {
//                       return d ? d.name : this.value;  
//                     })
//                     .on('change', function(sumFunc) {
//                       treemap(data.sum(sumFunc));

//                       cell.transition()
//                             .duration(250)
//                             .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
//                           .select("rect")
//                             .attr("width", function(d) { return d.x1 - d.x0; })
//                             .attr("height", function(d) { return d.y1 - d.y0; });
//                     });
            });
        }

        // Return a treemap function that someone can call to add data to
        return treemap;
    }
   
    function myEventFrame(name, TemplateName, startTime, endTime, templatelink, webId) {
        this.name = name;
        this.templateName = TemplateName;
        this.StartTime = new Date(startTime);
        if (endTime === "9999-12-31T23:59:59Z") {
            this.EndTime = new Date()
            //.toISOString();
            this.InProcess = true;

        } else {
            this.EndTime = new Date(endTime);
            this.InProcess = false;
        }
        this.TemplateLink = templatelink;
        this.webId = webId;
    }

    function myElement(name, Path, webID, framesLink) {
        this.name = name;
        this.path = Path;
        this.webId = webID;
        this.framesLink = framesLink;
    }

    //given webID of element, retrieve EF on it within the ST and ET
    function GetEventFramesByElementID(elementIDbase, startTime, endtime, successPromise, failPromise) {
        url = elementIDbase + "?StartTime=" + startTime + "&" + "Endtime=" + endtime + "&searchmode=StartInclusive";
        makeDataCall(url, 'get').then(results => {
            ExtractEF(results, successPromise);
        }).catch(error=>failPromise(error));
    }

    //given webAPI results, extract the results, create EFs, and put them into efDataHolder;
    function ExtractEF(results, successPromise) {
        items = results.Items;
        //clear the cache of events
        efDataHolder = {};
        for (let item in items) {
            let apiFrameResult = items[item];
            let EF = new myEventFrame(apiFrameResult.Name, apiFrameResult.TemplateName, apiFrameResult.StartTime, apiFrameResult.EndTime,
                apiFrameResult.Links.Template, apiFrameResult.WebId);
            if (efDataHolder[EF.templateName] === undefined) {
                efDataHolder[EF.templateName] = {
                    "Links": apiFrameResult.Links.Template,
                    "frames": []
                }
            }
            efDataHolder[EF.templateName].frames.push({
                id: EF.webId,
                ef: EF
            });
        }
        //reference the treeview and build it here
         var $treemapEl = $('svg#treemap');
         eventsModule.BuildTreemap($treemapEl);
    }

    // give a templateName, obtains the attributes.
    function GetTemplateAttributes(templateName) {
        if (efDataHolder[templateName] === undefined) {
            alert("template not found");
            return;
        }
        //could use batch call to make this more efficient if desired
        //adds the attributeTemplates items to the template
        var tempURL = efDataHolder[templateName].Links;
        makeDataCall(tempURL, 'get').then(results =>
            makeDataCall(results.Links.AttributeTemplates)).then(attTemplate=> {
                let attributes = attTemplate.Items;
                if (efDataHolder[templateName].attributesTemplates === undefined) {
                    efDataHolder[templateName].attributesTemplates = [];
                    attributes.forEach(attribute=> {
                        efDataHolder[templateName].attributesTemplates.push(attribute)
                        // console.log(attriubte);
                    })
                }
                GetAttributesValues("Net Wet Weight (Mine)", templateName);
            })
        .catch(error=>console.log(error));
    }
    //get a singleEf 
    function GetSingleEFAttributes(id){

        let efURL = _WebAPIServer + "streamsets/" + id + "/value";

        makeDataCall(efURL, "GET", null, null, null)
        .then(results=> {
            let attributes = [];
            results.Items.forEach(attribute=> {
                attributes.push( {
                    Name: attribute.Name,
                    Value: attribute.Value.Value,
                });
            });
            console.log(attributes);
          
        })
        .catch(error=>console.log(error));

    }

    // get the attribute values for each EF given an attributeName and template
    function GetAttributesValues(attributeName, templateName) {
        var templateUsed = efDataHolder[templateName];
        //we can make sure the attribute is found on the template...example check
        // var found = templateUsed.attributesTemplates.find(att=>att.Name.toUpperCase() === attributeName.toUpperCase());

        var bulkQuery = {};
        templateUsed.frames.forEach(EF => {
            let attributeURL;

            attributeURL = encodeURI(_WebAPIServer + "streamsets/" + EF.id + "/value?nameFilter=" + attributeName + "&selectedFields=Items.Value.Value");
            bulkQuery[EF.id] = {
                "Method": "GET",
                "Resource": attributeURL
            };
        });
        makeDataCall(_WebAPIServer + "batch", "POST", JSON.stringify(bulkQuery), null, null)
        .then(results=>ProcessAttributeResults(results, templateName, attributeName))
        .catch(error=> console.log(error));
    }

    // takes batch call results, and adds values to the correct EF
    function ProcessAttributeResults(results, templateName, attributeName) {
        for (let result in results) {
            if (results[result].Status == 200) {
                // const attribute = new Set([{ attributeName: results[result].Content.Items[0].Value.Value }]);
                const attributeMap = new Map();
                attributeMap.set(attributeName, results[result].Content.Items[0].Value.Value);
                efDataHolder[templateName].frames.find(ef=>ef.id === result).attributeValuesMap = attributeMap;
            }
        }
        let sumOfAttributeValues = efDataHolder[templateName].frames.reduce(function (aggregate, frame) {
            return aggregate + frame.attributeValuesMap.get(attributeName);
        }, 0);
        console.log(`The sum of the attributes for ${attributeName} is ${sumOfAttributeValues}`);

    }

    // This converts EFs in `efDataHolder` to hierarchical data useful for treemaps
    //
    // d3 expects data passed into a treemap to have a specific structure. It must
    // be "tree-like" (James's words) and have a sense of a root and then childnodes,
    // which in turn have child nodes.
    //
    // d3-hierarchy provides more information on how to create this kind of data
    // structure: https://github.com/d3/d3-hierarchy
    function EFsToHierarchy() {
        var efData = {
            name: "EventFrames",
            children: []
        };

        // TODO: is it possible to build this using any d3-hierarchy helper functions?
        for (var efName in efDataHolder) {
            var efs = efDataHolder[efName];

            efData.children.push({
                name: efName,
                children: efs.frames
                    .map(function (f) {
                        return {
                            name: f.ef.name,
                            ef: f.ef,
                            startTime: f.ef.StartTime,
                            endTime: f.ef.EndTime
                        }
                    })
            });
        }

        return d3.hierarchy(efData)
          .eachBefore(function (d) {
              d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
              // d.WebId = "1111"
          })
          .sum(sumByDuration)
          .sort(function (a, b) {
              // Sorts by the height (greatest distance from descendant leaft)
              // and then by value (which determines box sizes).
              return b.height - a.height || b.value - a.value;
          });
    }

    function sumByDuration(d) {
      return (d.endTime - d.startTime) / 1000 / 60;
    }

    function sumByCount(d) {
        return 1;
    }

    return {
        // gets all of the EF for a given element provided an element link and timerange
        GetEFByElement: (successPromise, errorPromise) => {
            GetEventFramesByElementID(myel.framesLink, '*-7d', '*', successPromise, errorPromise);
        },
        // gets all of the EF attributes givena  template, need to extended to use attribute name
        GetEFAttributesValuesFromTemplate: (templateName) =>GetTemplateAttributes(templateName),
        // Creates an element object provided a path
        Update: (APIServer, elementPath) => {
            //let elementPath = '\\\\PISRV01\\Mineral Processing\\Toll Ore Delivery\\T-101'
            let url = APIServer + '//'+ "elements?path=" + elementPath;
            makeDataCall(url, 'get').then(results => {
                myel = new myElement(results.Name, results.Path, results.WebId, results.Links.EventFrames);
                console.log(myel.name);
                GetEventFramesByElementID(myel.framesLink, "*-7d", "*", null, null);
            }).catch(error=> {
                console.log(error)
            });
        },
        // Builds a treemap under the passed element
        BuildTreemap: ($treemapElement) => {
            var width = +$treemapElement.attr("width"),
                height = +$treemapElement.attr("height");

            myTreemap
                .width(width)
                .height(height);

            // Extract the right data from the Treemap
            //
            // d3 requires hierarchical data. From the documentation:
            //
            //  Before you can compute a hierarchical layout, you need a root node. If your data
            //  is already in a hierarchical format, such as JSON, you can pass it directly to
            //  d3.hierarchy; otherwise, you can rearrange tabular data, such as comma-separated
            //  values (CSV), into a hierarchy using d3.stratify.
            var root = EFsToHierarchy();
            var selection = d3.select($treemapElement.get(0));

            // Draw the treemap
            selection
                .datum(root)
                .call(myTreemap);
        }
    }
}();

// creates an internal element object that the module uses
$('#elementPath').click(function () {
    eventsModule.Update(_WebAPIServer, elementPath);
});


$('#buildTreemap').click(() => {
    var $treemapEl = $('svg#treemap');
    eventsModule.BuildTreemap($treemapEl);
});

var makeDataCall = function (url, type, data, successCallBack, errorCallBack) {
    return $.ajax({
        url: encodeURI(url),
        type: type,
        data: data,
        cache: false,
        contentType: "application/json; charset=UTF-8",
        success: successCallBack,
        error: errorCallBack //,
        // beforeSend: function (xhr) {
        //    xhr.setRequestHeader("Authorization", makeBasicAuth("administrator", "pw"));
        // },         
    });
};

