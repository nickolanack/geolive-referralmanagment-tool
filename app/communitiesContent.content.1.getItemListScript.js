callback((
    [{
        name:"Gather Demo Site",
        url:"https://rmt.geoforms.ca",
        image:"https://dyl2vw577xcfk.cloudfront.net/rmt.geoforms.ca/1/Uploads/%5BG%5D_%5BImAgE%5D_XZu_kJ_SPB.png"
    }]
    ).map(function(data){
        return new MockDataTypeItem(data);
    }))