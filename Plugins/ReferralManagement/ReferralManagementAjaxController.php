<?php

class ReferralManagementAjaxController extends core\AjaxController implements core\PluginMember
{
    use core\PluginMemberTrait;

    protected function listProposals($task, $json)
    {

        $response=array('results'=>$this->getPlugin()->listProposalData());

        $userCanSubscribe = Core::Client()->isAdmin();
        if ($userCanSubscribe) {
            $response['subscription'] = array(
                'channel' => 'proposals',
                'event' => 'update',
            );
        }

        return $response;

    }

    protected function saveProposal($task, $json)
    {

        /* @var $database ReferralManagementDatabase */
        $database = $this->getPlugin()->getDatabase();

        if (key_exists('id', $json) && (int) $json->id > 0) {

            if (!Auth('write', $json->id, 'ReferralManagement.proposal')) {
                return $this->setError('No access or does not exist');
            }
            $id=(int)$json->id;
            $database->updateProposal(array(
                'id' => $id,
                'user' => Core::Client()->getUserId(),
                'metadata' => '{}',
                'modifiedDate' => date('Y-m-d H:i:s'),
                'status' => 'active',
            ));

            $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' updated proposal', array(
                    "items"=>array(
                        array(
                            "type"=>"ReferralManagement.proposal",
                            "id"=>$json->id
                        )
                    )));

            GetPlugin('Attributes');
            if(key_exists('attributes', $json)){
                foreach($json->attributes as $table=>$fields){
                    (new attributes\Record($table))->setValues($id, 'ReferralManagement.proposal', $fields);
                }
            }

            Broadcast('proposals', 'update', array());
            Emit('onUpdateProposal', array('id' => $id));
            return array('id'=>$id, 'data'=>$this->getPlugin()->getProposalData($id));

        } else {

            if (($id = (int) $database->createProposal(array(
                'user' => Core::Client()->getUserId(),
                'metadata' => '{}',
                'createdDate' => ($now = date('Y-m-d H:i:s')),
                'modifiedDate' => $now,
                'status' => 'active',
            )))) {

                 $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' created proposal', array(
                    "items"=>array(
                        array(
                            "type"=>"ReferralManagement.proposal",
                            "id"=>$id
                        )
                    )));

                GetPlugin('Attributes');
                if(key_exists('attributes', $json)){
                    foreach($json->attributes as $table=>$fields){
                        (new attributes\Record($table))->setValues($id, 'ReferralManagement.proposal', $fields);
                    }
                }
                Emit('onCreateProposal', array('id' => $id));
               
                return array('id'=>$id, 'data'=>$this->getPlugin()->getProposalData($id));

            }
        }

        return $this->setError('Failed to create proposal');

    }


     protected function deleteTask($task, $json)
     {

        if((int)$json->id>0){

            //TODO auth write task!

            if(GetPlugin('Tasks')->deleteTask($json->id)){

                 $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' deleted task for proposal');

                return true;
            }
        }

        return $this->setError('Unable to delete');



     }

    protected function saveTask($task, $json)
    {

        $id=(int)$json->id;
        if($id>0){
            if(GetPlugin('Tasks')->updateTask($id, array(
                "name"=>$json->name,
                "description"=>$json->description,
                "dueDate"=>$json->dueDate,
                "complete"=>$json->complete
            ))){

                $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' updated task for proposal', array(
                    "items"=>array(
                        array(
                            "type"=>"Tasks.task",
                            "id"=>$json->id
                        )
                    ))
                );

                return array('id'=>$id, 'data'=>$this->getPlugin()->formatTaskResult(GetPlugin('Tasks')->getDatabase()->getTask($id)[0]));
            }
        }

        if($id=GetPlugin('Tasks')->createTask($json->itemId, $json->itemType, array(
            "name"=>$json->name,
            "description"=>$json->description,
            "dueDate"=>$json->dueDate,
            "complete"=>$json->complete
        ))){


            $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' created task for proposal', array(
                    "items"=>array(
                        array(
                            "type"=>"Tasks.task",
                            "id"=>$id
                        )
                    )));


            return array('id'=>$id, 'data'=>$this->getPlugin()->formatTaskResult(GetPlugin('Tasks')->getDatabase()->getTask($id)[0]));

        }

        return $this->setError('Failed to create task');

    }

    protected function defaultTaskTemplates($task, $json){
        return array('taskTemplates'=>$this->getPlugin()->getDefaultProposalTaskTemplates($json->proposal));
    }
    protected function createDefaultTasks($task, $json){
        $taskIds=$this->getPlugin()->createDefaultProposalTasks($json->proposal);

        $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' created default tasks for proposal', array(
                    "items"=>array_map(function($id){
                        return array(
                            "type"=>"Tasks.task",
                            "id"=>$id
                        );
                    },
                    $taskIds
                )));

        return array("tasks"=>$taskIds, 'tasksData'=>array_map(function($id){
            return $this->getPlugin()->formatTaskResult(GetPlugin('Tasks')->getDatabase()->getTask($id)[0]);
        }, $taskIds));
    }

    protected function listTeamMembers($task, $json){
        return array(
            "results"=>$this->getPlugin()->getTeamMembers($json->team)
        );
    }

    protected function listUsers($task, $json){
        return array(
            "results"=>$this->getPlugin()->getUsers($json->team)
        );
    }

    protected function listDevices($task, $json){
        return array(
            "results"=>$this->getPlugin()->getDevices($json->team)
        );
    }

    protected function getUsersTasks($task, $json)
    {

        return array('results'=>GetPlugin('Tasks')->getItemsTasks(GetClient()->getUserId(), "user"));
    
    }


    protected function setProposalStatus($task, $json)
    {

        /* @var $database ReferralManagementDatabase */
        $database = $this->getPlugin()->getDatabase();

        if (key_exists('id', $json) && (int) $json->id > 0) {

            if (!Auth('write', $json->id, 'ReferralManagement.proposal')) {
                return $this->setError('No access or does not exist');
            }

            $database->updateProposal(array(
                'id' => (int) $json->id,
                'status' => $json->status,
            ));


             $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' '.($json->status=='archived'?'archived':'un-archived').' proposal', array(
                    "items"=>array(
                        array(
                            "type"=>"ReferralManagement.proposal",
                            "id"=>$json->id
                        )
                    )));

            Core::Broadcast('proposals', 'update', array());
            return array('id' => (int) $json->id);

        } 

        return $this->setError('Proposal does not exist');

    }

    protected function deleteProposal($task, $json)
    {


        $this->info('ReferralManagement', 'Delete proposal');


        /* @var $database ReferralManagementDatabase */
        $database = $this->getPlugin()->getDatabase();



        if ((int) $json->id <= 0) {
            return $this->setError('Invalid id: '.$json->id);
        }

        
        if (!Auth('write', (int)$json->id, 'ReferralManagement.proposal')) {
            return $this->setError('No access or does not exist');
        }

        $this->info('ReferralManagement', 'Delete proposal: '.$json->id);


        $data=$this->getPlugin()->getProposalData($json->id);

        if ($database->deleteProposal((int) $json->id)) {

             $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' deleted proposal');

             Emit('onDeleteProposal', $data);
             Core::Broadcast('proposals', 'update', array());
            return true;
        }
        

        

    }
    protected function getProposal($task, $json)
    {

    }

    protected function generateReport($task, $json)
    {

        include_once __DIR__.'/lib/Report.php';
        (new \ReferralManagement\Report($json->proposal))
            ->generateReport('proposal.report', 'Hello World')
            ->renderPdf();
        exit();
        
    }

    protected function downloadFiles($task, $json)
    {


        include_once __DIR__.'/lib/ComputedData.php';
        $parser=new \ReferralManagement\ComputedData();

        $localPath=function($u){
            if(HtmlDocument()->isLocalFileUrl($u)){
                return PathFrom($u);
            }

            return $u;
        };
        
        $data=$this->getPlugin()->getProposalData($json->proposal);

        $zip = new ZipArchive();
        $filename = tempnam(__DIR__, '_zip');

        if ($zip->open($filename, ZipArchive::CREATE)!==TRUE) {
            exit("cannot open <".$filename.">\n");
        }

        foreach(array_map($localPath, $parser->parseProposalFiles($data)) as $url){
            $zip->addFromString(basename($url), file_get_contents($url));
        }

        foreach($data['tasks'] as $task){
             foreach(array_map($localPath, $parser->parseTaskFiles($task)) as $url){
                $zip->addFromString(basename($url), file_get_contents($url));
            }
        }

        $zip->close();
        $content=file_get_contents($filename);
        unlink($filename);

        $title=$data['attributes']['title'];

        header("Content-Type: application/zip");
        header("Content-Length: " . mb_strlen($content, "8bit"));
        header("Content-Disposition: attachment; filename=\"".$title."-attachments-".time().".zip\"");
        exit($content);

        return array('files'=>$data['files'], 'proposal'=>$data);

    }


    protected function getReserveMetadata($task, $json)
    {

        Core::LoadPlugin('Maps');
        $marker = MapController::LoadMapItem($json->id);

        $str = $marker->getDescription();

        $getUrls = function ($str) {

            $urls = array();

            $links = explode('<a ', $str);
            array_shift($links);

            foreach ($links as $l) {

                $a = explode('href', $l);
                $a = ltrim(ltrim(ltrim($a[1]), '='));

                $q = $a{0};
                $a = substr($a, 1);

                $a = explode($q, $a);
                $a = $a[0];

                $urls[] = $a;
            }

            return $urls;
        };

        $url = $getUrls($str)[0];

        $page = file_get_contents($url);
        $urls = $getUrls($page);

        $website = '';
        foreach ($urls as $u) {

            if (strpos($u, 'http://pse5-esd5.ainc-inac.gc.ca') !== false) {
                break;
            }
            $website = $u;

        }

        if (strpos($website, 'https://apps.gov.bc.ca') !== false) {
            return array('result' => false);
        }

        return array('result' => Core::LoadPlugin('ExternalContent')->ParseHTML($website));

    }

    protected function exportProposals($json)
    {
        GetPlugin('Attributes');
        (new attributes\CSVExport())

            ->addTableDefinition('proposal', $this->getPlugin()->getDatabase()->getTableName('proposal'))
            ->addFields(array(
                'id' => 'proposal.id',
                'uid' => 'proposal.user',
                'created' => 'proposal.createdDate',
                'modified' => 'proposal.modifiedDate',
                'status' => 'proposal.status'
            ))
            ->addAllFieldsFromTable('proposalAttributes')
            ->printCsv();


        exit();

      
    }






     protected function addProposalUser($task, $json){
        if (!Auth('write', $json->proposal, 'ReferralManagement.proposal')) {
            return $this->setError('No access or does not exist');
        }

        GetPlugin('Attributes');

        $attributes=(new attributes\Record('proposalAttributes'))->getValues($json->proposal, 'ReferralManagement.proposal');

        $teamMembers=$attributes['teamMembers'];
        if(empty($teamMembers)){
            $teamMembers=array();
        }
        $teamMembers[]=$json->user;
        $teamMembers=array_unique($teamMembers);


       (new attributes\Record('proposalAttributes'))->setValues($json->proposal, 'ReferralManagement.proposal', array(
        'teamMembers'=>$teamMembers
       ));

       return true;


     }

     protected function removeProposalUser($task, $json){
        if (!Auth('write', $json->proposal, 'ReferralManagement.proposal')) {
            return $this->setError('No access or does not exist');
        }


        GetPlugin('Attributes');

        $attributes=(new attributes\Record('proposalAttributes'))->getValues($json->proposal, 'ReferralManagement.proposal');

        $teamMembers=$attributes['teamMembers'];
        if(empty($teamMembers)){
            $teamMembers=array();
        }
        $teamMembers=array_diff($teamMembers, array($json->user));

       (new attributes\Record('proposalAttributes'))->setValues($json->proposal, 'ReferralManagement.proposal', array(
        'teamMembers'=>$teamMembers
       ));

       return true;



     }

     protected function setStarredTask($task, $json){
        if (!Auth('write', $json->task, 'ReferralManagement.proposal')) {
            return $this->setError('No access or does not exist');
        }


        GetPlugin('Attributes');

        $attributes=(new attributes\Record('taskAttributes'))->getValues($json->task, 'Tasks.task');

        $starUsers=$attributes['starUsers'];
        if(empty($starUsers)){
            $starUsers=array();
        }
        if($json->starred){
            $starUsers=array_merge($starUsers, array(GetClient()->getUserId()));
        }else{
            $starUsers=array_diff($starUsers, array(GetClient()->getUserId()));
        }

        
        $starUsers=array_values(array_unique($starUsers));

       (new attributes\Record('taskAttributes'))->setValues($json->task, 'Tasks.task', array(
        'starUsers'=>$starUsers
       ));

        $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' '.($json->starred?'':'un-').'starred task', array(
                    "items"=>array(
                        array(
                            "type"=>"Tasks.task",
                            "id"=>$json->task
                        )
                    )));


       return true;
     }


     protected function setPriorityTask($task, $json){
        if (!Auth('write', $json->task, 'Tasks.task')) {
            return $this->setError('No access or does not exist');
        }


        GetPlugin('Attributes');

        

       (new attributes\Record('taskAttributes'))->setValues($json->task, 'Tasks.task', array(
        'isPriority'=>$json->priority
       ));


        $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' '.($json->priority?'':'de-').'prioritized task', array(
                    "items"=>array(
                        array(
                            "type"=>"Tasks.task",
                            "id"=>$json->task
                        )
                    )));

       return true;
     }
     protected function setDuedateTask($task, $json){
        if (!Auth('write', $json->task, 'Tasks.task')) {
            return $this->setError('No access or does not exist');
        }


        
        $id=(int)$json->task;
        if($id>0){
            if(GetPlugin('Tasks')->updateTask($id, array(
                "dueDate"=>$json->date,
            ))){

                $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' modified tasks due date', array(
                    "items"=>array(
                        array(
                            "type"=>"Tasks.task",
                            "id"=>$json->task
                        )
                    )));

                return true;

            }
        }
  


        

       
     }


     protected function setUserRole($task, $json){

        if(!GetClient()->isAdmin()){

            /*

                "tribal-council",
                "chief-council",
                "lands-department",
                "lands-department-manager",
                "community-member",

            */


           $roles=$this->getPlugin()->getUserRoles();
           $rolesList=$this->getPlugin()->getRoles();

            $roleIndexes=array_map(function($r)use($rolesList){
                return array_search($r, $rolesList);
            }, $roles);

            $minIndex=min($roleIndexes);
            $canSetList=array_slice($roles, $minIndex+1);

            $targetUserRoles=$this->getPlugin()->getUserRoles($json->user);
            $targetRoleIndexes=array_map(function($r)use($rolesList){
                return array_search($r, $rolesList);
            }, $targetUserRoles);

            $minTargetIndex=min($targetRoleIndexes);

            if($minIndex>=$minTargetIndex){
                return $this->setError('Cannot set user with role greator than or equal to your role');
            }


            if(!in_array($json->role, $canSetList)){
                return $this->setError('Cannot set role: '.$json->role.'. you must choose one of: '.implode(', ', $canSetList));
            }

        }


        $values=array();
        foreach($this->getPlugin()->getGroupAttributes() as $role=>$field){
            if($role===$json->role){
                $values[$field]=true;
            }else{
                $values[$field]=false;
            }
        }


        GetPlugin('Attributes');

         (new attributes\Record('userAttributes'))->setValues($json->user, 'user', $values);


         $this->getPlugin()->postToActivityFeeds(GetClient()->getUsername().' updated users role', array(
                    "items"=>array(
                        array(
                            "type"=>"User",
                            "id"=>$json->user
                        )
                    )));

         return $values;

     }




















}
