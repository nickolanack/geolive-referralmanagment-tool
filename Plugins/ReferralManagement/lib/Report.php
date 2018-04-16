<?php

namespace ReferralManagement;

include_once __DIR__.'/ComputedData.php';


class Report{

	private $proposal;
	private $title;
	private $text;

	public function __construct($proposal){
		$this->proposal=$proposal;
	}

	protected function getPlugin(){
		return GetPlugin('ReferralManagement');
	}


	public function generateReport($templateName, $defaultTemplateString){


		$parser=new ComputedData();
		$template=new \core\Template($templateName, $defaultTemplateString);


		$data=$this->getPlugin()->getProposalData($this->proposal);

        $localPath=function($u){
            if(HtmlDocument()->isLocalFileUrl($u)){
                return PathFrom($u);
            }

            return $u;
        };
        $base64=function($u)use($localPath){

            $p=$localPath($u);
            if(file_exists($p)){
                $type = pathinfo($p, PATHINFO_EXTENSION);
                return 'data:image/' . $type . ';base64,' . base64_encode(file_get_contents($p));
            }

            //$type = pathinfo($p, PATHINFO_EXTENSION);
            // return 'data:image/' . $type . ';base64,' . base64_encode(file_get_contents($p));
            

            throw new \Exception('support remote?');

        };

        $data['timezone']=ini_get('date.timezone');

        if(empty($data['userdetails']['name'])){
            $data['userdetails']['name']='{name}';
        }
        if(empty($data['userdetails']['username'])){
             $data['userdetails']['username']='{username}';
        }
        if(empty($data['userdetails']['email'])){
             $data['userdetails']['email']='{email}';
        }


        $data['computed']['files']=$parser->parseProposalFiles($data);
        $data['computed']['images']=$parser->parseProposalImages($data);
        $data['computed']['spatial']=$parser->parseProposalSpatial($data);

        //$data['computed']['files']=array_map($localPath, $data['computed']['files']);
        $data['computed']['images']=array_map($base64, $data['computed']['images']);

         $data['tasks']=array_map(function($t)use($localPath, $base64, $parser){

            $t['computed']['files']=$parser->parseTaskFiles($t);
            $t['computed']['images']=$parser->parseTaskImages($t);

            //$t['computed']['files']=array_map($localPath, $t['computed']['files']);
            $t['computed']['images']=array_map($base64, $t['computed']['images']);
            return $t;

         }, $data['tasks']);


        $data['attributes']['teamMembers']=array_map(function($teamMember)use($base64, $parser){

             
        	$icon=$parser->parseUserIcon($teamMember);

             if(!empty($icon)){
                $teamMember['icon']= $base64($icon);
             }

            return $teamMember;


        }, $data['attributes']['teamMembers']);


        //die(json_encode($data, JSON_PRETTY_PRINT));
        
        $this->title=$data['attributes']['company'].'-'.$data['attributes']['title'];
        $this->text=$template->render($data);

        
        return $this;
	}


	public function renderPdf(){

		//die($text);

        // instantiate and use the dompdf class
        $dompdf = new \Dompdf\Dompdf();
        $dompdf->set_option('defaultFont', 'Helvetica');
        $dompdf->loadHtml($this->text);
        // (Optional) Setup the paper size and orientation
        $dompdf->setPaper('A4');
        // Render the HTML as PDF
        $dompdf->render();
        // Output the generated PDF to Browser
        $dompdf->stream($this->title.'-'.date('Y-m-d_H-i-s').'.pdf');



	}



}