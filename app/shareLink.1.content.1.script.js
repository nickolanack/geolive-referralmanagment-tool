





        var token="abcdefg";
        var link=application.getNamedValue('projectMenuController').getUrl()+'/pt'+token;
        return new ElementModule('p', {
            html:'<a target="_blank" href="'+link+'">'+link+"</a>",
            style:"color:mediumseagreen;"
        });
