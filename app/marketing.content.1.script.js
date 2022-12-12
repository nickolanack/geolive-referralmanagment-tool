return new Element('img',{
    src:"<?php GetPlugin('QRCode')->getQRCode(HtmlDocument()->website()); ?>"
})