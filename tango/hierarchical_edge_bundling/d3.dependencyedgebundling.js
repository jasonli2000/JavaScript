d3.chart = d3.chart || {};

/**
 * Dependency edge bundling chart for d3.js
 *
 * Usage:
 * var chart = d3.chart.dependencyedgebundling();
 * d3.select('#chart_placeholder')
 *   .datum({
 *      packageNames: [the name of the packages in the matrix],
 *      matrix: [your dependency matrix]
 *   })
 *   .call(chart);
 *
 * // Data must be a matrix of dependencies. The first item must be the main package.
 * // For instance, if the main package depends on packages A and B, and package A
 * // also depends on package B, you should build the data as follows:
 *
 * var data = {
 *   packageNames: ['Main', 'A', 'B'],
 *   matrix: [[0, 1, 1], // Main depends on A and B
 *            [0, 0, 1], // A depends on B
 *            [0, 0, 0]] // B doesn't depend on A or Main
 * };
 *
 * // You can customize the chart width, margin (used to display package names),
 * // and padding (separating groups in the wheel)
 * var chart = d3.chart.dependencyedgebundling().width(700).margin(150).padding(.02);
 *
 * @author François Zaninotto
 * @license MIT
 * @see https://github.com/fzaninotto/DependencyWheel for complete source and license
 */
d3.chart.dependencyedgebundling = function(options) {

  var diameter = 920;
  var radius = diameter / 2;
  var innerRadius = radius - 204;
  
 
  // Lazily construct the package hierarchy
  var packageHierarchy = function (classes) {
    var map = {};
    
    function setparent(name, data) {
      var node = map[name];
      if (!node) {
        node = map[name] = data || {name: name, children: []};
        if (name.length) {
          node.parent = map[""];
          node.parent.children.push(node);
          node.key = name;
        }
      }
    }
    
    setparent("", null);
    classes.forEach(function(d) {
      setparent(d.name, d);
    });

    return map[""];
  }

  // Return a list of depends for the given array of nodes.
  var packageDepends = function (nodes) {
    var map = {},
        depends = [];

    // Compute a map from name to node.
    nodes.forEach(function(d) {
      map[d.name] = d;
    });

    // For each dependency, construct a link from the source to target node.
    nodes.forEach(function(d) {
      if (d.depends) d.depends.forEach(function(i) {
        depends.push({source: map[d.name], target: map[i]});
      });
    });

    return depends;
  }

  function chart(selection) {
    selection.each(function(data) {
      
      var root = data;
      // create the layout
      var cluster =  d3.layout.cluster()
        .size([360, innerRadius])
        .sort(null)
        .value(function(d) {return d.size; });

      var bundle = d3.layout.bundle();

      var line = d3.svg.line.radial()
          .interpolate("bundle")
          .tension(.9)
          .radius(function(d) { return d.y; })
          .angle(function(d) { return d.x / 180 * Math.PI; });

      var svg = d3.select("body").append("svg")
          .attr("width", diameter)
          .attr("height", diameter)
        .append("g")
          .attr("transform", "translate(" + radius + "," + radius + ")");
      
      // get all the link and node
      var link = svg.append("g").selectAll(".link"),
          node = svg.append("g").selectAll(".node");

      var nodes = cluster.nodes(packageHierarchy(root)),
          links = packageDepends(nodes);

      link = link
          .data(bundle(links))
        .enter().append("path")
          .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
          .attr("class", "link")
          .attr("d", line);

      node = node
          .data(nodes.filter(function(n) { return !n.children; }))
        .enter().append("text")
          .attr("class", "node")
          .attr("dy", ".31em")
          .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
          .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
          .text(function(d) { return d.key; })
          .on("mouseover", mouseovered)
          .on("mouseout", mouseouted);
       
      function mouseovered(d) {

        node
            .each(function(n) { n.target = n.source = false; });

        link
            .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
            .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
          .filter(function(l) { return l.target === d || l.source === d; })
            .each(function() { this.parentNode.appendChild(this); });

        node
            .classed("node--target", function(n) { return n.target; })
            .classed("node--source", function(n) { return n.source; });

      }

      function mouseouted(d) {
        link
            .classed("link--target", false)
            .classed("link--source", false);

        node
            .classed("node--target", false)
            .classed("node--source", false);

      }

    });
  }

  chart.diameter = function(value) {
    if (!arguments.length) return diameter;
    diameter = value;
    return chart;
  };

  chart.radius = function(value) {
    if (!arguments.length) return radius;
    radius = value;
    return chart;
  };

  chart.innerRadius = function(value) {
    if (!arguments.length) return innerRadius;
    innerRadius = value;
    return chart;
  };

  return chart;
};
