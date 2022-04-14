<?php

namespace ReferralManagement;


class DataDiff{


	public function diff($fromData, $toData){

		$recursive=false;


		$fromData=json_decode(json_encode($fromData));
		$toData=json_decode(json_encode($toData));


		file_put_contents(__DIR__.'/data_diff.json', json_encode(array(
			'from'=>$fromData,
			'to'=>$toData
		)));
		


		if(is_object($fromData)){
			$fromData=get_object_vars($fromData);
		}

		if(is_object($toData)){
			$toData=get_object_vars($toData);
		}

		$changedArray=array();
		$updateArray=array();


		


		$newKeys=array_values(array_diff(array_keys($toData), array_keys($fromData)));
		foreach($newKeys as $key){
			$changedArray[$key]=null;
			$updateArray[$key]=$toData[$key];
		}
		$removedKeys=array_values(array_diff(array_keys($fromData), array_keys($toData)));
		foreach($removedKeys as $key){
			$changedArray[$key]=$fromData[$key];
			$updateArray[$key]=null;
		}
	

		$intersect=array_values(array_intersect(array_keys($toData), array_keys($fromData)));
		foreach($intersect as $key){
			
			if(gettype($toData[$key])!=gettype($fromData[$key])){
				$changedArray[$key]=$fromData[$key];
				$updateArray[$key]=$toData[$key];
				continue;
			}

			if((!$recursive)&&(is_object($toData[$key])||is_array($toData[$key]))){

				if(json_encode($toData[$key])!=json_encode($fromData[$key])){
					$changedArray[$key]=$fromData[$key];
					$updateArray[$key]=$toData[$key];
				}

				continue;
			}
		

			if($toData[$key]!=$fromData[$key]){
				$changedArray[$key]=$fromData[$key];
				$updateArray[$key]=$toData[$key];
			}

		}


		error_log(json_encode(array($changedArray, $updateArray)));

	}





}