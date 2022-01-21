





        var link=window.location.href.split('/').slice(0,3).join('/')+'/proposal/'+item.getId()+'/auto';
        return new ElementModule('p', {
            html:'<a id="theShareLink" style="color:mediumseagreen;" target="_blank" href="'+link+'">'+link+"</a>",
            
        });
