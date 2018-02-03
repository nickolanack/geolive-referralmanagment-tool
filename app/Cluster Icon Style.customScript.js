var config=<?php 

$parameters=array();
$widget=GetWidget('cluster-config');
foreach ($widget->getConfigurationParameters() as $key => $field) {
			$parameters[$key]=$widget->getParameter($key);
		}


echo json_encode($parameters);

?>;


if (window.Cluster) {
	Cluster.Symbol = ClusterSymbol;
	ClusterSymbol.IconScale = function(sum) {
		return 20 + (5 * Math.log(sum) / Math.log(2));
	};
	ClusterSymbol.IconStyle = function(name) {

		var color="rgb(0, 160, 80)";
        var cluster=this.cluster_;
        if(cluster&&cluster.markers_&&cluster.markers_.length){
            var type=('layer-'+cluster.markers_[0]._layerid);
            if(config[type]){
                color=config[type]
            }
        }
    	   


		//expect to be bound to ClusterSymbol object
		if (name == "hover") {

			return {
				path: google.maps.SymbolPath.CIRCLE,
				fillColor: color,
				fillOpacity: 0.7,
				strokeWeight: 1.5,
				strokeColor: color,
				labelOrigin: google.maps.Point(0, 0)
			};


		} else {


			return {
				path: google.maps.SymbolPath.CIRCLE,
				fillColor: color,
				fillOpacity: 0.4,
				strokeWeight: 1.5,
				strokeColor: color,
				labelOrigin: google.maps.Point(0, 0)

			};

		}

	};
} else {
	setTimeout(start, 100);
}