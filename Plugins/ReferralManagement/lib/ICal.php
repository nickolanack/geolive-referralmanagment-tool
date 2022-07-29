<?php 


namespace ReferralManagement;

class ICal{


	protected function getPlugin(){
		return GetPlugin('ReferralManagement');
	}

	public function getCalendarForUser(){




		$vCalendar = new \Eluceo\iCal\Component\Calendar('www.example.com');

		$results=($links=GetPlugin('Links'))->listDataCodesForItemName(1, "User", 'userCalendarEventsAccessToken'));
		if(count($results)==0){
			$clientToken = ($links = GetPlugin('Links'))->createDataCodeForItem(1, "User", 'userEventsAccessToken', array(
			
			));

			error_log($clientToken);
		}
	
		error_log(print_r($results, true));

		


		$list=$this->getPlugin()->getActiveProjectList(1);

		foreach ($list as $projectData) {

			

			if(!empty($projectData->attributes->commentDeadlineDate)){

				$vEvent = new \Eluceo\iCal\Component\Event();
				$vEvent
				    ->setDtStart(new \DateTime($projectData->attributes->commentDeadlineDate))
				    ->setDtEnd(new \DateTime($projectData->attributes->commentDeadlineDate))
				    ->setNoTime(true)
				    ->setSummary('Requested Response Date: '.$projectData->attributes->title);
				    ->setDescription($projectData->attributes->description);
				$vCalendar->addComponent($vEvent);

			}


			

		}


		

		header('Content-Type: text/calendar; charset=utf-8');
		header('Content-Disposition: attachment; filename="cal.ics"');

		return $vCalendar->render();
	}


}