<?php
Core::DataAccess();

class ReferralManagementPlugin extends Plugin implements core\ViewController, core\WidgetProvider, core\PluginDataTypeProvider, core\ModuleProvider, core\TaskProvider, core\AjaxControllerProvider, core\DatabaseProvider, core\EventListener {
	protected $description = 'ReferralManagement specific views, etc.';

	use core\WidgetProviderTrait;
	use core\ModuleProviderTrait;
	use core\AjaxControllerProviderTrait;
	use core\DatabaseProviderTrait;
	use core\PluginDataTypeProviderTrait;
    use core\EventListenerTrait;

    use core\TemplateRenderer;

	public function savePlugin() {
		$this->setParameterFromRequest('customFormCss', '');

		return parent::savePlugin();
	}

	/**
	 * returns an indexed array of available tasks and method names.
	 * array keys should be task names, and values should correspond to task methods defined within the
	 * plugin class.
	 */
	public function getTaskMap() {
		return array(
			'layer.upload' => 'task_UploadLayer',
		);
	}

	protected function task_UpLoadLayer() {
		Core::Files();
		Core::LoadPlugin('Maps');

		if (($path = FileSharesUploader::UploadFile(
			array(
				'kml',
				'kmz',
				'zip',
				'shp',
			))) && $path != "") {

			include_once MapsPlugin::Path() . DS . 'lib' . DS . 'SpatialFile.php';

			$kmlDoc = substr($path, 0, strrpos($path, '.')) . '.kml';

			// SpatialFile is a utility that opens any spatial and
			// returns a KmlDocument, which is essentially a DomDocument
			// wrapper class. currently it only supports kml, and kmz,
			// but is intended to be able to open shape files as well.
			SpatialFile::Save(SpatialFile::Open($path), $kmlDoc);

			$this->setParameter('layer', $path);
			return true;

		} else {

			return $this->setTaskError(
				array(
					'Upload Failed',
					FileSharesUploader::lastError(),
				));
		}

		return false;
	}


    public function includeScripts(){

        IncludeJS(__DIR__.'/js/Proposal.js');
        IncludeJS(__DIR__.'/js/ProjectTeam.js');
        IncludeJS(__DIR__.'/js/TaskItem.js');
    }

    protected function onCreateProposal($params){


        $this->createDefaultProposalTasks($params->id);

    }

    protected function onPost($params){

       


        $discussion=GetPlugin('Discussions');
        $discussionId=$discussion->getDiscussionForItem(145, 'widget', 'wabun')->id;
        if($params->discussion!==$discussionId){

            $discussion->post($discussionId, 'User commented in project discussion');
            Emit('onMirrorPost', $params);
        }
       
       

    }


    public function listProposalData(){


         $filter=array('user'=>Core::Client()->getUserId());
        if(Auth('memberof', 'lands-department', 'group')){
            $filter=array();
        }



        $database = $this->getDatabase();
        $results=$database->getAllProposals($filter);




        return array_map(function ($result) {

              return $this->formatProposalResult($result);

        }, $results);


    }

    protected function formatProposalResult($result){

            $proposal = get_object_vars($result);

            //if ((int) $array['user'] !== Core::Client()->getUserId()) {
            $proposal['userdetails'] = Core::Client()->userMetadataFor((int) $proposal['user']);
            //}

            Core::LoadPlugin('Attributes');
            $attributes=AttributesRecord::Get($proposal['id'], 'ReferralManagement.proposal', AttributesTable::GetMetadata('proposalAttributes'));

            $teamMembers=$attributes['teamMembers'];
            if(!is_array($teamMembers)){
                $teamMembers=array();
            }


            $attributes['teamMemberIds']=$teamMembers;

            $attributes['teamMembers']=array_map(function($member){
                return $this->formatUser(GetClient()->userMetadataFor($member));
            },$teamMembers);

            //if(empty($teamMembers)){
               // $attributes['teamMembers']=$this->getDefaultTeamMembers();
            //}


            



            $proposal['attributes'] =$attributes;
            $time=strtotime($attributes['commentDeadlineDate']);
            $days=($time-time())/(3600*24);
            $computed=array();
            $computed['commentDeadlineTime']=$time;
            $computed['commentDeadlineDays']=$days;

            $computed['urgency']='normal';
                
            if($days<=2){
                $computed['urgency']='high';
            }
            if($days<=7){
                $computed['urgency']='medium';
            }

            $proposal['computed']=$computed;
            $proposal['tasks']=array_map(function($result){
                return $this->formatTaskResult($result);
            }, GetPlugin('Tasks')->getItemsTasks($proposal['id'], "ReferralManagement.proposal"));

            return $proposal;

    }

    public function formatTaskResult($result){


        Core::LoadPlugin('Attributes');
        $task = get_object_vars($result);
        $attributes=AttributesRecord::Get($task['id'], 'Tasks.task', AttributesTable::GetMetadata('taskAttributes'));
        $task['attributes']=$attributes;


        $starred=  $task['attributes']['starUsers'];
        if(is_object($starred)){
            $task['attributes']['starUsers']=array_values(get_object_vars($starred));
        }

        $task['complete']=!!$task['complete'];
        return $task;
    }

