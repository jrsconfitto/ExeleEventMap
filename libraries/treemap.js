// Treemap function that returns a treemap!
//
// Much of this is formed on the foundation of Mike Bostock's wonderful
// Towards Reusable Charts article: https://bost.ocks.org/mike/chart/
treemap = function () {
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
        return treemap;
    };

    function treemap(selection) {
        selection.each(function (data, i) {
            // Use `.get(0)` to get the actual element referenced by the jQuery object and pass it into d3's
            // `select` function. d3 and jQuery don't always play along perfectly.
            var fader = function (color) { return d3.interpolateRgb(color, "#fff")(0.2); },
                color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
                format = d3.format(",d");

            // Put it into a d3 treemap
            var treemap = d3.treemap()
                .tile(d3.treemapResquarify)
                .size([width, height])
                .round(true)
                .paddingInner(1);

            console.log("Using the following data", data);

            // Format the data for use in the treemap
            treemap(data);

            console.log("Using other data", data);
                        
            var svg = d3.select(this);
                        
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
//                     GetSingleEFAttributes(efID);
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

//             d3.selectAll('input[type="radio"]')
//                 .data([sumByDuration, sumByCount], function (d) {
//                     return d ? d.name : this.value;
//                 })
//                 .on('change', function (sumFunc) {
//                     treemap(root.sum(sumFunc));

//                     cell.transition()
//                           .duration(250)
//                           .attr("transform", function (d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
//                         .select("rect")
//                           .attr("width", function (d) { return d.x1 - d.x0; })
//                           .attr("height", function (d) { return d.y1 - d.y0; });
//                 });
        });
    }

    // Return a treemap function that someone can call to add data to
    return treemap;
}