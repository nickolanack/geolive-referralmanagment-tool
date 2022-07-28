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

		
			$vEvent
			    ->setDtStart(new \DateTime('2012-12-24'))
			    ->setDtEnd(new \DateTime('2012-12-24'))
			    ->setNoTime(true)
			    ->setSummary($projectData->attributes->title);

			$vCalendar->addComponent($vEvent);

		}


		

		header('Content-Type: text/calendar; charset=utf-8');
		header('Content-Disposition: attachment; filename="cal.ics"');

		return $vCalendar->render();
	}


}