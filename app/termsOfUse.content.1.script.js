var btn = new Element('button',{
    html:"I Accept",
    "class":"primary-btn nav-new-btn btn-index-1 hidden",
    events:{
        click:function(){
            localStorage.setItem("acceptedTerms", JSON.stringify({
			    date: (new Date()).getTime()
			}));
			DashboardLoader.loadUserDashboardView(application);
        }
    }
    
})

setTimeout(function(){
    
    btn.removeClass('hidden');
    
}, 1000)

return btn;