/**
 * @package    Geolive - Extensions
 * @subpackage Modules
 * @author  Nicholas Blackwell
 * @license Geolive (Extensions) by Nicholas Blackwell is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License. 
 */

var ProposalsModule = new Class({
    Extends: Module,
    initialize: function(map, options) {

        var me = this;
        me.map = map;
        me.parent(Object.append({
            onDisplayElement:function(){}
        },options));

    },
    options: {
        moduleName: "Proposals Module",
        moduleDescription: "Displays list of proposals"
    },
    process: function() {
        var me = this;
        var module = this; //use this inside aggregator. since 'me' is overridden there.

        me.fireEvent('load');

        var ProjectListQuery = new Class({
            Extends: AjaxControlQuery,
            initialize: function() {
                this.parent(CoreAjaxUrlRoot, 'list_proposals', {
                    plugin: 'ReferralManagement'
                });
            }
        });


        me.node.addClass('ProposalsModule');

        
        var filterOptions=[{"label":"All", "selected":true}, {"label":"Gov't"}, {"label":"Company"}]

        

        var renderMenu=function(menuOpts, parentEl, callback){

            var filterMenu=new Element('ul', {"class":"filter-menu"});

            menuOpts.forEach(function(filterItem){
                var filterEl=filterMenu.appendChild(new Element('li',{html:filterItem.label}));
                if(filterItem.selected===true){
                    filterEl.addClass("active");
                    callback(filterEl, filterItem);
                }
                filterEl.addEvent('click', function(){

                    callback(filterEl, filterItem);

                });
            });

            parentEl.appendChild(filterMenu);
            return filterMenu;
        }
        var curentFilterEl=null;
        var filterOptions=[{"label":"All", "selected":true}, {"label":"Gov't"}, {"label":"Company"}, {"label":"Scope"}]
        renderMenu(filterOptions, me.node, function(el, opt){
                if(curentFilterEl){
                    curentFilterEl.removeClass('active');
                }
                el.addClass('active');
                curentFilterEl=el;
        });

        

        

        var label = new Element('label');
        me.node.appendChild(label);


        var curentSortEl=null;
        var filterOptions=[{"label":"Date", "selected":true}, {"label":"Priority"}, {"label":"User"}]
        renderMenu(filterOptions, me.node, function(el, opt){
                if(curentSortEl){
                    curentSortEl.removeClass('active');
                }
                el.addClass('active');
                curentSortEl=el;
        }).addClass('sort');


        var list = new Element('ul');
        var div = new Element('div', {
            'class': 'geolive-results'
        });
        me.node.appendChild(div);
        div.appendChild(list);

        var ProposalsList = new Class({
            Extends: MarkerAggregator,
            _getRequest: function(filters) {
                return (new ProjectListQuery()).addEvent('onSuccess', function(r) {
                    if (r.success && r.results.length) {
                        label.innerHTML = 'There ' + (r.results.length == 1 ? "is" : "are") + ' ' + (r.results.length) + ' application' + (r.results.length == 1 ? "" : "s");
                    } else {
                        label.innerHTML = 'There are no applications';
                    }
                });
            }


        });



        var DeleteProposalQuery = new Class({
            Extends: AjaxControlQuery,
            initialize: function(id) {
                this.parent(CoreAjaxUrlRoot, 'delete_proposal', {
                    plugin: 'ReferralManagement',
                    id: id
                });
            }
        });


        var toolbarButtonClick = false;
        ProposalsList.RenderToolbar = function(buttons, options) {

            var config = Object.append({
                className: ''
            }, options);

            var s = new Element('span', {
                'class': 'toolbar-icons ' + config.className
            });



            Array.each(buttons, function(b) {

                var button = Object.append({
                    className: ''
                }, b);

                var b = new Element('span', {
                    'class': 't-btn active ' + button.className
                });
                b.appendChild(new Element('button', {
                    'class': 'btn-label',
                    'html': button.label,
                }));

                s.appendChild(b);
                b.addEvent('click', function() {
                    toolbarButtonClick = true; //prevents menu button clicks from activating row click handler.
                    button.click.bind(this)(arguments);
                });
            });

            return s;


        };

        if (me.options.showAdminControls) {
            div.appendChild(ProposalsList.RenderToolbar([{
                    label: 'Export Applications',
                    click: function() {



                        var ExportCSVQuery = new Class({
                            Extends: AjaxControlQuery,
                            initialize: function() {
                                this.parent(CoreAjaxUrlRoot, 'export_proposals', {
                                    plugin: 'ReferralManagement'
                                });
                            }
                        });

                        var exportQuery = new ExportCSVQuery();
                        //exportQuery.execute(); //for testing.
                        window.open(exportQuery.getUrl(true), 'Download'); //this is an ajax query, but should



                    }
                }


            ], {
                className: 'admin-tools'
            }));
        }


        var render = function(elementArray, elementDataArray) {

            list.empty();

            Array.each(elementArray, function(e, i) {
                var li = new Element('li', {"class":"proposal-item"});
                li.appendChild(e);
                list.appendChild(li);
            });

        };

        var aggregator = null;
        var map = me.map;
        aggregator = new ProposalsList(map, {
            maxResults: 10,
            moreResults: 10,
            MoreText: function(results, options) {
                return 'Show Next';
            },
            PreviousText: function(results, options) {
                return 'Show Previous';
            },
            ResultTemplate: function(result) {
                var me = this; //the aggregator.

                var proposal=new Proposal(result.id, result);

                var row = (function(result) {

                    var me = this;
                    var content = new Element('span', {
                        'class': 'result-clickable result-proposal-admin urgency-'+result.computed.urgency+" status-"+result.status
                    });




                    content.addEvent('click', function() {
                        //defined as argument to aggregator.
                        (me.options.ResultClickEventFunction || function() {}).bind(me)(result, row);
                    });

                    var title = new Element('span', {
                        "data-id": "id = " + result.id,
                        "class": "prop-item"
                    });

                    var time = result.modifiedDate;
                    try {
                        time = (new Date(time)).timeAgoInWords();
                    } catch (e) {}

                    var modifiedStr = 'last modified';
                    if (result.modifiedDate == result.createdDate) {
                        modifiedStr = 'created';
                    }
                    title.innerHTML = (result.userdetails ? 'Application Name ' : 'Your Application Name ') + '<span class="prop-title">\'' + (result.attributes.title) + '\'</span> <span class="prop-modified">' + modifiedStr + ' ' + time + '</span>';

                    content.appendChild(title);
                    content.setStyle('display', 'block');



                    return content;

                }).bind(me)(result);


                var buttons = [{
                        label: 'edit',
                        click: function() {

                            var wizardTemplate = (map.getDisplayController().getWizardTemplate('ProposalTemplate'));
                            if ((typeof wizardTemplate) != 'function') {
                                throw 'Expecting Proposal Wizard';
                            }

                            var wizard = wizardTemplate((new Proposal(result.id)), {});

                            wizard.buildDefaultAndShow();
                        }

                    },

                    {
                        label: 'delete',
                        click: function() {

                            if (confirm('Are you sure you want to delete this proposal?')) {


                                (new DeleteProposalQuery(result.id)).addEvent('success', function() {

                                    aggregator.display(render); //refresh

                                }).execute();

                            }

                        }
                    }
                    // , {

                    //     label: 'status',
                    //     click: function() {


                    //         var wizardTemplate = (map.getDisplayController().getWizardTemplate('ProposalStatusTemplate'));
                    //         if ((typeof wizardTemplate) != 'function') {
                    //             throw 'Expecting Proposal Wizard';
                    //         }


                    //         var wizard = wizardTemplate((new Proposal(result.id)), {});

                    //         wizard.buildDefaultAndShow();

                    //     },
                    //     className: (!module.options.showAdminControls ? 'admin-btn' : '') //highlight this button since it is more useful to non admins


                    // }
                ];

                if (module.options.showAdminControls) {

                    buttons.push({

                        label: 'process',
                        click: function() {


                            var wizardTemplate = (map.getDisplayController().getWizardTemplate('ProcessProposalTemplate'));
                            if ((typeof wizardTemplate) != 'function') {
                                throw 'Expecting Proposal Wizard';
                            }


                            var wizard = wizardTemplate(proposal, {});
                            wizard.buildDefaultAndShow();

                        },
                        className: 'admin-btn'



                    });

                }

                module.options.onDisplayElement.bind(module)(row, proposal);
                row.appendChild(ProposalsList.RenderToolbar.bind(me)(buttons));

                row.addClass("priority-"+proposal.getPriority());

                if (module.options.showAdminControls) {


                    (new ProposalDetailModule(
                        proposal, {
                            attributes: result.attributes
                        }
                    )).load(
                        null,
                        row.appendChild(new Element('div', {
                            'class': 'admin-content'
                        })),
                        null
                    );

                }

                return row;
            },
            ResultClickEventFunction: function(result, row) {
                if (!toolbarButtonClick) {

                    //could reference 'me' instead of 'module' since it is not overriden to 
                    //reference the aggregator. like it is in ResultTemplate
                    if (module.options.showAdminControls) {
                        if (row.hasClass('selected')) {
                            row.removeClass('selected')
                        } else {
                            row.addClass('selected');
                        }
                    }


                }
                toolbarButtonClick = false;
            }
        });


        aggregator.display(render);
        if (me.options.menu && me.options.overlay) {
            me.options.menu.addEvent("onShow", function(overlay) {
                if (overlay == me.options.overlay) {
                    aggregator.display(render);
                }
            });
        }

    }

});