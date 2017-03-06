
// Exele Information System Inc, TreeMap for the OSIsoft LLC 2017 hackathon.
// Main function that does the Exele Tree logic
function Exele_TreeBuilder() {
    //****Private variables
    let templates = [];
    let efDataHolder = {};
    let myel = {};
    let symbolElement = {};
    let webAPIServerURL = "";
    var _template = "";
    var _sizeAttribute = "";
    var _colorAttribute = "";


    //**********public setters***********
    // sets the tree symbol
    this.SetSymbol = function(treeSymbolElement) {
        symbolElement = treeSymbolElement;
    }
    // sets the WebAPI server
    this.SetWebAPIURL= function(url) {
        webAPIServerURL = url;
    }
    //set the global template to display
    this.SetTemplate= function(template) {
        _template = template;
    }
    this.SetSizeAttribute= function(sizeAttribute) {
        _sizeAttribute = sizeAttribute;
    }
    this.SetColorAttribute= function(colorAttribute) {
        _colorAttribute = colorAttribute;
    }

    // used to return all of the EF templates used as array
    this.GetTemplates = function() {
        var templates = [];
    //["None"];
        for (var t in efDataHolder) {
            templates.push(t);
    }
        return templates;
    }

    // use to return the attributes as array given a template
    this.GetEFAttributesFromTemplate = function(templateName) {
        if (efDataHolder[templateName] && efDataHolder[templateName].attributes) {
            return efDataHolder[templateName].attributes;
        }
        // Return an empty array if we don't find a match
        return [];
    }

    // main function that builds up the EF data
    // gets the element, gets the EF on the element
    this.GetEFData = function(elementPath, startTime, endTime) {
        // First make a call to get the element using PI Web API
        let url = webAPIServerURL + '//' + "elements?path=" + elementPath;
        makeDataCall(url, 'get', null, PathResults, error);

        // get the results, create a mock element, and call function to get the EF
        function PathResults(results) {
            myel = new myElement(results.Name, results.Path, results.WebId, results.Links.EventFrames);
            GETEFByElementID(myel.framesLink, startTime, endTime, ExtractEF);
        }
        // get the resulting EF within the time range, and calls ExtractEF when completed
        function GETEFByElementID(elementIDbase, startTime, endtime, successCallBack) {
            url = elementIDbase + "?StartTime=" + startTime + "&" + "Endtime=" + endtime + "&searchmode=StartInclusive";
            this.symbolElement = symbolElement;
            makeDataCall(url, 'get', null, successCallBack, error);
        }
        function error(result) {
            console.log(error);
        }
    }

    //*********Internal functions******************

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
                var fader = function (color) { return d3.interpolateRgb(color, "#fff")(0.2); },
                    discreteColor = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
                    sequentialColor = d3.scaleSequential(d3.interpolateCool),
                    format = d3.format(",d");

                // Create a function that will format the treemap's data according to the
                // way we want it displayed
                var treemap = d3.treemap()
                    .tile(d3.treemapResquarify)
                    .size([width, height])
                    .round(true)
                    .paddingInner(1);

                // Run the treemap function over the data. This runs through the data hierarchy calculating
                // the sizes and positions of the cells based on the sum, sort, and other criteria of the hierarchy.
                treemap(data);

                // Select the div tag that will be the parent of our treemap
                var parentDiv = d3.select(this);

                // this code selects all of the d3 elements and removes everything.  Ideally, we use enter(), update() and exit()
                parentDiv.selectAll("*").remove();

                // Since everything under the parent div was removed, add an svg element and set its height and width according
                // to the settings passed into this chart earlier.
                var svg = parentDiv.selectAll('svg')
                    .data([data])
                  .enter().append('svg')
                    .attr('width', width)
                    .attr('height', height);

                // This creates a cell ('g' element) for each box (i.e. EventFrame) to be put into the treemap
                var cell = svg.selectAll('g')
                    .data(function (d) {
                        return d.leaves();
                    })
                  .enter().append("g")
                    .attr("transform", function (d) {
                        return "translate(" + d.x0 + "," + d.y0 + ")";
                    })
                    .on('click', function (d) {
                        //the webID is the unique identifier for each Event Frames.
                        let efID = d.data.ef.webId;
                        //                         console.log("You clicked on ef with ID", efID);
                        //                         GetSingleEFAttributes(efID);

                        // Fire a jQuery event notifying that an EF in the treemap was clicked
                        $(this).trigger('efClick', {
                            ef: d.data.ef
                        });
                    });

                cell.append("rect")
                    .attr("id", function (d) { return d.data.id; })
                    .attr("width", function (d) { return d.x1 - d.x0; })
                    .attr("height", function (d) { return d.y1 - d.y0; })
                    .attr("fill", function (d) {
                        var selectedColor,
                            defaultColor = (_colorAttribute && _colorAttribute !== 'None' ? discreteColor(d.parent.data.name) : discreteColor(d.parent.data.id));

                        if (d.data.color) {
                            selectedColor = sequentialColor(d.data.color.value);
                            console.debug('%c Default color' + '%c Attribute color', 'background: ' + defaultColor, 'background: ' + selectedColor);
                        } else {
                            console.debug('%c Default color', 'background: ' + defaultColor);
                        }

                        return (d.data.color ? selectedColor : defaultColor);
                    })
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
                        var title = d.data.name
                            + '\nTemplate: ' + d.data.ef.templateName
                            + '\nDuration: ' + format(d.data.durationMinutes) + ' minutes'
                            + '\nStart: ' + d.data.startTime.toLocaleString()
                            + '\nEnd: ' + d.data.endTime.toLocaleString();

                        if (_sizeAttribute !== '' && _sizeAttribute !== 'None') {
                            title += '\n\n(Sizing by: ' + _sizeAttribute + ')';
                            if (d.data.ef.attributes && d.data.ef.attributes.has(_sizeAttribute)) {
                                title += '\n\t' + _sizeAttribute + ' Value: ' + d.data.ef.attributes.get(_sizeAttribute);
                            }
                        }

                        if (_colorAttribute !== '' && _colorAttribute !== 'None') {
                            title += '\n\n(Coloring by: ' + _colorAttribute + ')';
                            if (d.data.ef.attributes && d.data.ef.attributes.has(_colorAttribute)) {
                                title += '\n\t' + _colorAttribute + ' Value: ' + d.data.ef.attributes.get(_colorAttribute);
                            }
                        }

                        return title;
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

    //

    // given webAPI results, extract the results, create EFs, and put them into efDataHolder;
    // add the event get the attributes for the templates.  Ideally we cache this and do it once.
    // This method also call methods to get all of the attribute Templates, attribute Values based on config, and builds the map
    function ExtractEF(results) {
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
                    "frames": [],
                }
            }
            // for all EF, add an arry of the EF with properties of id and the actual EF object
            efDataHolder[EF.templateName].frames.push({
                id: EF.webId,
                ef: EF
            });
        }
        // get the attribute tepmlates to cache them here to show in the grid, we should move to own cache
        GetAllTemplateAttributes();

        // Get attribute value for provide attribute and template.
        if (_template && _template != "None" &&
            (_sizeAttribute && _sizeAttribute != "None" || _colorAttribute && _colorAttribute != "None")) {
            // Will build the treemap after pulling down attributes' values
            GetAttributesValues(_template);
        } else {
            //reference the treeview and build it here
            BuildTreemap();
        }
    }

    // adds attribute names to the model such that the config panel displays the Values
    function GetAllTemplateAttributes() {
        // loop throught each template in efDataHolder
        for (let templates in efDataHolder) {
            // use the template link to get the links and call method to get attribute templates
            makeDataCall(efDataHolder[templates].Links, 'get', null, getAtributeTemplates)
            // once we have the template, make call to get attribute templates and extract names (get)
            function getAtributeTemplates(results) {
                makeDataCall(results.Links.AttributeTemplates, 'get', null, getAttributeTemplateNames);
            }
            // put attribute template names into array
            function getAttributeTemplateNames(results) {
                if (efDataHolder[templates]) {
                    efDataHolder[templates].attributes = results.Items;
                }
            }
        }
    }

    //get a singleEf
    function GetSingleEFAttributes(id) {
        let efURL = webAPIServerURL + "/streamsets/" + id + "/value";
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
        }, error=>console.log(error));

    }

    // get the attribute values for each EF given an attributeName and template
    function GetAttributesValues(templateName) {
        var templateUsed = efDataHolder[templateName];

        if (templateUsed) {
            // build up a bulk query that requires the ef webID and the attribute ID
            var bulkQuery = {};
            templateUsed.frames.forEach(EF => {
                var attributeURL;
                attributeURL = encodeURI(webAPIServerURL + "/streamsets/" + EF.id + "/value?selectedFields=Items.Name;Items.Value.Value");
                bulkQuery[EF.id] = {
                    "Method": "GET",
                    "Resource": attributeURL
                };
            });
            // use batch call and call method to add the attribute values as a map to the tree
            makeDataCall(webAPIServerURL + "/batch", "POST", JSON.stringify(bulkQuery), null, null)
            .then(results=>ProcessAttributeResults(results, templateName))
            .then(() => BuildTreemap());
            //.catch(error=> console.log(error));
        } else {
            BuildTreemap();
        }
    }

    // takes batch call results, and adds values to the correct EF
    function ProcessAttributeResults(results, templateName) {
        for (let result in results) {
            if (results[result].Status == 200 && results[result].Content.Items.length > 0) {
                const attributeMap = new Map();
                // add attribute values to the map.
                for (var i in results[result].Content.Items) {
                    var attributeObj = results[result].Content.Items[i];
                    attributeMap.set(attributeObj.Name, attributeObj.Value.Value);
                }

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
        var efDataRoot = {
            name: '',
            children: [],
        };

        // Converts the passed EFs into data objects for use in the treemap
        function getChildrenFromFrames(frames) {
            return frames
                .map(function (f) {
                    // Include any attributes into the ef object
                    var color;

                    if (f.attributeValuesMap) {
                        f.ef.attributes = f.attributeValuesMap;

                        if (_colorAttribute && f.ef.attributes.has(_colorAttribute)) {
                            color = {
                                attributeName: _colorAttribute,
                                value: f.attributeValuesMap.get(_colorAttribute)
                            };
                        }
                    }

                    // The data object is what will be passed into the d3 visualization
                    // and will be the main information that the treemap has access to.
                    //
                    // If you want the visualization to have more EF-specific information
                    // available to it, add it here.
                    var data = {
                        name: f.ef.name,
                        ef: f.ef,
                        startTime: f.ef.StartTime,
                        endTime: f.ef.EndTime,
                        durationMinutes: ((f.ef.EndTime - f.ef.StartTime) / 1000 / 60)
                    }

                    if (color) {
                        data.color = color;
                    }

                    return data;
                });
        }

        if (_template && _template !== 'None' && efDataHolder[_template]) {

            var efs = efDataHolder[_template];
            efDataRoot.name = _template;
            efDataRoot.children = getChildrenFromFrames(efs.frames);

        } else {

            efDataRoot.name = 'EventFrames';

            // Add a node to the tree's root for each EF template, filling in each name and setting its children
            // to the EFs in each.
            for (var efName in efDataHolder) {
                var efs = efDataHolder[efName];

                efDataRoot.children.push({
                    name: efName,
                    children: getChildrenFromFrames(efs.frames)
                });
            }
        }

        // Might be useful to allow summing by count, in the future.
        function sumByCount(d) {
            return 1;
        }

        return d3.hierarchy(efDataRoot)
          .eachBefore(function (d) {
              d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name + (d.data.ef ? '.' + d.data.ef.webId : '');
              // d.WebId = "1111"
          })
          .eachAfter(function(d) {
              // Give nodes with children `durationMinutes` properties equal to the sum of the durations of their children.
              if (d.children) {
                  d.data.durationMinutes = d.children.reduce(function(a, b) {
                      return a + b.data.durationMinutes;
                  }, 0)
              }
          })
          .sum(function (d) {
              // The `sum` determines the size of the cells within the treemap.

              // From d3-hierarchy's docs on the sum function: https://github.com/d3/d3-hierarchy/blob/master/README.md#node_sum
              // > The function is passed the node’s data, and must return a non-negative number.

              // This summing function sums by:
              //
              // A selected attribute's value, if present
              //
              // OR
              //
              // The EF's duration (default)

              // Lots of things are being verified here before we use the attribute's value for cell sizing:
              //
              // * Is there a selected template and attribute?
              // * Does the template of this EF match the selected template?
              // * Does the attributes map exist on the data point's (i.e. `d`) `ef` property?
              // * Does the attributes map contain the selected attribute?
              if (_template
                  && _sizeAttribute
                  && d.ef
                  && _template == d.ef.templateName
                  && d.ef.attributes
                  && d.ef.attributes.has(_sizeAttribute)) {

                  // Return the value of the selected attribute
                  return d.ef.attributes.get(_sizeAttribute);
              }

              // Otherwise, default to summing by EF duration
              return (d.endTime - d.startTime) / 1000 / 60;
          })
          .sort(function (a, b) {
              // Sorts by the height (greatest distance from descendant leaf)
              // and then by value (which determines box sizes).
              return b.height - a.height || b.value - a.value;
          });
    }

    // Builds a treemap under the passed element
    function BuildTreemap() {
        // Find the div that will contain our treemap by looking for an element going by our "exele-treemap" class
        // within the symbol element.
        var $treemapParentElement = $('.exele-treemap', symbolElement);

        var width = $treemapParentElement.width(),
            height = $treemapParentElement.height();

        var treemapSelection = d3.select($treemapParentElement.get(0));

        // Set the treemap's width and height based on the calculated values above
        var myTreemap = treemap()
            .width(width)
            .height(height);

        // Extract the right Event Frames data for the Treemap
        //
        // d3 requires hierarchical data for a treemap, this means that the data should be organized in a
        // tree-like structure with nodes that may have children. From the documentation:
        //
        //   Before you can compute a hierarchical layout, you need a root node. If your data
        //   is already in a hierarchical format, such as JSON, you can pass it directly to
        //   d3.hierarchy; otherwise, you can rearrange tabular data, such as comma-separated
        //   values (CSV), into a hierarchy using d3.stratify.
        var root = EFsToHierarchy();

        var efDurationSum = function (efNode) {
            if (efNode.children) {
                // Node has children, compute duration of each child
                var childSum = 0;
                for (var i = 0; i < efNode.children.length; i++) {
                    childSum += efDurationSum(efNode.children[i]);
                }
                return childSum;
            } else {
                // Node has no children, return duration value
                return efNode.data.durationMinutes;
            }
        }

        var totalTime = efDurationSum(root);

        var $totalTimeElement = $('.exele-total-time', symbolElement);
        $totalTimeElement[0].innerHTML = 'Total event time: ' + root.data.durationMinutes.toFixed(2);

        // Draw the treemap within the selected element using the data in `root`
        treemapSelection
            .datum(root)
            .call(myTreemap);
    }
}

// *********Prototypes of Exele_TreeBuilder************

Exele_TreeBuilder.prototype.Update = function(APIServer, elementPath, symbolElement, startTime, endTime, template, sizeAttribute, colorAttribute){
        // store the symbol and the apiserver as private variables in the module, we should initiallize first.
        this.SetSymbol(symbolElement);
        this.SetWebAPIURL(APIServer);
        this.SetTemplate(template);
        this.SetSizeAttribute(sizeAttribute);
        this.SetColorAttribute(colorAttribute);
        // obtain the EF data
        this.GetEFData(elementPath, startTime, endTime);
}

// get EF templates
Exele_TreeBuilder.prototype.GetEFTemplates = function () {
    return this.GetTemplates();
}

// get the Attributes provide a tepmlate
Exele_TreeBuilder.prototype.GetEFAttributeNamesFromTemplate= function(templateName){
    return this.GetEFAttributesFromTemplate(templateName)
        .map(att => att.Name)
        .sort(d3.ascending);
},

Exele_TreeBuilder.prototype.GetNumericalEFAttributeNamesFromTemplate = function (templateName) {
    // Numerical attribute types this custom symbol supports
    var numericalAttributeTypes = [
        'Double',
        'Int16',
        'Int32',
        'Int64',
        'Single'
    ];

    // Return an empty array if we don't find a match
    return this.GetEFAttributesFromTemplate(templateName)
        .filter(att => numericalAttributeTypes.indexOf(att.Type) !== -1)
        .map(att => att.Name)
        .sort(d3.ascending);
}

// JQuery method used to get data
var makeDataCall = function (url, type, data, successCallBack, errorCallBack) {
    return $.ajax({
        url: encodeURI(url),
        type: type,
        data: data,
        cache: false,
        contentType: "application/json; charset=UTF-8",
        success: successCallBack,
        error: errorCallBack
    });
};
