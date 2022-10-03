var UITextFieldLayerBrowser = function() {

    var me = this;

    me._getElement().setStyle("display", "none");

     
    var mediaSelection = (new UITextFieldMediaSelection(this)).renderButtonToolbar();

    var appendMediaHtml = function(result) {
        me.setValue((me.getValue() || "") + result.html);
    };


    var uploader = UploadForm.FileBrowserSelect(mediaSelection.getButtonToolbarElement(), {
        className: "layer noIcon file-browse-btn",
        url: CoreContentUrlRoot + "&format=raw&controller=plugins&plugin=ReferralManagement&view=plugin&pluginView=browser.layers&parent=window.parent&mode=function&function=GrabImage&addUrlImage=yes",
        tip: "add a spatial feature",
        selectFile: appendMediaHtml
    }, function(pushbox) {

        (parent.window || window).GrabImage = function(layer, mime, error) {
            appendMediaHtml({
                html: '<a href="' + layer + '">doc.kml</a>'
            });
            pushbox.close();

        };

    });

    uploader.acceptExts(["shp", "kml", "kmz", "zip"]);


};
var UITextFieldLayerList = function() {

    var me = this;

    var mediaSelection = (new UITextFieldMediaSelection(this));

    mediaSelection.renderToolbar({
        className: 'spatial-files'
    });

    new AjaxFileUploader(mediaSelection.getToolbarPreviewElement(), {
        types: ["document"],
        selectFile: function(fileinfo, type) {
            me.setValue((me.getValue() || "") + fileinfo.html);
        }
    })


    mediaSelection.addParser(function(text){ 
        
        return (new HTMLTagParser()).linkUrls(text); 

    }, function(container, linkUrl, callback) {



        (new DocumentModule({
            textQuery: function(callback) {
                callback(link.url);
            },
            download: false,
            setBackgroundImage: true
        })).addEvent('load', callback).load(null, container, null);


    }, {
        className: 'spatial-file'
    });



};