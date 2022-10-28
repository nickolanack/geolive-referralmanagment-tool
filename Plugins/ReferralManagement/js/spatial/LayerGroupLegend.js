'use strict';


var LayerGroupLegend = (function() {



    var iconset = null;
    var iconsetQuery = null;
    var popoverQueue = [];

    var LayerGroup = new Class_({


        initialize: function(group, legend) {

            var me = this;

            var element = legend.getElement();


            this.element=element;
            this.legend=legend;
            this.group=group;


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

            this._makeMouseover(group, p);

            legend.addEvent("toggle", function() {
                p.hide();
            });
            
            this._checkState();

            legend.addEvent("renderLayer", this._checkState.bind(this));
            legend.addEvent("change", this._checkState.bind(this));


            

            element.appendChild(new Element("span", {
                "class": "indicator-switch",
                "events": {
                    "click": function() {
                        var layers = legend.getLayers();

                        if (legend.countVisibleLayers() > 0) {

                            layers.forEach(function(layer) {
                                layer.hide();
                            });

                            me._checkState();
                            return;
                        }


                        layers.forEach(function(layer) {
                            layer.show();
                        });
                        me._checkState();

                    }
                }
            }));

            if (!(AppClient.getUserType() == "admin" || ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isTeamManager())) {
                return;
            }



            legend.addEvent("renderLayer", function(layerMeta, legendItem) {


                //console.log(legendItem);
                var el = legendItem.getElement()
                el.insertBefore(new Element('button', {
                    "class": "download-link",
                    events: {
                        click: function(e) {


                            e.stop();

                            var layerQuery = new StringControlQuery(CoreAjaxUrlRoot, 'layer_display', {
                                layerId: layerMeta._id || layerMeta.id,
                                format: 'kml',
                                options: {}
                            });

                            window.open(layerQuery.getUrl(true), 'Download');

                        }
                    }
                }), el.lastChild);

            });


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
        _checkState:function() {

            var me=this;

            if (this._stateTimeout) {
                clearTimeout(this._stateTimeout);
            }

            this._stateTimeout = setTimeout(function() {

                me._stateTimeout = null;

                if ((me.legend.countVisibleLayers()+me.legend.countLoadingLayers()) == 0) {
                    me.element.removeClass("active");
                } else {
                   me.element.addClass("active");
                }

                if (me.legend.countVisibleLayers() == me.legend.countLayers()) {
                    me.element.addClass("all");
                } else {
                    me.element.removeClass("all")
                }

            }, 200);

        },
        _makeMouseover: function(group, popover) {

            var me = this;
            if (!iconsetQuery) {
                iconsetQuery = (new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration", {
                    'widget': "iconset"
                })).addEvent('success', function(response) {
                    iconset = response.parameters;
                    popoverQueue.forEach(function(args) {
                       me._makeMouseover.apply(me, args);
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



    var LayerGroupLegend = new Class({

        initialize: function() {



        },


        setMap: function(map) {

            if (this._map && this._map !== map) {
                this._remove();
                return;
            }

            var me = this;
            if (!this._map) {
                this._map = map;
                map.once('remove', function() {
                    me._remove();
                });
            }


        },

        _remove: function() {

            this._map = null;
            popoverQueue = null;
        },



        FormatLegend: function(group, legend) {

            this.setMap(legend.getMap());

            new LayerGroup(group, legend);



        },


        EditLayerScript: function(map, name, layerObject, defaultBehaviorFn) {

            //if (name == "project") {
            SpatialProject.editLayer(map, layerObject);
            // }


        },


        ShouldShowLayerScript: function(group, lid, layer) {

            if (LayerGroupItemList.getLayerGroupItems(group).map(function(l) {
                    return l.getId();
                }).indexOf(lid) >= 0) {
                return true;
            }

            return layer.options.group === group;
        }



    });



    return new LayerGroupLegend();


})();