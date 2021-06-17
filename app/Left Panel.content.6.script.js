return new Element('div',{'class':"survey-link",html:



`
<a class="survey-form" href="`+DashboardConfig.getValue('surveyUrl')+`">Survey</a>
<a class="slack-link" href="`+DashboardConfig.getValue('slackUrl')+`">Slack Chat</a>
`});