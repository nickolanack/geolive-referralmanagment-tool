//print_r($parameters);
$config=GetWidget('proposalConfig');
foreach($config->getParameter('proposalTypes',array()) as $typeName){
    $typeVar=str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $typeName)));
    if(!empty($typeVar)){
        
        $fields=array();
        foreach($config->getParameter("taskNames",array()) as $taskName){
            $taskVar=str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $taskName)));
             if(!empty($taskVar)){
                $fields[]=(object)array(
                            "type"=>"switch",
                            "name"=>"show".ucfirst($taskVar)."For".ucfirst($typeVar),  
                            "default"=>false,
                            "label"=>"show ".$taskName
                        );
             }
            
        }
        
      
        $parameters[]=(object)array(
            "type"=>"fieldset",
            "label"=>"Tasks For Proposal Type: ".$typeName,
            "fields"=>$fields
            );
            
    }
}

//Define each task
foreach($config->getParameter('taskNames',array()) as $taskName){
    $taskVar=str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $taskName)));
    if(!empty($taskVar)){
        
       
        
        $parameters[]=(object)array(
            "type"=>"fieldset",
            "label"=>"Task Details For Type: ".$taskName,
            "fields"=>array(
                    (object)array(
                        "type"=>"text",
                        "name"=>$taskVar."Label" ,  
                        "default"=>$taskName,
                        "label"=>"Task Name"
                    ),
                    (object)array(
                        "type"=>"text",
                        "name"=>$taskVar."Description" ,  
                        "default"=>"",
                        "label"=>"Task Description"
                    ),
                    (object)array(
                        "type"=>"text",
                        "name"=>$taskVar."DueDate" ,  
                        "default"=>"in 10 days",
                        "label"=>"Due Date"
                    )
                )
            );
            
        
    }
}


return $parameters;