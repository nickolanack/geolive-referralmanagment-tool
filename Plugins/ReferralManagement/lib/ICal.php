<?php 


namespace ReferralManagement;

class ICal{


	protected function getPlugin(){
		return GetPlugin('ReferralManagement');
	}

	public function getCalendarForUser($userid){




		$vCalendar = new \Eluceo\iCal\Component\Calendar('www.example.com');


	
		
		


		$list=$this->getPlugin()->getActiveProjectList($userid);

		foreach ($list as $projectData) {

			

			if(!empty($projectData->attributes->commentDeadlineDate)){

				$vEvent = new \Eluceo\iCal\Component\Event();
				$vEvent
				    ->setDtStart(new \DateTime($projectData->attributes->commentDeadlineDate))
				    ->setDtEnd(new \DateTime($projectData->attributes->commentDeadlineDate))
				    ->setNoTime(true)
				    ->setSummary('Requested Response Date: '.$projectData->attributes->title)
				    ->setDescription($projectData->attributes->description);
				$vCalendar->addComponent($vEvent);

			}


			

		}


		

		header('Content-Type: text/calendar; charset=utf-8');
		header('Content-Disposition: attachment; filename="cal.ics"');

		return $vCalendar->render();
	}


}