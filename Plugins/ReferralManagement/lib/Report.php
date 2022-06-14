<?php

namespace ReferralManagement;

include_once __DIR__ . '/ComputedData.php';

class Report {

	private $proposal;
	private $title;
	private $text;

	public function __construct($proposal) {
		$this->proposal = $proposal;
	}

	protected function getPlugin() {
		return GetPlugin('ReferralManagement');
	}


	public function getReportData(){



		$parser = new ComputedData();

		$data = $this->getPlugin()->getProposalData($this->proposal);

		$localPath = function ($url) {
			if ((new \core\html\Path())->isHostedLocally($url)) {
				return PathFrom($url);
			}

			return $url;
		};
		$base64 = function ($url) use ($localPath) {

			$path = $localPath($url);
			if (file_exists($path)) {
				$type = pathinfo($path, PATHINFO_EXTENSION);
				return 'data:image/' . $type . ';base64,' . base64_encode((new \core\File())->read($path));
			}

			//$type = pathinfo($path, PATHINFO_EXTENSION);
			// return 'data:image/' . $type . ';base64,' . base64_encode((new \core\File())->read($path));

			$filename = tempnam(__DIR__, '-ext-img-');
			try {
				(new \core\File())->write($filename, (new \core\File())->read($path));
				$type = pathinfo($path, PATHINFO_EXTENSION);
				$str = 'data:image/' . $type . ';base64,' . base64_encode((new \core\File())->read($path));
				unlink($filename);
				return $str;
			} catch (\Exception $e) {

				if (file_exists($filename)) {
					unlink($filename);
				}
				throw $e;
			}

			throw new \Exception('support remote?: ' . $path);

		};

		$data['timezone'] = ini_get('date.timezone');

		if (empty($data['userdetails']['name'])) {
			$data['userdetails']['name'] = '{name}';
		}
		if (empty($data['userdetails']['username'])) {
			$data['userdetails']['username'] = '{username}';
		}
		if (empty($data['userdetails']['email'])) {
			$data['userdetails']['email'] = '{email}';
		}

		$data['computed']['files'] = $parser->parseProposalFiles($data);
		$data['computed']['images'] = $parser->parseProposalImages($data);
		$data['computed']['spatial'] = $parser->parseProposalSpatial($data);



		
	


		$data['computed']['maps']=(new \ReferralManagement\MapPrinter())->getImageUrls($data['id']);
		if(!emtpy($data['computed']['maps'])){
			$data['computed']['maps'] = array_map($base64, $data['computed']['maps']);
		}


		//$data['computed']['files']=array_map($localPath, $data['computed']['files']);
		$data['computed']['images'] = array_map($base64, $data['computed']['images']);

		$data['tasks'] = array_map(function ($task) use ($localPath, $base64, $parser) {

			$task['computed']['files'] = $parser->parseTaskFiles($task);
			$task['computed']['images'] = $parser->parseTaskImages($task);

			//$task['computed']['files']=array_map($localPath, $task['computed']['files']);
			$task['computed']['images'] = array_map($base64, $task['computed']['images']);
			return $task;

		}, $data['tasks']);

		$data['attributes']['teamMembers'] = array_map(function ($teamMember) use ($base64, $parser) {

			$icon = $parser->parseUserIcon($teamMember);

			if (!empty($icon)) {
				$teamMember->icon = $base64($icon);
			}

			return $teamMember;

		}, $data['attributes']['teamMembers']);

		$data['config'] = GetWidget('dashboardConfig')->getConfigurationValues();

		//die(json_encode($data, JSON_PRETTY_PRINT));

		return $data;

	}


	public function generateReport($templateName, $defaultContent) {

		


		$template=null;

		foreach(GetWidget('reportTemplates')->getConfigurationValue('templatesData', array()) as $reportTemplate){
			if($reportTemplate->name===$templateName){

				$template=new \core\TemplateRenderer($reportTemplate->content);
			}
		}


		if(is_null($template)){
			$template = new \core\Template($templateName, $defaultContent);
		}

		

		$data=$this->getReportData();
		$this->title = $data['attributes']['company'] . '-' . $data['attributes']['title'];
		$this->text = $template->render($data);


		


		include_once GetPath('{widgets}/CustomContent/vendor/autoload.php');
		$this->text = (new \Parsedown())
			//->setSafeMode(true)
			->setMarkupEscaped(false)
			->text($this->text);


		$cssToInlineStyles = new \TijsVerkoyen\CssToInlineStyles\CssToInlineStyles();

		$this->text= $cssToInlineStyles->convert(
		   $this->text
		);

		return $this;
	}

	public function renderPdf() {

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
		$dompdf->stream($this->title . '-' . date('Y-m-d_H-i-s') . '.pdf');

	}

}