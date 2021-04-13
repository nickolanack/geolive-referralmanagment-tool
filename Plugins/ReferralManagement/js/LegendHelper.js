'use strict';

var LegendHelper=(function(){

	var legends=[];


	var LegendHelper=new Class({



		addLegend:function(legend){
			legends.push(legend);


			legend.addEvent("maximize",function(){

				legends.forEach(function(l){

					if(l!==legend){
						l.minimize();
					}

				});


			})


		}





	});





	return new LegendHelper();


})();