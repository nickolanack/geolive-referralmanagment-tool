callback((
    [{
        name:"Gather Demo Site",
        url:"https://rmt.geoforms.ca",
        image:""
    }]
    ).map(function(data){
        return new MockDataTypeItem(data);
    }))