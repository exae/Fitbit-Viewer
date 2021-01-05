const cardioGradient = [
	{value:0,   color: "#70C1C3"},     	
	{value:86,  color: "#70C1C3"},     // cyan
	{value:87,  color: "#E5A639"},     // orange
	{value:121, color: "#E5A639"},     // orange
	{value:122, color: "#EE7E42"},     // ornage foncé	
	{value:147, color: "#EE7E42"},     // ornage foncé
	{value:148, color: "#E75A65"},     // rouge clair	
	{value:180, color: "#E75A65"},     // rouge clair
	{value:300, color: "#FF0000"}      // rouge
	]

var parseDate = d3.timeParse("%m/%d/%y %H:%M:%S");

var formatFile = d3.timeFormat("%Y-%m-%d");
var formatDMY = d3.timeFormat("%d.%m.%Y");
var formatDMYHS = d3.timeFormat("%d.%m.%Y %H:%M");

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function mstomin(d)
{
	var minutes = Math.floor(d/60000);
	if (minutes > 60)
	{
		var heures = Math.floor(minutes/60);
		minutes = (minutes % 60).toFixed();
		return  heures + "h" + pad(minutes,2);
	}
	else
	{	
		var seconds = +((d % 60000)/1000).toFixed(0);		
		return minutes + ":" + pad(seconds, 2);		
	}
}		    		 

class ToolTips 
{
	constructor(svg)
	{
	    this.tooltip = svg.append("g")
	        .attr("id", "tooltip")
	        .style("display", "none");

	    this.tooltip.append("polyline")
	    	.attr("id", "tooltip-poly")
	        .attr("points","15,0 0,10 15,20 35,20 35,0 15,0") 
	        .style("fill", "red")
	        .style("stroke","white")
	        .style("opacity","0.9")
	        .style("stroke-width","2")	        
	        .attr("transform", "translate(0, -10)");
	    
	    this.tooltip.append("text")
	    	.attr("id", "tooltip-bpm")
	        .attr("dx", "32")
	        .attr("dy", "3")
	        .style("text-anchor", "end");
	}
	
	move(x,y)
	{
	    this.tooltip.attr("transform", "translate(" + x + "," + y + ")");
	}
	
	backgroundcolor(color)
	{
	    d3.select('#tooltip-poly').style("fill", color); 
	}
	
	hide()
	{
		this.tooltip.style("display", "none");		
	}
	
	nul()
	{	
		this.tooltip.style("display", null);
	}
	
	text(value)
	{
	    d3.select('#tooltip-bpm').text(value);
	}
}

class LinearGradient {
	
	constructor()
	{
		this.fillurl = '';
	}
	
	setRange(svg, id, range_color, y)
	{
		this.fillurl = 'url(#' + id + ')';
											
		var ext = d3.extent(range_color,function(d) {return d.value});		
		
		svg.append("defs")
			.append("linearGradient")
			.attr("id", id)
			.attr("gradientUnits", "userSpaceOnUse")
    		.attr("x1", 0).attr("y1", y(ext[0]))			
    		.attr("x2", 0).attr("y2", y(ext[1]))	    		
 			.selectAll("stop") 			
    		.data(range_color)	
    		.enter().append("stop")			
		    .attr("offset", function(d) {
		    	var num = Math.trunc( 100 / (ext[1] - ext[0]) * (d.value - ext[0]) );						
				return num.toString() + "%";	
		    	})	
		    .attr("stop-color", function(d) { return d.color; });				
	}
}

class ChartFitbit {
	
	constructor()
	{
		this.data = [];
		this.loading = false;
	}

	loaddata()
	{
		var _this = this;
		var filename = PathFitbit + "heart_rate-" + formatFile(_this.exo.startTime) + ".json";
		if (this.loading) return;
		this.loading = true;
		this.data = [];				
		console.log('load ' + filename);

		d3.select(".chart").text('');
		
		d3.json(filename, function(error, file){
			if(error)
			{
				d3.select("#info").text('File not found ' + filename);
			}
			else
			{
				d3.select("#info").text('');				
				file.forEach(function(d) {
					_this.data.push({ date: parseDate(d.dateTime), bpm: +d.value.bpm });
				});					
				_this.data = _this.data.filter( function(d) { return ((d.date > _this.exo.startTime) && (d.date < _this.exo.lastModified)) ; });
				_this.drawChart();
			}
			
			_this.loading = false;
		});
	}

	displayChart(exercice) 
	{
		var ww = $(".chart").width();
		var hh = $(".chart").height();
		this.margin = {top: 40, right: 20, bottom: 70, left: 40},
				this.width = ww - this.margin.left - this.margin.right,
				this.height = hh - this.margin.top - this.margin.bottom;
		//
		this.x = d3.scaleTime().range([0, this.width]);
		this.y = d3.scaleLinear().range([this.height, 0]);
		
		this.exo = exercice;		
		this.loaddata();
	}

	addLegend()
	{
	    const legendSize = 20;
	    var _this = this;
	    
	    if (this.exo.heartRateZones == undefined) return;
	    
        var legends = this.svg.selectAll('.legend')
          .data(this.exo.heartRateZones)
          .enter()
          .append('g')
          .attr('class', 'legend')
          .attr('transform', function(_, i) 
           {
        	  // On aligne la légende sur le bord droit
        	  var h = i * legendSize + _this.margin.top + 4;
        	  return 'translate(' + _this.width + ',' + h + ')';
           });

        // legende rectangle
        legends.append('rect')
          .attr('x', - legendSize)
          .attr('width', legendSize) 
          .attr('height', legendSize)
          .style('fill', function(_,i){return cardioColor[i] });

        // legende texte
        legends.append('text')
          .attr('x', - legendSize -4)
          .attr('y', 14)
          .style("text-anchor", "end")
          .style('fill', function(_,i){return cardioColor[i] })
          .text(function(d){return d.name});

        // legende minutes
        legends.append('text')
        	.attr('x', - legendSize / 2 )
        	.attr('y', 14)
        	.attr('fill', 'white')
        	.attr('fill-weight', 'bold')
        	.style("text-anchor", "middle")
        	.text(function(d){ return d.minutes } );   
	}
	
