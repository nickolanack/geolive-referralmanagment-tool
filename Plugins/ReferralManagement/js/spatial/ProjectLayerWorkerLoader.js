var ProjectLayerWorkerLoader=(function(){

	/**
	 * this class must not be compiled into another file because it uses its own path
	 */
	var current = document.currentScript.src;

	var ProjectLayerWorkerLoader=new Class_({


			getWorker:function(){

				
				var userFunctionWorker = current.replace('ProjectLayerWorkerLoader.js', 'SpatialProjectWorker.js');

				return new Worker(userFunctionWorker);

			}


			
	});



	return new ProjectLayerWorkerLoader();


})();