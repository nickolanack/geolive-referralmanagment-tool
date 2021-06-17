return new Element('div',{'class':"survey-link",html:



`
<ul class="">
<li><a class="survey-form" href="`+DashboardConfig.getValue('surveyUrl')+`">Survey</a></li>
<li><a class="slack-link" href="`+DashboardConfig.getValue('slackUrl')+`">Slack Chat</a></li>
</ul.`});