    public function getProposalData($id){

        $database = $this->getDatabase();
        return $this->formatProposalResult($database->getProposal($id)[0]);

    }



    public function isUserInGroup($group){

        if(Core::Client()->isGuest()){
           return false;
        }

        if(Core::Client()->isAdmin()){
            if(in_array($group, array('tribal-council', 'chief-council', 'lands-department', 'lands-department-manager', 'community-member'))){
                //return true;
            }
        }

        $map=$this->getGroupAttributes();


        $map['proponent']='isProponent';


        GetPlugin('Attributes');
        $attributeMap=array();
        $attribs=(new attributes\Record('userAttributes'))->getValues(Core::Client()->getUserId(), 'user');

        //AttributesRecord::GetFields(Core::Client()->getUserId(), 'user', array_values($map), 'userAttributes');

        
        // if($group=='lands-department'){
        //     if($attribs[$map['lands-department-manager']]===true||$attribs[$map['lands-department-manager']]==="true"){
        //         return true;
        //     }
        // }


        if(key_exists($group, $map)&&key_exists($map[$group], $attribs)){
            return $attribs[$map[$group]]===true||$attribs[$map[$group]]==="true";
        }

        return false;


    }




    public function getUserRoleIcon($id=-1){

        if($id<1){
            $id=Core::Client()->getUserId();
        }

    	$map=$this->getGroupAttributes();

    	GetPlugin('Attributes');
        $attribs=(new attributes\Record('userAttributes'))->getValues($id, 'user');
        
        foreach(array_keys($map) as $key){

        	if($attribs[$map[$key]]===true||$attribs[$map[$key]]==="true"){
	        	return UrlFrom((new core\Configuration('rolesicons'))->getParameter($key)[0]);
	        }

        }
    	return UrlFrom((new core\Configuration('rolesicons'))->getParameter('none')[0]);
    }

    public function getRoleIcons(){

     
        $config=new core\Configuration('rolesicons');
      
        $icons=array();
        foreach(array_merge($this->getGroups(),array('admin', 'none')) as $key){

                $icons[$key]= UrlFrom($config->getParameter($key)[0]);

        }
        return $icons;


    }

    public function getUserRoles($id=-1){
        if($id<1){
            $id=Core::Client()->getUserId();
        }
        
        $map=$this->getGroupAttributes();

        GetPlugin('Attributes');
        $attribs=(new attributes\Record('userAttributes'))->getValues($id, 'user');
        
        $roles=array();

        foreach(array_keys($map) as $key){

            if($attribs[$map[$key]]===true||$attribs[$map[$key]]==="true"){
                $roles[]=$key;
            }

        }

        return $roles;
    }

    public function getRolesUserCanEdit($id=-1){


        $rolesList=$this->getRoles();
        if(GetClient()->isAdmin()){
            return $rolesList;
        }

        $roles=$this->getUserRoles();
        



        $roleIndexes=array_map(function($r)use($rolesList){
            return array_search($r, $rolesList);
        }, $roles);

        $minIndex=min($roleIndexes);
        $canSetList=array_slice($rolesList, $minIndex+1);
        return $canSetList;

    }

    public function getUserRoleLabel($id=-1){


        if($id<1){
            $id=Core::Client()->getUserId();
        }
    	
    	$map=$this->getGroupAttributes();

    	GetPlugin('Attributes');
        $attribs=(new attributes\Record('userAttributes'))->getValues($id, 'user');
        

        foreach(array_keys($map) as $key){

        	if($attribs[$map[$key]]===true||$attribs[$map[$key]]==="true"){
	        	return $key;
	        }

        }


    	return 'none';

    }
    public function getGroupAttributes(){
        return array(
            "tribal-council"=>"isTribalCouncil",
            "chief-council"=>"isChiefCouncil",
            "lands-department-manager"=>"isLandsDepartmentManager",
            "lands-department"=>"isLandsDepartment",
            "community-member"=>"isCommunityMember",
            );
    }

    protected function getGroups(){

        //order is important...!

        return array(
            "tribal-council",
            "chief-council",
            "lands-department-manager",
            "lands-department",
            "community-member",
            );
    }

    public function teamMemberRoles(){
        return array(
            "tribal-council",
            "chief-council",
            "lands-department-manager",
            "lands-department"
        );
    }
    public function communityMemberRoles(){
        return array(
            "community-member"
        );
    }

    public function getGroupMembersOfGroup($group){

    	$map=$this->getGroups();

    	$i=array_search($group, $map);
    	if($i!==false){
    		return array_slice($map, 0, $i+1);
    	}

        return array();
    }


    public function getLayersForGroup($name){
    	$config=new core\Configuration('layerGroups');
    	return $config->getParameter($name, array());
    }
    public function getMouseoverForGroup($name){
    	$config=new core\Configuration('iconset');
    	return $config->getParameter($name."Mouseover", "Hello Word");
    }

