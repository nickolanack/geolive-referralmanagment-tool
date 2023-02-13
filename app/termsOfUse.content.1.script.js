return new Element('button',{
    html:"I Accept",
    "class":"primary-btn nav-new-btn btn-index-1",
    events:{
        click:function(){
            localStorage.setItem("acceptedTerms", JSON.stringify({
			    date: (new Date()).getTime()
			}));
			DashboardLoader.loadUserDashboardView(application);
        }
    }
    
})