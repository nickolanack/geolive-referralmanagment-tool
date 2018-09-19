<?php

namespace ReferralManagement;

class Deployment{

	protected $parameters;

	public function fromParameters($params){
		$this->parameters=$params;
		return $this;
	}

	public function respondToEmailRequest(){


		GetPlugin('Email')->getMailer()
			->mail('Request to Create Dashboard', json_encode($this->parameters, JSON_PRETTY_PRINT))
			->to('nickblackwell82@gmail.com')
			->send();


		GetPlugin('Email')->getMailerWithTemplate('dashboard.request.reply',$this->parameters)
			->to($this->parameters->data->email)
			->send();

		return $this;
	}


	public function deployToElasticBeanstalk(){


		
	}

}