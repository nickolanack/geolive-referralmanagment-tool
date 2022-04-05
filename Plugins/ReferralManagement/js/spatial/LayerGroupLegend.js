'use strict';

var LayerGroupLegend = (function() {



    var iconset = null;
    var iconsetQuery = null;
    var popoverQueue = [];


    var LayerGroupLegend = new Class({

        initialize: function(map) {



        }


        setMap:function(map){

            if(this._map&&this._map!==map){
                this._remove();
                return;
            }


            if(!this._map){
                this._map=map;
                map.once('remove', function(){
                    this._remove();
                });
            }


        },

        _remove:function(){


            this._map=null;
            popoverQueue=null;
        },
        


        FormatLegend: function(group, legend) {


            var me=this;
            this.setMap(legend.getMap());
            var element = legend.getElement();


            element.addClass(group /*"'.$groupName.($i>3?' bottom-align':'').'"*/ );
            LegendHelper.addLegend(legend);
            element.addEvent("click", function(e) {
                if (e.target == element) {
                    legend.toggle();
                }
            });
            var p = new UIPopover(element, {
                description: '',
                anchor: UIPopover.AnchorTo(["right"])
            });

            me._makeMouseover(group, p);

            legend.addEvent("toggle", function() {
                p.hide();
            });
            var checkState = function() {



                if (legend.countVisibleLayers() == 0) {
                    element.removeClass("active");
                } else {
                    element.addClass("active");
                }

                if (legend.countVisibleLayers() == legend.countLayers()) {
                    element.addClass("all");
                } else {
                    element.removeClass("all")
                }


            };
            checkState();
            legend.addEvent("renderLayer", checkState);
            legend.addEvent("change", checkState);

            element.appendChild(new Element("span", {
                "class": "indicator-switch",
                "events": {
                    "click": function() {
                        var layers = legend.getLayers();

                        if (legend.countVisibleLayers() > 0) {

                            layers.forEach(function(layer) {
                                layer.hide();
                            });

                            checkState();
                            return;
                        }


                        layers.forEach(function(layer) {
                            layer.show();
                        });
                        checkState();

                    }
                }
            }));

            if (!(AppClient.getUserType() == "admin" || ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isTeamManager())) {
                return;
            }


            var formName = group + "UploadForm";
            setTimeout(function() {


                var application = ReferralManagementDashboard.getApplication()
                if (application.getDisplayController().hasNamedFormView(formName)) {


                    var GroupUpload = new Class({
                        Extends: DataTypeObject,
                        Implements: [Events],
                        getDescription: function() {
                            return "";
                        },
                        setDescription: function(d) {
                            console.log(d);
                            this.file = Proposal.ParseHtmlUrls(d);
                        },
                        save: function(cb) {

                            var me = this;
                            var AddDocumentQuery = new Class({
                                Extends: AjaxControlQuery,
                                initialize: function() {
                                    this.parent(CoreAjaxUrlRoot, "upload_tus", Object.append({
                                        plugin: "ReferralManagement"
                                    }, {
                                        data: me.file || null
                                    }));
                                }
                            });
                            (new AddDocumentQuery).addEvent("success", function() {
                                cb(true)
                            }).execute();
                        }
                    });

                    var button = legend.element.appendChild(new Element("button", {
                        "class": "grp-layer-upload"
                    }));
                    new UIModalFormButton(
                        button,
                        application, new GroupUpload(), {
                            formName: formName,
                            formOptions: {
                                template: "form"
                            }

                        }
                    )
                }

            }, 1000);



        },


        EditLayerScript: function(map, name, layerObject, defaultBehaviorFn) {

            if (name == "project") {
                SpatialProject.editLayer(map, layerObject);
            }


        },


        ShouldShowLayerScript: function(group, lid, layer) {

            if (LayerGroupItemList.getLayerGroupItems(group).map(function(l) {
                    return l.getId();
                }).indexOf(lid) >= 0) {
                return true;
            }

            return layer.options.group === group;
        },


        _makeMouseover: function(group, popover) {

            var me=this;
            if (!iconsetQuery) {
                iconsetQuery = (new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration", {
                    'widget': "iconset"
                })).addEvent('success', function(response) {
                    iconset = response.parameters;
                    popoverQueue.forEach(function(args) {
                        me.prototype._makeMouseover.apply(null, args);
                    });
                    popoverQueue = null;
                }).execute();
            }

            if (!iconset) {
                if (!popoverQueue) {
                    popoverQueue = [];
                }
                popoverQueue.push([group, popover]);
                return;
            }

            popover.setText(iconset[group + "Mouseover"]);


        },



    });



    return new LayerGroupLegend();


})();