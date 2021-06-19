
var UITextFieldLayerBrowser = function() {

    var me = this;

    me._getElement().setStyle("display", "none");

    var bar = (new UITextFieldMediaSelection(this)).renderMediaBrowserBar();


    var uploader=UploadForm.FileBrowserSelect(bar, {
        className: "layer noIcon",
        url: CoreContentUrlRoot + "&format=raw&controller=plugins&plugin=ReferralManagement&view=plugin&pluginView=browser.layers&parent=window.parent&mode=function&function=GrabImage&addUrlImage=yes",
        tip: "add a spatial feature"
    }, function(pushbox) {

        (parent.window || window).GrabImage = function(layer, mime, error) {
            me.setValue((me.getValue() || "") + '<a href="' + layer + '">doc.kml</a>');
            pushbox.close();

        };

    });

    uploader.acceptExts(["shp", "kml", "kmz", "zip"]);


};
var UITextFieldLayerList = function() {



    var mediaSelection=(new UITextFieldMediaSelection(this));

    var listEl=mediaSelection.renderToolbar({
        className:'spatial-files'
    });


    new AjaxFileUploader(listEl,{
        types:["document"],
        selectFile:function(fileinfo, type){
            me.setValue((me.getValue() || "") + fileinfo.html);
        }
    })


    mediaSelection.addParser(JSTextUtilities.ParseLinks, function(container, link, callback) {



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