    public function getDefaultTaskMeta($proposal){
        
        /**
         * TODO return a list of task templates that can be displayed in the form for default tasks
         */

    }
    public function getDefaultProposalTaskTemplates($proposal){


        GetPlugin('Attributes');
        $typeName=(new attributes\Record('proposalAttributes'))->getValues($proposal, 'ReferralManagement.proposal')['type'];
        $typeVar=str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $typeName)));


        $taskTemplates=array(
            "type"=>$typeVar,
            "id"=>$proposal,
            "taskTemplates"=>array()
        );

        $config=GetWidget('proposalConfig');
        foreach($config->getParameter('taskNames') as $taskName){
            $taskVar=str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $taskName)));
            if(empty($taskVar)){
                continue;
            }

             $taskTemplate=array();
             
             $taskTemplate["show".ucfirst($taskVar)."For".ucfirst($typeVar)]=$config->getParameter("show".ucfirst($taskVar)."For".ucfirst($typeVar));
             
             if($config->getParameter("show".ucfirst($taskVar)."For".ucfirst($typeVar))){
                $taskTemplate["task"]= array(
                    "id"=>-1,
                    "name"=>$config->getParameter($taskVar."Label"),
                    "description"=>$config->getParameter($taskVar."Description"),
                    "dueDate"=>$this->parseDueDateString($config->getParameter($taskVar."DueDate"), $proposal),
                    "complete"=>false,
                    "attributes"=>array(
                        "isPriority"=>false,
                        "starUsers"=>[],
                        "attachements"=>""
                    )
                );
             }

             
            

                
                $taskTemplates["taskTemplates"][]=$taskTemplate;

                    
                
            }
        

       return  $taskTemplates["taskTemplates"];
    }
    public function createDefaultProposalTasks($proposal){

        $taskIds=array();

        GetPlugin('Attributes');
        $typeName=(new attributes\Record('proposalAttributes'))->getValues($proposal, 'ReferralManagement.proposal')['type'];


         Emit('onCreateDefaultTasksForProposal',array(
            'proposal'=>$proposal,
            'type'=>$typeName
         ));

        $typeVar=str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $typeName)));

        $config=GetWidget('proposalConfig');
        foreach($config->getParameter('taskNames') as $taskName){
            $taskVar=str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $taskName)));
            if(!empty($taskVar)){

                 if($config->getParameter("show".ucfirst($taskVar)."For".ucfirst($typeVar))){

                     if($taskId=GetPlugin('Tasks')->createTask($proposal, 'ReferralManagement.proposal', array(
                        "name"=>$config->getParameter($taskVar."Label"),
                        "description"=>$config->getParameter($taskVar."Description"),
                        "dueDate"=>$this->parseDueDateString($config->getParameter($taskVar."DueDate"), $proposal),
                        "complete"=>false
                    ))){

                        Emit('onCreateDefaultTaskForProposal', array(
                            'proposal'=>$proposal,
                            'task'=>$taskId,
                            'name'=>$taskName,
                            'type'=>$typeName
                        ));
                        $taskIds[]=$taskId;

                    }
                }
            }
        }

       return $taskIds;

    }


    protected function parseDueDateString($date, $proposal){

        return $this->renderTemplate("dueDateTemplate", $date, $this->getProposalData($proposal));

        //return '00-00-00 00:00:00';
    }


    public function getRoles(){
        return $this->getGroups();
    }
    public function getTeamMembers($team='wabun'){


        $list= array_map(function($u){

            return $this->formatUser($u);

        }, GetClient()->listUsers());


        return array_values(array_filter($list, function($u){
            return count(array_intersect($u['roles'], $this->teamMemberRoles()))>0;
        }));
    }


    public function getUsers($team='wabun'){


        $list= array_map(function($u){

            return $this->formatUser($u);

        }, GetClient()->listUsers());


        return array_values(array_filter($list, function($u){
            return strpos($u['email'], 'device.')!==0;
        }));
    }


    public function getDevices($team='wabun'){


        $list= array_map(function($u){

            return $this->formatUser($u);

        }, GetClient()->listUsers());


        return array_values(array_filter($list, function($u){
            return strpos($u['email'], 'device.')===0;
        }));
    }



    protected function formatUser($usermeta){

        return array_merge(
            array('roles'=>$this->getUserRoles($usermeta['id'])), 
            $usermeta
        );


    }



     public function getDefaultTeamMembers($team='wabun'){


        $list=$this->getTeamMembers();

        $roles=$this->rolesAbove();

        return array_values(array_filter($list, function($m)use($roles){
            if(count(array_intersect($roles, $m['roles']))){
                return true;
            }
            return false;
        }));
        
    }

    protected function rolesAbove($role='lands-department'){
        $roles=$this->getRoles();
        return array_slice($roles, 0, array_search($role, $roles));

       
    }

    public function getProjectMembers($project){
        return $this->getTeamMembers();
    }

}
