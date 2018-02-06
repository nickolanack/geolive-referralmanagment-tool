<?php 

//print_r($this->getParameter('layer'));
IncludeJSBlock('


	if(window.parent.GrabImage){
		window.parent.GrabImage('.json_encode(UrlFrom($this->getParameter('layer'))).');
	}

');