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
				    ->setDescription($projectData->attributes->description)
				    ->setCategories(['response dates']);
				$vCalendar->addComponent($vEvent);

			}


			foreach($projectData->tasks as $taskData){


				if(!empty($taskData->dueDate)){


					$dueDate=explode(' ', $taskData->dueDate);
					$dueDate=array_shift($dueDate);
					

					$vEvent = new \Eluceo\iCal\Component\Event();
					$vEvent
					    ->setDtStart(new \DateTime($dueDate))
					    ->setDtEnd(new \DateTime($dueDate))
					    ->setNoTime(true)
					    ->setSummary('Project Task Due: '.$taskData->name)
					    ->setDescription($projectData->attributes->title."\n\n".$taskData->description)
					    ->setCategories(['task due dates']);

					if($taskData->complete===true){
						$vEvent->setStatus('CANCELLED');
					}

					$vCalendar->addComponent($vEvent);

				}


			}


			

		}


		

		header('Content-Type: text/calendar; charset=utf-8');
		header('Content-Disposition: attachment; filename="cal.ics"');

		return $vCalendar->render();
	}


}