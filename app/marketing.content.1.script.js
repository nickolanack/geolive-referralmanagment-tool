return new Element('img',{
    src:"<?php echo GetPlugin('QRCode')->getQRCode(HtmlDocument()->website()); ?>"
})