	addDataMax()
	{
		var _this = this;
	    var max = d3.max(this.data,function(d) { return +d.bpm});		
		var datamax = this.data.filter( function(d) { return (d.bpm == max); });
		if (datamax.length == 0) return;
		
    	// Les maxs
		this.svg.selectAll(".dot")
    		.data(datamax)
    		.enter()
			.append('circle')
			.attr("cx", function(d) { return _this.x(d.date); })		 
			.attr("cy", function(d) { return _this.y(d.bpm); })		
			.attr("fill", "red")			
			.style("opacity", 1)				
			.attr('r', 2);
		
		var lastmax = datamax[datamax.length-1];

		this.svg.append("text")
			.attr("class", "textmax")
			.attr('fill-weight', 'bold')			
			.style("fill", function() { return _this.getColor(lastmax.bpm); })			
			.attr("x", function() { return _this.x(lastmax.date) + 5; })		 
			.attr("y", function() { return _this.y(lastmax.bpm); })
			.text(function() { return 'max:' + lastmax.bpm + ' bpm'; });
    	
	}

	getColor(val)
	{
    	for (var i = 0; i < cardioGradient.length; i++) {
  		  if (cardioGradient[i].value > val) 
  		  {
  			  return cardioGradient[i].color;
  		  }
    	}
	}

	drawChart() 
	{
	
		var _this = this;
		
		if (this.data.length == 0) return;
	    		
		this.x.domain(d3.extent(this.data, function(d) { return d.date; }));
		this.y.domain(d3.extent(this.data, function(d) { return d.bpm; }));
					
		var xAxis = d3.axisBottom(this.x)
		    .tickFormat(d3.timeFormat("%H:%M"))
		    .ticks(24);
		    
		var yAxis = d3.axisLeft(this.y)
			.tickSizeInner(-this.width)  // pointillés
		    .ticks(10);
					
		this.svg = d3.select(".chart")
			.append("svg")
		    .attr("width", this.width + this.margin.left + this.margin.right)
		    .attr("height", this.height + this.margin.top + this.margin.bottom)
		  	.append("g")
		    .attr("transform",
		          "translate(" + this.margin.left + "," + this.margin.top + ")");
		
		var line = d3.line()
			.curve(d3.curveMonotoneX)
			.x(function(d) { return _this.x(d.date); })
			.y(function(d) { return _this.y(d.bpm); });			
		
		var lineargradient = new LinearGradient();	
		lineargradient.setRange(this.svg, 'cardio-gradient', cardioGradient, this.y);
		
	  // axe X
	  this.svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + this.height + ")")
	      .call(xAxis)
	  	  .selectAll("text")
	      .style("text-anchor", "end")
	      .attr("dx", "-.8em")
	      .attr("dy", "-.55em")
	      .attr("transform", "rotate(-90)" );
	
	  // axe Y
	  this.svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	      .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Bpm");
	
	  // Courbe
	  this.svg.append("path")
			.datum(this.data)
			.attr("class", "line")
		    .attr("stroke", lineargradient.fillurl)
			.attr("d", line);

		this.addLegend();

        // activité + jour
		this.svg.append("text")
    		.attr("x", this.width)
			.attr("y", this.height - 4)
			.attr("text-anchor", "end")    	    		
            .text(this.exo.activityName + ' : ' + formatDMY(this.exo.startTime));

    	// durée
		var v = d3.extent(this.data, function(d) { return d.date; });
		var totale = v[1]-v[0];
		
		this.svg.append("text")
    		.attr("x", this.width)
    		.attr("y", this.margin.top)
    		.attr("text-anchor", "end")    	    		
    		.text(mstomin(totale));

    	this.addDataMax();
    	
    	// titre
		var mean = d3.mean(this.data,function(d) {return +d.bpm}).toFixed(0);
		if (mean == undefined) return;     	
    	this.svg.append("text")
			.attr("class", "title")
			.attr("x", this.width/2)
			.attr("y", -14)
			.attr("text-anchor", "middle")    	
			.text(mean + ' bpm');
    	
    	this.bisectDate = d3.bisector(d => d.date).left;
    	
    	this.tooltip = new ToolTips(this.svg);
    	
    	this.svg.append("rect")
	        .attr("class", "overlay")
	        .attr("width", this.width)
	        .attr("height", this.height)
	        .on("mouseover", function() { _this.tooltip.nul(); })
	        .on("mouseout", function() { _this.tooltip.hide(); })
	        .on("mousemove", function() 
	        {
	    		var coords = d3.mouse(d3.event.target);	
	    	    var x0 = _this.x.invert(coords[0]);
	    	    var i = _this.bisectDate(_this.data, x0);
	    	    var d = _this.data[i];
	    	    
	    	    _this.tooltip.move(_this.x(d.date), _this.y(d.bpm));
	    	    _this.tooltip.backgroundcolor(_this.getColor(d.bpm));
	    	    _this.tooltip.text(d.bpm)
	        });    	
	}	
}

console.log(mstomin(59000));     // 0:59
console.log(mstomin(60000));     // 1:00  60 x 1000
console.log(mstomin(61000));     // 1:01
console.log(mstomin(60 * 60000));     // 1:01
console.log(mstomin(60 * 60000 + 60000 ));     // 1:01
                    