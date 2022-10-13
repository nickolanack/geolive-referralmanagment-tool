<?php

namespace ReferralManagement;

class JavascriptLoader {

	public function includeScripts() {


		
		$user = new \ReferralManagement\User();
	
		IncludeJSBlock(function () use($user){
			?><script type="text/javascript">

				var Community={
					domain:<?php

					$domain = HtmlDocument()->getDomain();
					echo json_encode(substr($domain, 0, strpos($domain, '.')));

					?>,
					collective:<?php echo json_encode($user->communityCollective()); ?>,
					teams:[<?php echo json_encode($user->communityCollective()); ?>],
					territories:<?php echo json_encode($user->listTerritories()); ?>,
					communities:<?php echo json_encode($user->listCommunities()); ?>

				}


			</script><?php
		});


		$dir=dirname(__DIR__);

		IncludeJS($dir . '/js/DashboardConfig.js');
		IncludeJS($dir . '/js/GatherDashboard.js');
		IncludeJS($dir . '/js/DashboardPageLayout.js');
		IncludeJS($dir . '/js/DashboardLoader.js');
		IncludeJS($dir . '/js/UILeftPanel.js');
		IncludeJS($dir . '/js/UIInteraction.js');
		IncludeJS($dir . '/js/OrganizationalUnit.js');
		IncludeJS($dir . '/js/NamedCategory.js');
		IncludeJS($dir . '/js/NamedCategoryList.js');

		IncludeJS($dir . '/js/ui/SectionToggle.js');
		IncludeJS($dir . '/js/ui/BreadcrumbNavigation.js');
		IncludeJS($dir . '/js/ui/ShareLinks.js');
		IncludeJS($dir . '/js/ui/TableHeader.js');
		IncludeJS($dir . '/js/ui/TableAutoHeightBehavior.js');
		IncludeJS($dir . '/js/ui/SidePanelToggle.js');
		IncludeJS($dir . '/js/ui/DisplayTheme.js');
		IncludeJS($dir . '/js/ui/DockWizard.js');

		IncludeJS('{widgets}/WizardBuilder/js/FormBuilder.js');
		IncludeJS($dir . '/js/ui/ReportFormBuilder.js');
		IncludeJS($dir . '/js/ui/PopoverFormDefinition.js');

		IncludeJS($dir . '/js/menus/GuestNavigationMenu.js');

		IncludeJS($dir . '/js/ProjectSelection.js');
		IncludeJS($dir . '/js/UserNotifications.js');

		IncludeJS($dir . '/js/UserGroups.js');
		IncludeJS($dir . '/js/ConfigItem.js');
		IncludeJS($dir . '/js/HtmlContent.js');

		IncludeJS($dir . '/js/spatial/SpatialProject.js');
		IncludeJS($dir . '/js/spatial/SpatialDocumentPreview.js');
		IncludeJS($dir . '/js/spatial/ProjectLayer.js');
		IncludeJS($dir . '/js/spatial/ProjectMap.js');
		IncludeJS($dir . '/js/spatial/LayerGroup.js');
		IncludeJS($dir . '/js/spatial/LayerGroupLegend.js');
		IncludeJS($dir . '/js/spatial/LegendHelper.js');

		IncludeJS($dir . '/js/menus/MenuUtils.js');

		IncludeJS($dir . '/js/menus/MainNavigationMenuBase.js');
		IncludeJS($dir . '/js/menus/MainNavigationMenu.js');
		IncludeJS($dir . '/js/menus/SettingsNavigationMenu.js');

		IncludeJS($dir . '/js/menus/ProjectsOverviewNavigationMenu.js');
		IncludeJS($dir . '/js/menus/ProjectNavigationMenu.js');
		IncludeJS($dir . '/js/menus/ProfileNavigationMenu.js');
		IncludeJS($dir . '/js/menus/MapNavigationMenu.js');
		IncludeJS($dir . '/js/DashboardUser.js');
		IncludeJS($dir . '/js/MobileDeviceList.js');

		IncludeJS($dir . '/js/ProjectQueries.js');

		IncludeJS($dir . '/js/traits/ItemCollection.js');
		IncludeJS($dir . '/js/traits/ItemUsersCollection.js');
		IncludeJS($dir . '/js/traits/ItemProjectsCollection.js');
		IncludeJS($dir . '/js/traits/ItemRelatedProjectsCollection.js');
		IncludeJS($dir . '/js/traits/ItemTasksCollection.js');
		IncludeJS($dir . '/js/traits/ItemPending.js');
		IncludeJS($dir . '/js/traits/ItemArchive.js');
		IncludeJS($dir . '/js/traits/ItemDeadline.js');
		IncludeJS($dir . '/js/traits/ItemAttachments.js');
		IncludeJS($dir . '/js/traits/ItemFlags.js');
		IncludeJS($dir . '/js/traits/ItemEvents.js');
		IncludeJS($dir . '/js/traits/ItemStars.js');
		IncludeJS($dir . '/js/traits/ItemDiscussion.js');
		IncludeJS($dir . '/js/traits/ItemContact.js');
		IncludeJS($dir . '/js/traits/ItemAuthID.js');
		IncludeJS($dir . '/js/traits/ItemNavigationTagLinks.js');
		IncludeJS($dir . '/js/traits/ItemCategories.js');
		IncludeJS($dir . '/js/traits/ItemStatus.js');
		IncludeJS($dir . '/js/traits/ItemReadReceipts.js');
		IncludeJS($dir . '/js/traits/ItemShareLinks.js');
		IncludeJS($dir . '/js/traits/ItemPriority.js');
		IncludeJS($dir . '/js/traits/ItemSecurity.js');
		IncludeJS($dir . '/js/traits/ItemAccess.js');

		IncludeJS($dir . '/js/Project.js');

		IncludeJS($dir . '/js/GuestProject.js');

		IncludeJS($dir . '/js/Dataset.js');

		IncludeJS($dir . '/js/ProjectList.js');
		IncludeJS($dir . '/js/ProjectTeam.js');
		IncludeJS($dir . '/js/ProjectCalendar.js');
		IncludeJS($dir . '/js/ProjectActivityChart.js');
		IncludeJS($dir . '/js/menus/ProjectFilesNavigationMenu.js');
		IncludeJS($dir . '/js/ProjectFiles.js');
		IncludeJS($dir . '/js/TaskItem.js');
		IncludeJS($dir . '/js/ProjectTaskList.js');
		IncludeJS($dir . '/js/RecentItems.js');

		IncludeJS($dir . '/js/ProjectSearch.js');
		IncludeJS($dir . '/js/feeds/PostContent.js');
		IncludeJS($dir . '/js/feeds/NotificationContent.js');
		IncludeJS($dir . '/js/feeds/NotificationItems.js');
		IncludeJS($dir . '/js/UserIcon.js');

		IncludeJS($dir . '/js/menus/Counters.js');

		IncludeJS($dir . '/js/proposal/ProposalFlow.js');

		if (GetClient()->isAdmin()) {
			IncludeJS($dir . '/js/AdminMonitor.js');
		}

	}

}