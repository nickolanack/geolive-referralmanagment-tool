<?php 


namespace ReferralManagement;

class ICal{


	protected function getPlugin(){
		return GetPlugin('ReferralManagement');
	}

	public function getCalendarForUser(){




		$vCalendar = new \Eluceo\iCal\Component\Calendar('www.example.com');
		$vEvent = new \Eluceo\iCal\Component\Event();


		$list=$this->getPlugin()->getActiveProjectList(1);
		error_log(print_r($list, true));

		$vEvent
		    ->setDtStart(new \DateTime('2012-12-24'))
		    ->setDtEnd(new \DateTime('2012-12-24'))
		    ->setNoTime(true)
		    ->setSummary('Christmas');

		$vCalendar->addComponent($vEvent);

		header('Content-Type: text/calendar; charset=utf-8');
		header('Content-Disposition: attachment; filename="cal.ics"');

		return $vCalendar->render();
	}


}