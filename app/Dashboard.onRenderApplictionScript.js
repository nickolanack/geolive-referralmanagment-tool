HtmlDocument()->META(HtmlDocument()->website(), 'base');

IncludeJSBlock('


TemplateModule.SetTemplate(\'form\',\'<div><div data-template="title" class="template-title"></div><div data-template="content" class="template-content"></div><div data-template="footer" class="template-footer"></div></div>\');
TemplateModule.SetTemplate(\'default\',\'<div data-template="content" class="template-content"></div>\');


');

/**
 * Add all views that wont be autoloaded. (any view that is rendered programatically and not by default) 
 */


GetWidget('firelightDashboardTheme')->display($targetInstance);
GetWidget('firelightGeneratedStyles')->display($targetInstance);

GetWidget('emptyListView')->display($targetInstance);

$firelight=GetPlugin('ReferralManagement');
$firelight->includeScripts();


GetWidget('proposalForm')->display($targetInstance); //proposal wizard from map


//if(GetClient()->isGuest()){
   GetWidget('guestDashboard')->display($targetInstance); 
   GetWidget('loginForm')->display($targetInstance); //login wizard from map
   GetWidget('forgotPasswordForm')->display($targetInstance); //login wizard from map
   
   GetWidget('emailVerificationForm')->display($targetInstance);
   GetWidget('userAboutDetail')->display($targetInstance);
   GetWidget('userForkDetail')->display($targetInstance);
   GetWidget('createDashboardForm')->display($targetInstance);

   
   
   
   //return;
//}

IncludeJSBlock('
    
    window.addEvent("load",function(){
        var mins=1;
        setInterval(function(){
            var number = Math.random() + "";
           
            (new AjaxControlQuery(CoreContentUrlRoot+"&format=ajax", "echo", {
				random: number
			})).addEvent("success", function(result) {
				
			}).execute();
            
        },mins*60*1000);
        
    });


');


//if((!GetClient()->isAdmin())&&count(array_intersect($firelight->teamMemberRoles(), ($roles=$firelight->getUserRoles())))==0){
    
    
    GetWidget('defaultPostDetail')->display($targetInstance);
    
    //if(count(array_intersect($firelight->communityMemberRoles(),$roles))>0){
        GetWidget('communityMemberDashboard')->display($targetInstance); 
        //return;
    //}
    
    
    GetWidget('nonMemberDashboard')->display($targetInstance); 
    //return;
//}


GetWidget('mainActivityDetail')->display($targetInstance);
GetWidget('mainProjectsDetail')->display($targetInstance);
GetWidget('mainTasksDetail')->display($targetInstance);
GetWidget('mainCalendarDetail')->display($targetInstance);
GetWidget('mainMapDetail')->display($targetInstance);


GetWidget('peopleProjectMembersDetail')->display($targetInstance);
GetWidget('peopleClientsDetail')->display($targetInstance);
GetWidget('peopleUsersDetail')->display($targetInstance);

GetWidget('UsersProjectSettings')->display($targetInstance);


// GetWidget('accountingDocumentsDetail')->display($targetInstance);
// GetWidget('accountingTimesheetDetail')->display($targetInstance);
// GetWidget('accountingReportsDetail')->display($targetInstance);

GetWidget('communityCulturalDetail')->display($targetInstance);
GetWidget('communityTransportationDetail')->display($targetInstance);
GetWidget('communityHabitationDetail')->display($targetInstance);
GetWidget('communityEnvironmentalDetail')->display($targetInstance);
GetWidget('communitySubsistenceDetail')->display($targetInstance);

GetWidget('communityUsersDetail')->display($targetInstance);
GetWidget('communityMobileDetail')->display($targetInstance);


GetWidget('configurationArchiveDetail')->display($targetInstance);
GetWidget('configurationSettingsDetail')->display($targetInstance);

GetWidget('singleTeamListItemDetail')->display($targetInstance);
GetWidget('singleFileListItemDetail')->display($targetInstance);



GetWidget('taskForm')->display($targetInstance); //proposal wizard
GetWidget('taskDefaultItems')->display($targetInstance);
GetWidget('userProfileForm')->display($targetInstance);
GetWidget('userSelectionForm')->display($targetInstance);
GetWidget('selectableUserListItemDetail')->display($targetInstance);

GetWidget('filesListForm')->display($targetInstance);
GetWidget('shareLink')->display($targetInstance);


GetWidget('emptyProjectOverviewDetail')->display($targetInstance);
GetWidget('emptyTasksList')->display($targetInstance);

GetWidget('fileItemForm')->display($targetInstance);

GetWidget('singleUserSmallIconDetail')->display($targetInstance);

GetWidget('landsDepartmentMemberForm')->display($targetInstance);

GetWidget('taskDetailPopover')->display($targetInstance);
GetWidget('singleTaskOverviewDetail')->display($targetInstance);







GetWidget('defaultPostDetail')->display($targetInstance);