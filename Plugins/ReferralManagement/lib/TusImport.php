<?php

namespace ReferralManagement;

class TUSImport {

	protected $progressHandler;

	public function __construct($progressHandler){
		$this->progressHandler=$progressHandler;
	}

	public function fromKml($document) {

		GetPlugin('Maps');

		$features = array();
		


		$polygonCounter=0;
		$polygons=$document->getPolygonNodes();
		$this->progressHandler->setTaskActivityHandler(function()use($polygons, &$polygonCounter){
			return array('total'=>count($polygons), 'progress'=>$polygonCounter);
		}, 'polygons');

		foreach ($polygons as $polyNode) {

			$style = \KmlDocument::GetPolygonStyle($polyNode, array(
				// default values
				'lineColor' => 'ff000000',
				'width' => 1,
				'polyColor' => '7f000000',
				'outline' => true,
			));
			try {
				$coordinates = \KmlDocument::GetPolygonCoordinates($polyNode);
			} catch (Exception $e) {
				continue;
			}

			$name = \KmlDocument::GetNodeName($polyNode, 'Unknown');
			$description = \KmlDocument::GetNodeDescription($polyNode, '');

			//$feature = (new \spatial\FeatureLoader())->fromName($name);

			$feature = new Polygon();
			$feature->setName($name);
			$feature->setDescription($description);
			$feature->setPath($coordinates);

			$feature->setLineColor($style['lineColor']);
			$feature->setLineWidth($style['width']);
			$feature->setPolyColor($style['polyColor']);
			$feature->setOutline($style['outline']);

			$features[] = $feature;

			$polygonCounter++;
			$this->progressHandler->check();

		}



		$lineCounter=0;
		$lines=$document->getLineNodes();
		$this->progressHandler->setTaskActivityHandler(function()use($lines, &$lineCounter){
			return array('total'=>count($lines), 'progress'=>$lineCounter);
		}, 'lines');
		
		foreach ($lines as $lineNode) {

			$style = \KmlDocument::GetLineStyle($lineNode, array(
				// default values
				'lineColor' => 'ff000000',
				'width' => 1,
			));
			$coordinates = \KmlDocument::GetLineCoordinates($lineNode);
			$name = \KmlDocument::GetNodeName($lineNode, 'Unknown');
			$description = \KmlDocument::GetNodeDescription($lineNode, '');

			$feature = new Line();
			$feature->setName($name);
			$feature->setDescription($description);
			$feature->setPath($coordinates);

			$feature->setLineColor($style['lineColor']);
			$feature->setLineWidth($style['width']);

			$features[] = $feature;

			$lineCounter++;
			$this->progressHandler->check();

		}
		


		$markerCounter=0;
		$markers=$document->getMarkerNodes();
		$this->progressHandler->setTaskActivityHandler(function()use($markers, &$markerCounter){
			return array('total'=>count($markers), 'progress'=>$markerCounter);
		}, 'markers');

		foreach ($markers as $markerNode) {

			$coordinates = \KmlDocument::GetMarkerCoordinates($markerNode);
			$icon = \KmlDocument::GetMarkerIcon($markerNode, 'DEFAULT');

			$name = \KmlDocument::GetNodeName($markerNode, 'Unknown');
			$description = \KmlDocument::GetNodeDescription($markerNode, '');
			$coordinates = \KMLDocument::GetMarkerCoordinates($markerNode);

			$feature = new \Marker();
			$feature->setName($name);
			$feature->setDescription($description);
			$feature->setCoordinates($coordinates[0], $coordinates[1]);

			$features[] = $feature;


			$markerCounter++;
			$this->progressHandler->check();

		}
		return $features;

	}

	function parseIcon($feature){
		return 'components/com_geolive/users_files/user_files_680/Uploads/[ImAgE]_wBJ_4IB_[G]_DLI.png';
	}

	function parseLayer($feature) {

		$name = $feature->getName();
		$activityCode = substr($name, 0, 2);
		$layerMap = get_object_vars(json_decode((new \core\File())->read(dirname(__DIR__) . '/layerCodes.json')));

		$layer = 69;
		if (key_exists($activityCode, $layerMap)) {
			$layer = $layerMap[$activityCode];

		}

		return $layer;

	}

	function parseAttributes($feature) {

		$name = $feature->getName();
		$activityCode = substr($name, 0, 2);

		$activityMap = get_object_vars(json_decode((new \core\File())->read(dirname(__DIR__) . '/attributeCodes.json')));

		$attributes = array('activityCode' => $activityCode);

		if (key_exists($activityCode, $activityMap)) {
			$attributes['activity'] = $activityMap[$activityCode];

		}
		$description = $feature->getDescription();
		$yr = explode(' ', trim($description));
		$yr = str_replace('.', '', array_pop($yr));
		if (strlen($yr) == 4 && is_numeric($yr)) {
			$attributes['year'] = $yr . '-01-01';
		}

		echo 'featureAttributes=>' . print_r($attributes, true);

		return $attributes;

	}

}