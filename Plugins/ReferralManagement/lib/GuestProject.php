<?php

namespace ReferralManagement;


class GuestProject{



	public function createProjectActivation(){


		$clientToken = ($links = GetPlugin('Links'))->createLinkEventCode('onActivateEmailForGuestProposal', array(
			'validationData' => $json,
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


	}



	public function activateProject($params){


		if (key_exists('validationData', $params) && key_exists('token', $params->validationData)) {
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



				$clientToken = ($links = GetPlugin('Links'))->createDataCode('projectAccessToken', array(
					'id'=>$id,
					"email" => $params->validationData->email
				));

				$clientLink = HtmlDocument()->website() . '/proposal/'.$id.'/' . $clientToken;


				$subject = (new \core\Template(
					'proponent.proposal.link.email.subject', "Your proposal has been submitted successfully"))
					->render(GetClient()->getUserMetadata());
				$body = (new \core\Template(
					'proponent.proposal.link.email.body', "You can view the status of your proposal here: <a href=\"{{link}}\" >Click Here</a>"))
					->render(array_merge(GetClient()->getUserMetadata(), array("link" => $clientLink)));

				GetPlugin('Email')->getMailer()
					->mail($subject, $body)
					->to($params->validationData->email)
					->send();



				$this->getPlugin()->notifier()->onGuestProposal($id, $params);

				GetPlugin('Attributes');
				if (key_exists('attributes', $data->proposalData)) {
					foreach ($data->proposalData->attributes as $table => $fields) {
						(new attributes\Record($table))->setValues($id, 'ReferralManagement.proposal', $fields);
					}
				}

				Emit('onCreateProposalForGuest', array(
					'params' => $params,
					'proposalData' => $data,
				));

				Emit('onCreateProposal', array('id' => $id));

			}

		}


	}



	protected function getPlugin(){
		return GetPlugin('ReferralManagement');
	}





}
