<?php


	$data=json_decode('{"from":{"id":"14","user":"7","metadata":{},"createdDate":"2021-01-05 17:19:13","modifiedDate":"2022-04-14 16:35:21","status":"active","userdetails":{"id":7,"username":"Lucas King","name":"Lucas","email":"water@treaty3.ca"},"community":"gct3","tmz":"UTC","createdDateTimestamp":1609867153,"modifiedDateTimestamp":1649954121,"link":"https:\/\/gct3.gather.geoforms.ca\/Projects\/Project-14\/Overview","discussion":{"id":"40","itemType":"ReferralManagement.proposal","itemId":"14","name":"DEFAULT","description":"","metadata":{},"createdDate":"2021-01-05 17:19:13","modifiedDate":"2021-01-05 17:19:13","readAccess":"public","writeAccess":"public","read":-1,"new":0,"posts":0,"firstPost":null,"lastPost":null},"attributes":{"id":"14","title":"Treaty #3 GIS Boundaries -","description":"Shapefiles of the Territory ","spatialFeatures":"","documents":"","status":"","company":"GCT3","submissionDate":"","expiryDate":"","commentDeadlineDate":"","priority":"","projectLetters":"","permits":"","permitIssueDate":"","permitExpireDate":"","comments":"","agreements":"","flagged":"false","type":["Traditional Knowledge"],"teamMembers":[{"id":"2","permissions":["adds-tasks","recieves-notifications"]},{"id":"3","permissions":["adds-tasks","recieves-notifications"]},{"id":"1","permissions":["adds-tasks","recieves-notifications"]},{"id":"4","permissions":["adds-tasks","recieves-notifications"]},{"id":"5","permissions":["adds-tasks","recieves-notifications"]},{"id":"6","permissions":["adds-tasks","recieves-notifications"]},{"id":"7","permissions":["adds-tasks","assigns-tasks","adds-members","sets-roles","recieves-notifications"]},{"id":"8","permissions":["adds-tasks","recieves-notifications"]}],"starUsers":"","contactName":"","contactAddress":"","contactEmail":"","contactPhone":"","contactFax":"","firstNationsInvolved":[""],"assessmentDetails":"","summaryOfConcerns":"","outcome":"","outcomeReason":"","authorizationDate":"","autorizationUser":"","authorizedCheck":"false","permitNumber":"","isDataset":null,"childProjects":["25","23","26"],"implemented":null,"stateData":"{\"assessment\":0,\"processing\":0}","permitList":null,"teamMemberIds":["2","3","1","4","5","6","7","8"]},"computed":{"commentDeadlineTime":false,"commentDeadlineDays":-19096.72488425926,"urgency":"medium"},"tasks":[]},"to":{"id":"14","user":"7","metadata":{},"createdDate":"2021-01-05 17:19:13","modifiedDate":"2022-04-14 17:23:50","status":"active","userdetails":{"id":7,"username":"Lucas King","name":"Lucas","email":"water@treaty3.ca"},"community":"gct3","tmz":"UTC","createdDateTimestamp":1609867153,"modifiedDateTimestamp":1649957030,"link":"https:\/\/gct3.gather.geoforms.ca\/Projects\/Project-14\/Overview","discussion":{"id":"40","itemType":"ReferralManagement.proposal","itemId":"14","name":"DEFAULT","description":"","metadata":{},"createdDate":"2021-01-05 17:19:13","modifiedDate":"2021-01-05 17:19:13","readAccess":"public","writeAccess":"public","read":-1,"new":0,"posts":0,"firstPost":null,"lastPost":null},"attributes":{"id":"14","title":"Treaty #3 GIS Boundaries","description":"Shapefiles of the Territory ","spatialFeatures":"","documents":"","status":"","company":"GCT3","submissionDate":"","expiryDate":"","commentDeadlineDate":"","priority":"","projectLetters":"","permits":"","permitIssueDate":"","permitExpireDate":"","comments":"","agreements":"","flagged":"false","type":["Traditional Knowledge"],"teamMembers":[{"id":"2","permissions":["adds-tasks","recieves-notifications"]},{"id":"3","permissions":["adds-tasks","recieves-notifications"]},{"id":"1","permissions":["adds-tasks","recieves-notifications"]},{"id":"4","permissions":["recieves-notifications"]},{"id":"5","permissions":["adds-tasks","recieves-notifications"]},{"id":"6","permissions":["adds-tasks","recieves-notifications"]},{"id":"7","permissions":["adds-tasks","assigns-tasks","adds-members","sets-roles","recieves-notifications"]},{"id":"8","permissions":["adds-tasks","recieves-notifications"]}],"starUsers":"","contactName":"","contactAddress":"","contactEmail":"","contactPhone":"","contactFax":"","firstNationsInvolved":[],"assessmentDetails":"","summaryOfConcerns":"","outcome":"","outcomeReason":"","authorizationDate":"","autorizationUser":"","authorizedCheck":"true","permitNumber":"","isDataset":null,"childProjects":["25","23","26"],"implemented":null,"stateData":"{\"assessment\":0,\"processing\":0}","permitList":null,"teamMemberIds":["2","3","1","4","5","6","7","8"]},"computed":{"commentDeadlineTime":false,"commentDeadlineDays":-19096.72488425926,"urgency":"medium"},"tasks":[]}}');



	include_once dirname(__DIR__).'/Plugins/ReferralManagement/lib/DataDiff.php';

	$diff=(new \ReferralManagement\DataDiff())
		->ignoreKey('modifiedDate')
		->ignoreKey('modifiedDateTimestamp')
		->flatDiff($data->from, $data->to);



		error_log(json_encode($diff, JSON_PRETTY_PRINT));
