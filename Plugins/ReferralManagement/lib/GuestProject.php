<?php

namespace ReferralManagement;


class GuestProject{



	public function createProjectActivation($json){



		return (new \core\LongTaskProgress())->executeActivity(
			'Sending Email Validation',
			function ($longTaskProgress) use ($json) {


				$clientToken = ($links = GetPlugin('Links'))->createLinkEventCode('onActivateEmailForGuestProposal', array(
					'validationData' => $json,
					'subscription'=>$longTaskProgress->getSubscription()
				));

				$clientLink = HtmlDocument()->website() . '/' . $links->actionUrlForToken($clientToken);

				$subject = (new \core\Template(
					'activate.proposal.email.subject', "Verify your email address to submit your proposal"))
					->render(GetClient()->getUserMetadata());
				$body = (new \core\Template(
					'activate.proposal.email.body', "Its almost done, just click the link to continue: <a href=\"{{link}}\" >Click Here</a>"))
					->render(array_merge(GetClient()->getUserMetadata(), array("link" => $clientLink)));

				GetPlugin('Email')->getMailer()
					->mail($subject, $body)
					->to($json->email)
					->send();

			$this->getPlugin()->notifier()->onGuestProjectPendingValidation($json);

		})->getSubscription();


	}



	public function activateProject($params){


		if (!(isset($params->validationData) && isset($params->validationData->token))) {
			throw new \Exception('Expected $params->validationData');
		}


		(new \core\LongTaskProgress(isset($params->subscription)?$params->subscription:null))->executeActivity(
			'Processing Submission',
			function ($longTaskProgress) use ($params) {




				$links = GetPlugin('Links');
				$tokenInfo = $links->peekDataToken($params->validationData->token);
				$data = $tokenInfo->data;

				$database = $this->getPlugin()->getDatabase();





				if (($id = (int) $database->createProposal(array(
					'user' => GetClient()->getUserId(),
					'metadata' => json_encode(array(
						"email" => $params->validationData->email
					)),
					'createdDate' => ($now = date('Y-m-d H:i:s')),
					'modifiedDate' => $now,
					'status' => 'active',
				)))) {


					GetPlugin('Attributes');
					if (isset($data->proposalData->attributes)) {
						foreach ($data->proposalData->attributes as $table => $fields) {
							(new \attributes\Record($table))->setValues($id, 'ReferralManagement.proposal', $fields);
						}
					}


					$clientToken = ($links = GetPlugin('Links'))->createDataCodeForItem($id, "ReferralManagement.proposal",'projectAccessToken', array(
						'id'=>$id,
						"email" => $params->validationData->email
					));

					



					/**
					 * Notify submitter
					 */

					$clientLink = HtmlDocument()->website() . '/proposal/'.$id.'/' . $clientToken;

					$subject = (new \core\Template(
						'proponent.proposal.link.email.subject', "Your proposal has been submitted successfully"))
						->render(array(
							'client'=>GetClient()->getUserMetadata()
						));
					$body = (new \core\Template(
						'proponent.proposal.link.email.body', "You can view the status of your proposal here: <a href=\"{{link}}\" >Click Here</a>"))
						->render(array(
							"client"=>GetClient()->getUserMetadata(),
							"link" => $clientLink,
							"data"=>$data
						));

					GetPlugin('Email')->getMailer()
						->mail($subject, $body)
						->to($params->validationData->email)
						->send();




					/**
					 * Notify moderators
					 */



					$moderators=array('nickblackwell82@gmail.com');

					foreach($moderators as $moderatorEamil){



						$subject = (new \core\Template(
							'proponent.proposal.moderator.email.subject', "A new proposal has been submitted"))
							->render(array(
								'client'=>GetClient()->getUserMetadata(),
								'data'=>$data
							));
						$body = (new \core\Template(
							'proponent.proposal.moderator.email.body', "Add information"))
							->render(array(
								'client'=>GetClient()->getUserMetadata(),
								'data'=>$data
							));

						GetPlugin('Email')->getMailer()
							->mail($subject, $body)
							->to(moderatorEamil)
							->send();

					}


					GetPlugin('Email')->getMailer()
						->mail('->-> '.$subject, htmlentities(json_encode(array('data'=>$data, 'params'=>$params))))
						->to('nickblackwell82@gmail.com')
						->send();


					$this->getPlugin()->notifier()->onGuestProposal($id, $params);

					

					Emit('onCreateProposalForGuest', array(
						'params' => $params,
						'proposalData' => $data,
					));

					Emit('onCreateProposal', array('id' => $id));

				}

			}
		);

		


	}



	protected function getPlugin(){
		return GetPlugin('ReferralManagement');
	}





}
