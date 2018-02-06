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

            $discussion=GetPlugin('Discussions');
            $discussion->post($discussion->getDiscussionForItem(145, 'widget', 'wabun')->id, 'User updated proposal');

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

                $discussion=GetPlugin('Discussions');
                $discussion->post($discussion->getDiscussionForItem(145, 'widget', 'wabun')->id, 'User created proposal');

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

                $discussion=GetPlugin('Discussions');
                $discussion->post($discussion->getDiscussionForItem(145, 'widget', 'wabun')->id, 'User deleted task for proposal');

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

                $discussion=GetPlugin('Discussions');
                $discussion->post($discussion->getDiscussionForItem(145, 'widget', 'wabun')->id, 'User updated task for proposal');

                return array('id'=>$id, 'data'=>$this->getPlugin()->formatTaskResult(GetPlugin('Tasks')->getDatabase()->getTask($id)[0]));
            }
        }

        if($id=GetPlugin('Tasks')->createTask($json->itemId, $json->itemType, array(
            "name"=>$json->name,
            "description"=>$json->description,
            "dueDate"=>$json->dueDate,
            "complete"=>$json->complete
        ))){


             $discussion=GetPlugin('Discussions');
             $discussion->post($discussion->getDiscussionForItem(145, 'widget', 'wabun')->id, 'User created task for proposal');


            return array('id'=>$id, 'data'=>$this->getPlugin()->formatTaskResult(GetPlugin('Tasks')->getDatabase()->getTask($id)[0]));

        }

        return $this->setError('Failed to create task');

    }

    protected function defaultTaskTemplates($task, $json){
        return array('taskTemplates'=>$this->getPlugin()->getDefaultProposalTaskTemplates($json->proposal));
    }
    protected function createDefaultTasks($task, $json){
        $taskIds=$this->getPlugin()->createDefaultProposalTasks($json->proposal);

        $discussion=GetPlugin('Discussions');
        $discussion->post($discussion->getDiscussionForItem(145, 'widget', 'wabun')->id, 'User created default tasks for proposal');

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


            $discussion=GetPlugin('Discussions');
            $discussion->post($discussion->getDiscussionForItem(145, 'widget', 'wabun')->id, 'User '.($json->status=='archived'?'archived':'un-archived').' proposal');

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

            $discussion=GetPlugin('Discussions');
            $discussion->post($discussion->getDiscussionForItem(145, 'widget', 'wabun')->id, 'User deleted proposal');

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
        
        $data=$this->getPlugin()->getProposalData($json->proposal);
        $text=(new \core\Template('proposal.report', 'Hello World'))->render($data);


        // instantiate and use the dompdf class
        $dompdf = new Dompdf\Dompdf();
        $dompdf->set_option('defaultFont', 'Courier');
        $dompdf->loadHtml($text);
        // (Optional) Setup the paper size and orientation
        $dompdf->setPaper('A4');
        // Render the HTML as PDF
        $dompdf->render();
        // Output the generated PDF to Browser
        $dompdf->stream($data['attributes']['company'].'-'.$data['attributes']['title'].'-'.date('Y-m-d_H-i-s').'.pdf');
        exit();

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

       $discussion=GetPlugin('Discussions');
       $discussion->post($discussion->getDiscussionForItem(145, 'widget', 'wabun')->id, 'User '.($json->starred?'':'un-').'starred task');


       return true;
     }


     protected function setPriorityTask($task, $json){
        if (!Auth('write', $json->task, 'ReferralManagement.proposal')) {
            return $this->setError('No access or does not exist');
        }


        GetPlugin('Attributes');

        

       (new attributes\Record('taskAttributes'))->setValues($json->task, 'Tasks.task', array(
        'isPriority'=>$json->priority
       ));


       $discussion=GetPlugin('Discussions');
       $discussion->post($discussion->getDiscussionForItem(145, 'widget', 'wabun')->id, 'User '.($json->priority?'':'de-').'prioritized task');

       return true;
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

         return $values;

     }




















}
