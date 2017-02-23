
var eventsModule = function (flinks) {
    let templates = [];
    let efDataHolder = {};
    let myel = {};

    // Modeled after the example given in Mike Bostock's fantastic "Towards Reusable Charts": https://bost.ocks.org/mike/chart/
    //
    // This pattern allows us to create (lots of) treemaps easily and update their data (and other attributes) by calling this function with new data (or new chart attributes).
    function treemap() {
        var width = 960,
            height = 570;

        // A helper method that allows us to set the width of the chart.
        // This passes back itself to allow function chaining. Ex: var myTreeMap = treemap().width(900).height(400);
        treemap.width = function (value) {
            if (!arguments.length) return width
            width = value
            return treemap;
        };

        // Same as above, but for height
        treemap.height = function (value) {
            if (!arguments.length) return height
            height = value
            return treemap;
        };

        // This is the main logic of the treemap, it modifies the data (should be a d3.hierarchy of some sort), applies
        // it to the passed selection (i.e. where the visualization should go), and constructs the treemap visualization.
        function treemap(selection) {
            // d3 selections are the main way to apply data to HTML elements: https://github.com/d3/d3-selection/blob/master/README.md
            //
            // The following code applies the data tied to the passed in selection(s) and is where we actually build the
            // treemap.
            selection.each(function (data) {
                // Use `.get(0)` to get the actual element referenced by the jQuery object and pass it into d3's
                // `select` function. d3 and jQuery don't always play along perfectly.
                var fader = function (color) { return d3.interpolateRgb(color, "#fff")(0.2); },
                    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
                    format = d3.format(",d");

                // Create a function that will format the treemap's data according to the
                // way we want it displayed
                var treemap = d3.treemap()
                    .tile(d3.treemapResquarify)
                    .size([width, height])
                    .round(true)
                    .paddingInner(1);

                // Format the data for use in the treemap
                treemap(data);

                var svg = d3.select(this);
                // this code selects all of the d3 elements and removes everything.  Ideally, we use enter(), update() and exit()
                svg.selectAll("*").remove();
                var cell = svg.selectAll("g")
                  .data(data.leaves())
                  .enter().append("g")
                    .attr("transform", function (d) {
                        return "translate(" + d.x0 + "," + d.y0 + ")";
                    })
                    .on('click', function (d) {
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

                d3.selectAll('input[type="radio"]')
                    .data([sumByDuration, sumByCount], function (d) {
                        return d ? d.name : this.value;
                    })
                    .on('change', function (sumFunc) {
                        treemap(root.sum(sumFunc));

                        cell.transition()
                              .duration(250)
                              .attr("transform", function (d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
                            .select("rect")
                              .attr("width", function (d) { return d.x1 - d.x0; })
                              .attr("height", function (d) { return d.y1 - d.y0; });
                    });
            });
        }

        // Return a treemap function that someone can call to add data to
        return treemap;
    }
    // creates an eventframe object that is used by the holder
    function myEventFrame(name, TemplateName, startTime, endTime, templatelink, webId) {
        this.name = name;
        this.templateName = TemplateName;
        this.StartTime = new Date(startTime);
        // checks if the EF is still open, and if so, set the endtime to *, and inprocess to true
        if (endTime === "9999-12-31T23:59:59Z") {
            this.EndTime = new Date()          
            this.InProcess = true;

        } else {
            this.EndTime = new Date(endTime);
            this.InProcess = false;
        }
        this.TemplateLink = templatelink;
        this.webId = webId;
    }

    // holds an AF element
    function myElement(name, Path, webID, framesLink) {
        this.name = name;
        this.path = Path;
        this.webId = webID;
        this.framesLink = framesLink;
    }

    // given webID of element, retrieve EF on it within the ST and ET
    function GetEventFramesByElementID(elementIDbase, symbolElement, startTime, endtime, successPromise, failPromise) {
        url = elementIDbase + "?StartTime=" + startTime + "&" + "Endtime=" + endtime + "&searchmode=StartInclusive";
        this.symbolElement = symbolElement;
        
        // gets all of the EF within the provided start and endtimes given the webID of an element.  Then extracts the frames
        makeDataCall(url, 'get').then(results => {
            ExtractEF(results, this.symbolElement, successPromise);
        }).catch(error=>failPromise(error));
    }

    //given webAPI results, extract the results, create EFs, and put them into efDataHolder;
    function ExtractEF(results, symbolElement, successPromise) {
        items = results.Items;
        //clear the cache of events
        efDataHolder = {};
        for (let item in items) {
            let apiFrameResult = items[item];
            // create a simple EF object
            let EF = new myEventFrame(apiFrameResult.Name, apiFrameResult.TemplateName, apiFrameResult.StartTime, apiFrameResult.EndTime,
                apiFrameResult.Links.Template, apiFrameResult.WebId);
            // if the EF template is not a property of the object, add it
            if (efDataHolder[EF.templateName] === undefined) {
                efDataHolder[EF.templateName] = {
                    "Links": apiFrameResult.Links.Template,
                    "frames": []
                }
            }
            // for all EF, add an arry of the EF with properties of id and the actual EF object
            efDataHolder[EF.templateName].frames.push({
                id: EF.webId,
                ef: EF
            });
        }
        //reference the treeview and build it here
        eventsModule.BuildTreemap(symbolElement);
    }

    // give a templateName, obtains the attributes.
    function GetTemplateAttributes(apiServer, templateName) {
        if (efDataHolder[templateName] === undefined) {
            alert("template not found");
            return;
        }
        //could use batch call to make this more efficient if desired
        //adds the attributeTemplates items to the template
        var tempURL = efDataHolder[templateName].Links;
        makeDataCall(tempURL, 'get').then(results =>
        // get the attribute templates and add them to the template
            makeDataCall(results.Links.AttributeTemplates)).then(attTemplate=> {
                let attributes = attTemplate.Items;
                if (efDataHolder[templateName].attributesTemplates === undefined) {
                    efDataHolder[templateName].attributesTemplates = [];
                    attributes.forEach(attribute=> {
                        efDataHolder[templateName].attributesTemplates.push(attribute)
                        // console.log(attriubte);
                    })
                }
                GetAttributesValues(apiServer, "Net Wet Weight (Mine)", templateName);
            })
        .catch(error=>console.log(error));
    }
    //get a singleEf 
    function GetSingleEFAttributes(apiServer, id) {

        let efURL = apiServer + "streamsets/" + id + "/value";

        makeDataCall(efURL, "GET", null, null, null)
        .then(results=> {
            let attributes = [];
            // add to the attributes array an object with the attribute name, and value.
            results.Items.forEach(attribute=> {
                attributes.push({
                    Name: attribute.Name,
                    Value: attribute.Value.Value,
                });
            });
            // probably should return the attribute array here
            console.log(attributes);

        })
        .catch(error=>console.log(error));

    }

    // get the attribute values for each EF given an attributeName and template
    function GetAttributesValues(apiServer, attributeName, templateName) {
        var templateUsed = efDataHolder[templateName];
        //we can make sure the attribute is found on the template...example check
        // var found = templateUsed.attributesTemplates.find(att=>att.Name.toUpperCase() === attributeName.toUpperCase());

        // build up a bulk query that requires the ef webID and the attribute ID
        var bulkQuery = {};
        templateUsed.frames.forEach(EF => {
            let attributeURL;

            attributeURL = encodeURI(apiServer + "streamsets/" + EF.id + "/value?nameFilter=" + attributeName + "&selectedFields=Items.Value.Value");
            bulkQuery[EF.id] = {
                "Method": "GET",
                "Resource": attributeURL
            };
        });
        makeDataCall(apiServer + "batch", "POST", JSON.stringify(bulkQuery), null, null)
        .then(results=>ProcessAttributeResults(results, templateName, attributeName))
        .catch(error=> console.log(error));
    }

    // takes batch call results, and adds values to the correct EF
    function ProcessAttributeResults(results, templateName, attributeName) {
        for (let result in results) {
            if (results[result].Status == 200) {
                // const attribute = new Set([{ attributeName: results[result].Content.Items[0].Value.Value }]);
                
                const attributeMap = new Map();
                // add attribute values to the map.  
                attributeMap.set(attributeName, results[result].Content.Items[0].Value.Value);
                // find the correct EF, and add the attribute value to it
                efDataHolder[templateName].frames.find(ef=>ef.id === result).attributeValuesMap = attributeMap;
            }
        }     
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
        GetEFAttributesValuesFromTemplate: (apiServer, templateName) =>GetTemplateAttributes(apiServer, templateName),
        // Creates an element object provided a path
        Update: (APIServer, elementPath, symbolElement, startTime, endTime) => {
            //let elementPath = '\\\\PISRV01\\Mineral Processing\\Toll Ore Delivery\\T-101'
            let url = APIServer + '//' + "elements?path=" + elementPath;
            this.symbolElement = symbolElement;
        
            makeDataCall(url, 'get').then(results => {
                myel = new myElement(results.Name, results.Path, results.WebId, results.Links.EventFrames);
                console.log(myel.name);
                console.log(this.symbolElement);
                GetEventFramesByElementID(myel.framesLink, this.symbolElement, startTime, endTime, null, null);
            }).catch(error=> {
                console.log(error)
            });
        },
        // Builds a treemap under the passed element
        BuildTreemap: ($treemapElement) => {
            var width = +$treemapElement.width(),
                height = +$treemapElement.height();

            var myTreemap = treemap()
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
            
            // Find the svg that will contain our treemap by looking for an 'svg' element within the passed
            // symbol element.
            var treemapSelection = d3.select('svg', $treemapElement.get(0));

            // Draw the treemap
            selection
                .datum(root)
                .call(myTreemap);
        }
    }
}();

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

