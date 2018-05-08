/* Register and Proposal Form */



var registration=new Element('div')
var registrationLabel = registration.appendChild(new Element('label', {
    html:'Register to create an account', 'class':'login-button-text', 
    style:"text-align:left; color: mediumseagreen",
    events:{
        click:function(){
            //goto next step
            wizard.displayNext();
        }
}}));
//login.appendChild(new Element('br'));
registrationLabel.appendChild(new Element('button',{
    html:'Register',
    style:"background-color:mediumseagreen;",
    "class":"primary-btn"
    
}));

var proposal=new Element('div')
var loginProposal =  proposal.appendChild(new Element('label', {
    html:'Are you a proponent', 'class':'login-button-text', 
    style:"text-align:left; color: #EDC84C",
    events:{
        
}}));

//login.appendChild(new Element('br'));
var proposalButton=loginProposal.appendChild(new Element('button',{
    
    html:'Submit a Proposal',
    style:"background-color:#EDC84C;",
    "class":"primary-btn"
    
}));

new UIModalFormButton(proposalButton, application, new GuestProposal(), {

            formOptions: {template:"form"},
            formName: "ProposalTemplate",
  
});







return [registration, proposal];