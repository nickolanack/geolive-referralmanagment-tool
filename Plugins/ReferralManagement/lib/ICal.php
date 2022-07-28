<?php 


namespace ReferralManagement;

class ICal{


	protected function getPlugin(){
		return GetPlugin('ReferralManagement');
	}

	public function getCalendarForUser(){




		$vCalendar = new \Eluceo\iCal\Component\Calendar('www.example.com');
		

		$list=$this->getPlugin()->getActiveProjectList(1);

		foreach ($list as $projectData) {

			$vEvent = new \Eluceo\iCal\Component\Event();

			error_log($projectData->attributes->commentDeadlineDate);

			
			$vEvent
			    ->setDtStart(new \DateTime($projectData->attributes->commentDeadlineDate))
			    ->setDtEnd(new \DateTime($projectData->attributes->commentDeadlineDate))
			    ->setNoTime(true)
			    ->setSummary('Requested Response Date: '.$projectData->attributes->title);

			$vCalendar->addComponent($vEvent);

		}


		

		header('Content-Type: text/calendar; charset=utf-8');
		header('Content-Disposition: attachment; filename="cal.ics"');

		return $vCalendar->render();
	}


}