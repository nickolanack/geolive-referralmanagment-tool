return new Element('button',{
    html:"I Accept",
    events:{
        click:function(){
            localStorage.setItem("acceptedTerms", JSON.stringify({
			    date: (new Date()).getTime()
			}));
			DashboardLoader.loadUserDashboardView(application);
        }
    }
    
})