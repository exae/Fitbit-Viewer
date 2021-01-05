
const User = ['', 'Test'];

const cardioColor = ["#70C1C3","#E5A639","#EE7E42","#E75A65"];

function loadExo(n)
{
	var FileExo = PathFitbit + "exercise-" + n + ".json";
	d3.json(FileExo, function(error, file){
		if (!error)
		{	 	
		
			file.forEach(function(d, i) {
				var exercice = { 
						lastModified: parseDate(d.lastModified),
						startTime: parseDate(d.startTime),
						activityName : d.activityName,
						averageHeartRate : d.averageHeartRate,
						calories : d.calories,
						duration : d.duration,
						steps : d.steps,
						heartRateZones : d.heartRateZones,
						activityLevel : d.activityLevel,
						elevationGain : d.elevationGain
					};
				exercices.push(exercice);		
					  
				var color = '';
				if ('heartRateZones' in d)
				{
					for(i=0; i<4; i++)
					{
						if (d.heartRateZones[i].minutes > 0)
						{
							color = cardioColor[i];
						}					
					}
				}
				$('.list-group').append('<li class="item" data-id="' + (exercices.length-1).toString() + '">' + formatDMY(parseDate(d.startTime)) +'<span class="ms">' + mstomin(d.duration) + '</span>'
						+ '<span class="badge" style="background-color:' + color + '">' + d.activityName + '</span></li>');
			});
			
			$('.item').on('click', function() {
				var exo = $(this).data('id');
				var exercice = exercices[exo];		
				chartFitbit.displayChart(exercice);
				
			    $('.active').removeClass('active');
			    $(this).toggleClass('active')
			});
			loadExo(n + 100);
		}
		else
		{
			console.log(exercices.length + ' exercices');
		}
		
	});
}

var exercices = [];
var PathFitbit = '';

$(document).ready(function() {
	$('#user').change(function(){ 
	    var selected = $(this).val();
	    PathFitbit = 'data\\' + User[selected] + '\\Physical Activity\\';
	    exercices = [];	    
	    console.log(PathFitbit);
	    $('.list-group').text('');
	    loadExo(0);
	});	
	chartFitbit = new ChartFitbit();	
});
