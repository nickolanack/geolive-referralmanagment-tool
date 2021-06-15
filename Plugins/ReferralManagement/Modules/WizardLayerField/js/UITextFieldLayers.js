
var UITextFieldLayerBrowser = function() {

    var me = this;

    me._getElement().setStyle("display", "none");

    var bar = UITextField.RenderMediaBrowserBar.bind(me)();

    UploadForm.FileBrowserSelect(bar, {
        className: "layer noIcon",
        url: CoreContentUrlRoot + "&format=raw&controller=plugins&plugin=ReferralManagement&view=plugin&pluginView=browser.layers&parent=window.parent&mode=function&function=GrabImage&addUrlImage=yes",
        tip: "add a spatial feature"
    }, function(pushbox) {

        (parent.window || window).GrabImage = function(layer, mime, error) {
            if (me.editorType == "text") {
                me.setValue((me.getValue() || "") + '<a href="' + layer + '">doc.kml</a>');
            //alert(img);
            }
            pushbox.close();

        };

    });



};
var UITextFieldLayerList = function() {



    var me = this;
    var listEl = UITextField.RenderMediaSelectionBar.bind(me)({
        className:'spatial-files'
    });


    new AjaxFileUploader(listEl,{
        types:["document"],
        selectFile:function(fileinfo, type){
            if (me.editorType == "text") {
                me.setValue((me.getValue() || "") + fileinfo.html);
            }
        }
    })


    UITextField.AddMediaListParser.bind(me)(listEl, JSTextUtilities.ParseLinks, function(container, link, callback) {



        (new DocumentModule({
            textQuery: function(callback) {
                callback(link.url);
            },
            //"class": ,
            width: 32,
            height: 32,
            download: false,
            //setBackgroundImage: true
        })).addEvent('load', callback).load(null, container, null);


        // (new ImageModule({
        //         textQuery: function(callback) {
        //             callback(CoreContentUrlRoot + "&format=raw&controller=plugins&plugin=Maps&view=plugin&pluginView=kml.tile&kml=" + encodeURIComponent(link.url));
        //         },
        //         width: 32,
        //         height: 32
        //     })).addEvent('load', callback).load(null, container, null);


    }, {
        className: 'spatial-file'
    });





};

