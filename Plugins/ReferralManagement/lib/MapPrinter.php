<?php


namespace ReferralManagement;

class MapPrinter{




	public function getImageUrl($id, $printToken=null){

		if(empty($printToken)){

			$tokens=GetPlugin('Links')->listDataCodesForItem($id, "ReferralManagement.proposal");
	
			foreach($tokens as $accessToken){
				if($accessToken->name=='projectPrintToken'){
					$printToken=$accessToken->token;
					break;
				}
			}


			if(empty($printToken)){

				//make one if not exists

				$printToken = ($links = GetPlugin('Links'))->createDataCodeForItem($id, "ReferralManagement.proposal", 'projectPrintToken', array(
					'id' => $id,
					"creator" =>'MapPrinter'
				));

			}

		}



		$data=json_decode(file_get_contents('https://jobs.geoforms.ca/php-core-app/core.php?task=user_function&format=ajax&json='.
			json_encode(array(
				"widget"=>"getScreenShot",
				"domain"=>HtmlDocument()->getDomain(),
				"project"=>$id,
				"token"=>$printToken
			))
		));


		return $data;


	}



}