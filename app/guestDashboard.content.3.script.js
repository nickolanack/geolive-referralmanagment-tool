return new ModuleArray([
        new Element('a',{
            "class":"install",
            href:"/install",
            html:"Install Gather"
        }),
        new ElementModule('a',{
            "class":"geoforms",
            href:"/welcome",
            html:"Geoforms"
        }),
        new Element('a',{
            "class":"gather-app android",
            href:"https://play.google.com/store/apps/details?id=org.nickolanack.gatherapp",
            html:"Gather App"
        }),
        new Element('a',{
            "class":"gather-community-app android",
            href:"https://play.google.com/store/apps/details?id=org.wabun.com",
            html:"Gather Community App"
        }),
        new Element('a',{
            "class":"gather-app ios",
            href:"https://testflight.apple.com/join/rPVA9ODg",
            html:"Gather App"
        }),
        new Element('a',{
            "class":"gather-community-app ios",
            href:"https://testflight.apple.com/join/dGJFXTKB",
            html:"Gather Community App"
        }),
        new Element('img', {
            src:"<?php echo GetPlugin('QRCode')->getQRCode(array('domain'=>HtmlDocument()->website()));?>"
        })
    ],{"className":"credit-links"});