





        var token="abcdefg";
        var link=application.getNamedValue('projectMenuController').getUrl()+'/pt'+token;
        return new ElementModule('p', {
            html:'<a style="color:mediumseagreen;" target="_blank" href="'+link+'">'+link+"</a>",
            
        });
