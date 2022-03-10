<?php 

namespace ReferralManagement;


class TusImportTask{


	public function import($params){


		GetPlugin('Maps');
		GetPlugin('Attributes');

		include_once GetPath('{plugins}/Maps/lib/KmlDocument.php');
		include_once GetPath('{plugins}/Maps/lib/SpatialFile.php');
		include_once __DIR__.'/TusImport.php';


		$taskIndentifier=$params->taskIndentifier;
		$longTaskProgress=new \core\LongTaskProgress($taskIndentifier);

		$longTaskProgress->setActivity('Importing TUS From Kml');

		set_time_limit(300);
		$features=($importer=new \TusImport($longTaskProgress))->fromKml(\SpatialFile::Open(PathFrom($params->data[0])));



		$codeCounter=0;
		$longTaskProgress->setTaskActivityHandler(function()use($features, &$codeCounter){
			return array('total'=>count($features), 'progress'=>$codeCounter);
		}, 'coding');
	
		foreach ($features as $feature) {


			$feature->setLayerId($importer->parseLayer($feature));
			if($feature instanceof \Marker){
				$feature->setIcon($importer->parseIcon($feature));
			}
			if($feature instanceof \Line){
				
			}
			if($feature instanceof \Polygon){
				
			}
	
			$codeCounter++;
			$longTaskProgress->check();

			
		}

		$savingCounter=0;
		$longTaskProgress->setTaskActivityHandler(function()use($features, &$savingCounter){
			return array('total'=>count($features), 'progress'=>$savingCounter);
		}, 'saving');

		foreach ($features as $feature) {

			//$existingFeature = (new \spatial\FeatureLoader())->fromName(($feature->getName());
			//if($existingFeature){


			//}
			if ($feature->getId() <= 0) {
				//(new \spatial\FeatureLoader())->save($feature);
			}

			$savingCounter++;
			$longTaskProgress->check();

		}

		

		$attributesCounter=0;
		$longTaskProgress->setTaskActivityHandler(function()use($features, &$attributesCounter){
			return array('total'=>count($features), 'progress'=>$attributesCounter);
		}, 'attributes');
		foreach ($features as $feature) {
			
			$attributes=$importer->parseAttributes($feature);
			//(new \attributes\Record('featureAttributes'))->setValues($feature->getId(), $feature->getType(), $attributes);
		
			$attributesCounter++;
			$longTaskProgress->check();
		}




		return $longTaskProgress->complete();



	}



}