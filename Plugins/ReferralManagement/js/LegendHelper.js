'use strict';

var LegendHelper=(function(){

	var legends=[];


	var LegendHelper=new Class({



		addLegend:function(legend, map){
			legends.push(legend);


			legend.addEvent("maximize",function(){

				legends.forEach(function(l){

					if(l!==legend){
						l.minimize();
					}

				});


			})


		},
		getLegends:function(){
			return legends.slice(0);
		}





	});





	return new LegendHelper();


})();