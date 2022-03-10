<?php

@deprecated


$dir = __DIR__;
while ((!file_exists($dir . '/core.php') && (!empty($dir)))) {
    $dir = dirname($dir);
}

if (file_exists($dir . '/core.php')) {
    include_once $dir . '/core.php';
} else {
    throw new Exception('failed to find core.php');
}

Core::LoadPlugin('Maps');
Core::LoadPlugin('Attributes');

$tableMetadata = (new \attributes\Table('featureAttributes'))->toObject();

function setAttributes($feature, $tableMetadata)
{

    $name = $feature->getName();
    $activityCode = substr($name, 0, 2);
    $activityMap = array(
        'BE' => 'Berries',
        'JF' => 'Jack Fish',
        'MO' => 'Moose',
        'OF' => 'Fish',
        'MD' => 'Mule Deer',
        'TX' => 'Camp Site',
        'PK' => 'Pickerel',
        'WA' => 'Water Source',
        'BU' => 'Burial Site',
        'DR' => 'Drying Rack Site',
        'PR' => 'Game Processing Site',
        'MP' => 'Medicine',
        'SP' => 'Sweat Lodge',
        'WR' => 'Water Route',
        'TR' => 'Trail Route',

    );

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

    (new \attributes\Record($tableMetadata))->setValues($feature->getId(), $feature->getType(), $attributes);
}

include_once MapsPlugin::Path() . DS . 'lib' . DS . 'KmlDocument.php';
include_once MapsPlugin::Path() . DS . 'lib' . DS . 'SpatialFile.php';

$document = SpatialFile::Open(__DIR__ . '/All_Data_Test_11FEB2015.kmz');
echo '<pre>';

foreach ($document->getPolygonNodes() as $polyNode) {

    $style = KmlDocument::GetPolygonStyle($polyNode, array(
        // default values
        'lineColor' => 'ff000000',
        'width' => 1,
        'polyColor' => '7f000000',
        'outline' => true,
    ));
    $coordinates = KmlDocument::GetPolygonCoordinates($polyNode);

    $name = KmlDocument::GetNodeName($polyNode);
    $description = KmlDocument::GetNodeDescription($polyNode);

    $feature=false;
    try{
        $feature = (new \spatial\FeatureLoader())->fromName($name);
        echo "Found: " . print_r($feature, true) . "\n";
    }catch(\Exception $e){
        //does not exist
    }
    if (!$feature) {
        $feature = new Polygon();
        $feature->setName($name);
        $feature->setDescription($description);
        $feature->setPath($coordinates);

        $feature->setLayerId(69);
        (new \spatial\FeatureLoader())->save($feature);

        echo "Created: " . print_r($feature, true) . "\n";

    } 

    setAttributes($feature, $tableMetadata);
    //print_r(array_merge($style, array('coordinates' => $coordinates)));

}

foreach ($document->getLineNodes() as $lineNode) {

    $style = KmlDocument::GetLineStyle($lineNode, array(
        // default values
        'lineColor' => 'ff000000',
        'width' => 1,
    ));
    $coordinates = KmlDocument::GetLineCoordinates($lineNode);
    $name = KmlDocument::GetNodeName($lineNode);
    $description = KmlDocument::GetNodeDescription($lineNode);

    $feature=false;
    try{
        $feature = (new \spatial\FeatureLoader())->fromName($name);
         echo "Found: " . print_r($feature, true) . "\n";
    }catch(\Exception $e){
        //does not exist
    }

    if (!$feature) {
        $feature = new Line();
        $feature->setName($name);
        $feature->setDescription($description);
        $feature->setPath($coordinates);

        $feature->setLayerId(69);
        (new \spatial\FeatureLoader())->save($feature);

        echo "Created: " . print_r($feature, true) . "\n";

    }

    setAttributes($feature, $tableMetadata);
    //print_r(array_merge($style, array('coordinates' => $coordinates)));

}

foreach ($document->getMarkerNodes() as $markerNode) {

    $coordinates = KmlDocument::GetMarkerCoordinates($markerNode);
    $icon = KmlDocument::GetMarkerIcon($markerNode, 'DEFAULT');

    $name = KmlDocument::GetNodeName($markerNode);
    $description = KmlDocument::GetNodeDescription($markerNode);
    $coordinates = KMLDocument::GetMarkerCoordinates($markerNode);


    $feature=false;
    try{
        $feature = (new \spatial\FeatureLoader())->fromName($name);
        echo "Found: " . print_r($feature, true) . "\n";
    }catch(\Exception $e){
        //does not exist
    }

    if (!$feature) {
        $feature = new Marker();
        $feature->setName($name);
        $feature->setDescription($description);
        $feature->setCoordinates($coordinates[0], $coordinates[1]);

        $feature->setLayerId(69);
        (new \spatial\FeatureLoader())->save($feature);

        echo "Created: " . print_r($feature, true) . "\n";
    }
    
    $feature->setIcon('components/com_geolive/users_files/user_files_680/Uploads/[ImAgE]_wBJ_4IB_[G]_DLI.png');
    //  (new \spatial\FeatureLoader())->save($feature);

    //  setAttributes($feature, $tableMetadata);

}

echo '</pre>';
