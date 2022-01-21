





        var link=window.location.href.split('/').slice(0,3).join('/')+'/proposals/'+item.getId()+'/auto';
        return new ElementModule('p', {
            html:'<a style="color:mediumseagreen;" target="_blank" href="'+link+'">'+link+"</a>",
            
        });
