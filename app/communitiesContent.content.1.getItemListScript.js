callback((
    [{
        name:"Gather Demo Site",
        url:"https://rmt.geoforms.ca",
        image:"https://dyl2vw577xcfk.cloudfront.net/rmt.geoforms.ca/1/Uploads/%5BG%5D_%5BImAgE%5D_XZu_kJ_SPB.png"
    },
    {
        name:"aopfn",
        url:"https://aopfn.geoforms.ca",
        image:"https://dyl2vw577xcfk.cloudfront.net/rmt.geoforms.ca/1/Uploads/%5BImAgE%5D_0Va_%5BG%5D_Sik_sNG.png"
    },
    {
        name:"tla-o-qui-aht",
        url:"https:/tla-o-qui-aht.geoforms.ca",
        image:"https://dyl2vw577xcfk.cloudfront.net/rmt.geoforms.ca/1/Uploads/7W6_%5BImAgE%5D_QgC_%5BG%5D_qLJ.png"
    },
    {
        name:"nuchatlaht",
        url:"https://nuchatlaht.gather.geoforms.ca",
        image:"https://dyl2vw577xcfk.cloudfront.net/rmt.geoforms.ca/1/Uploads/Lpn_BH_eev_%5BImAgE%5D_%5BG%5D.png"
    }]
    ).map(function(data){
        return new MockDataTypeItem(data);
    }))