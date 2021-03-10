/**
 * Not used
 */


var ItemTimeTracking=(function(){


	var ItemTimeTracking=new Class({

		getTotalUserHoursThisMonth: function() {
			var me = this;
			var count = 0;
			me.getUserHoursDataThisMonth().forEach(function(d) {
				count = count + d.value;
			});
			return Math.round(count * 10) / 10;

		},
		getUserHoursDataThisMonth: function() {

			var me = this;
			if (typeof me._getUserHoursDataThisMonth == "undefined") {

				var data = [



				]
				var today = (new Date()).getDate();
				var i;
				for (i = -today + 1; i <= 0; i++) {
					data.push((function() {
						var day = (new Date((new Date()).valueOf() + (i * 24 * 3600 * 1000)));
						var d = {
							label: day.getDate(),
							value: (day.getDay() == 0 || day.getDay() == 6) ? 0 : Math.min(8, (Math.random() * 16)) + (Math.random() * 8)
						}
						return d;

					})())
				}

				data[data.length - 1]["class"] = "active";
				var day = (new Date((new Date()).valueOf() + (i * 24 * 3600 * 1000)));
				while (day.getDate() > 1) {
					data.push((function() {

						var d = {
							label: day.getDate(),
							value: 0
						}
						return d;

					})())
					i++;
					var day = (new Date((new Date()).valueOf() + (i * 24 * 3600 * 1000)));
				}


				// var day=today;
				// while(day>1){
				// 	data.push((function(){
				//         var day=(new Date((new Date()).valueOf()+(i*24*3600*1000)));
				//         var d={
				//            label:day.getDate(),
				//            value:(day.getDay()==0||day.getDay()==6)?0:Math.min(8,(Math.random()*16))+(Math.random()*8)
				//         }
				//         return d;
				//     })())
				// }

				data[0]["class"] = "trans";
				//data[data.length-1]["class"]="active";
				//
				//
				me._getUserHoursDataThisMonth = data;
			}
			return me._getUserHoursDataThisMonth;

		},
		getUserHoursDataLast2Weeks: function() {

			var data = [



			]
			for (var i = -13; i <= 0; i++) {
				data.push((function() {
					var day = (new Date((new Date()).valueOf() + (i * 24 * 3600 * 1000)));
					var d = {
						label: day.getDate(),
						value: (day.getDay() == 0 || day.getDay() == 6) ? 0 : Math.min(8, (Math.random() * 16)) + (Math.random() * 8)
					}


					return d;

				})())
			}
			data[0]["class"] = "trans";
			data[data.length - 1]["class"] = "active";

			return data;


		},

	});

	return ItemTimeTracking;



})()