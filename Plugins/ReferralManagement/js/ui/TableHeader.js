var TableHeader = (function() {




	/**
	 * @deprecated User server config
	 */
	 var layoutDefault = {};
	
	//   {



	// 	'icon': {
	// 		width: '30px'
	// 	},
	// 	'id': {
	// 		width: '60px',
	// 		label: 'ID #',
	// 		tip:"These IDs are automatically assigned"
	// 	},
	// 	'auth': {
	// 		maxWidth: '150px',
	// 		label: 'Auth #',
	// 		"@": [

	// 		],
	// 		collapseAt:'80px',
	// 		tip:"The should be included in the referral letter"
	// 	},
	// 	'created': {
	// 		width: 'auto',
	// 		maxWidth: '250px',
	// 		"--hidden": true,
	// 		label: "Submitted",
	// 		collapseAt:'55px'
	// 	},

	// 	'name': {
	// 		width: 'auto',
	// 		minWidth: '250px',
	// 		label: "Name"
	// 	},
	// 	'user': {
	// 		width: 'auto',
	// 		maxWidth: '250px',
	// 		label: 'Submitter',
	// 		collapseAt:'70px'
	// 	},

	// 	'type': {
	// 		width: 'auto',
	// 		maxWidth: '250px',
	// 		label: "Type",
	// 		collapseAt:'120px'
	// 	},
	// 	'keywords': {
	// 		width: 'auto',
	// 		maxWidth: '250px',
	// 		label: "Keywords",
	// 		hidden: true,
	// 		collapseAt:'150px'
	// 	},
	// 	'modified': {
	// 		width: 'auto',
	// 		maxWidth: '250px',
	// 		label: "Last Edit",
	// 		collapseAt:'70px'
	// 	},
	// 	'attachments': {
	// 		width: 'auto',
	// 		maxWidth: '250px',
	// 		label: "Attachments",
	// 		collapseAt:'150px'
	// 	},
	// 	'community': {
	// 		width: 'auto',
	// 		maxWidth: '250px',
	// 		hidden: true,
	// 		label: "Community",
	// 		collapseAt:'150px'
	// 	},

	// 	'status': {
	// 		width: 'auto',
	// 		maxWidth: '250px',
	// 		hidden: true,
	// 		collapseAt:'150px'
	// 	},

	// 	'selection': {
	// 		width: '30px',
	// 		tip:"Selected items can be viewed together on the map"
	// 	}



	// };


	// DashboardConfig.getValue('enableProposals', function(enabled) {
	// 	layoutDefault.user.label = enabled ? 'Submitter' : "Created by";
	// });



	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "projectTableLayout",
		'field': "layout"
	})).addEvent('success',function(response){
		layoutDefault=response.value;
		// DashboardConfig.getValue('enableProposals', function(enabled) {
		// 	layoutDefault.user.label = enabled ? 'Submitter' : "Created by";
		// });
	}).execute();


	


	var TableHeader = new Class_({
		Implements:[Events],
		initialize: function() {


			DashboardPageLayout.addLayout("singleProjectListItemTableDetail", function(content) {

				//var map = ['name', 'owner', 'date', 'time', 'tag', 'docs', 'approval', 'ownership'];

				//var columnIds=['col-name', 'col-user', 'col-created', 'col-modified', 'col-type', 'col-apporval', 'col-ownership']

				var removeCols = ['col-approval', 'col-ownership', ];


				if (ProjectTeam.GetAllCommunities().length === 1) {
					removeCols.push('col-community')
				}


				if (!DashboardConfig.getValue('enableProposals')) {
					removeCols.push('col-status');
					removeCols.push('col-auth');
				}

				content = content.filter(function(m) {
					return removeCols.indexOf(m.getIdentifier()) < 0;
				})

				var order = Object.keys(layoutDefault)
				content.sort(function(a, b) {
					var aId = a.getIdentifier().split('col-').pop();
					var bId = b.getIdentifier().split('col-').pop();

					var aOrder = order.indexOf(aId);
					var bOrder = order.indexOf(bId);
					if (aOrder == -1) {
						aOrder = Infinity;
					}
					if (bOrder == -1) {
						bOrder = Infinity;
					}

					return aOrder - bOrder;
				});


				return content;
			});


		},


		labelForCol: function(col) {

			if (!col) {
				return "";
			}

			if (layoutDefault[col] && layoutDefault[col].label) {
				return layoutDefault[col].label;
			}
			return col;
		},

		setTipFor:function(col, el){

			if(layoutDefault[col]&&layoutDefault[col].tip){
				new UIPopover(el,{
			        description:layoutDefault[col].tip,
			        //anchor:UIPopover.AnchorAuto()
			    });
		    }
		},

		render: function(listModule) {

			var me = this;
			this._listModule = listModule;

			listModule.once('remove', function() {
				me._remove();
			});


			//this._addStyle();


			listModule.getSortObject(function(sort) {
				sort.hide();
			});

			listModule.getFilterObject(function(filter) {
				filter.hide();
			});


			listModule.runOnceOnLoad(function() {

				var module = listModule.getDetailViewAt(0);
				if (!module) {
					listModule.once('loadItem', function(module) {
						me._createHeaderFromContent(module, function() {
							me._addHeaderBehavior();
						});

					});
					return;
				}

				me._createHeaderFromContent(module, function() {
					me._addHeaderBehavior();
				});



			});


		},

		_getLayout: function(dataCol) {
			return ObjectAppend_({
				width: 'auto'
			}, layoutDefault[dataCol]);
		},

		_addFieldStyle: function(dataCol) {

			if ((!dataCol) || dataCol == '') {
				return;
			}

			if (!this._dataCols) {
				this._dataCols = [];
			}

			if (this._dataCols.filter(function(data) {
					return data.col == dataCol;
				}).length == 0) {
				this._dataCols.push(ObjectAppend_(this._getLayout(dataCol), {
					col: dataCol
				}));
			}


			this._redrawStyles();

		},

		_getStaticCells: function() {
			return this._dataCols.filter(function(cell) {
				return cell.width != 'auto' && cell.hidden !== true;;
			});
		},

		_getDynamicCells: function() {
			return this._dataCols.filter(function(cell) {
				return cell.width == 'auto' && cell.hidden !== true;
			});
		},

		_getCollapsedCells:function(cellWidthEstimate){

			
			var collapsedCells= this._dataCols.filter(function(cell) {
				return cell.collapseAt&&parseFloat(cell.collapseAt)>cellWidthEstimate && cell.hidden !== true;
			});

			var collapsedColNames=collapsedCells.map(function(cell){ return cell.col; });

			if(JSON.stringify(this._collapsedCols||[])!==JSON.stringify(collapsedColNames)){
				var last=this._collapsedCols||[];
				this._collapsedCols=collapsedColNames;

				var expandedCols=last.filter(function(col){
					return collapsedColNames.indexOf(col)==-1;
				});
				if(expandedCols.length){
					this.fireEvent('expanded', [expandedCols, cellWidthEstimate]);
				}

				var collapsedCols=collapsedColNames.filter(function(col){
					return last.indexOf(col)==-1;
				});
				if(collapsedCols.length){
					this.fireEvent('collapsed', [collapsedCols, cellWidthEstimate]);
				}

			}

			return collapsedCells;


		},

		_getHiddenCells: function() {
			return this._dataCols.filter(function(cell) {
				return cell.hidden === true;
			});
		},

		_getDynamicCellsWithMax: function(available, dynamicCells) {

			var dynamic = dynamicCells || this._getDynamicCells();
			var availableEach = available / dynamic.length;

			var filterFn = function(cell) {
				return cell.maxWidth && parseFloat(cell.maxWidth) < availableEach;
			};

			var maxed = dynamic.filter(filterFn);

			if (maxed.length) {
				var nextAvailable = available;
				maxed.forEach(function(cell) {
					nextAvailable -= parseFloat(cell.maxWidth);
				});
				return maxed.concat(this._getDynamicCellsWithMax(nextAvailable, dynamic.filter(function(cell) {
					return !filterFn(cell);
				})));
			}

			return [];

		},

		_getDynamicCellsWithMin: function(available, dynamicCells) {

			var dynamic = dynamicCells || this._getDynamicCells();
			var availableEach = available / dynamic.length;

			var filterFn = function(cell) {
				return cell.minWidth && parseFloat(cell.minWidth) > availableEach;
			};

			var minned = dynamic.filter(filterFn);

			if (minned.length) {
				var nextAvailable = available;
				minned.forEach(function(cell) {
					nextAvailable -= parseFloat(cell.minWidth);
				});
				return minned.concat(this._getDynamicCellsWithMin(nextAvailable, dynamic.filter(function(cell) {
					return !filterFn(cell);
				})));
			}

			return [];

		},

		_redrawStyles: function() {

			if (!this._style) {
				this._addStyle();
				this._resizeEventListener = this._redrawStyles.bind(this);
				window.addEvent('resize', this._resizeEventListener);
			}

			var now = (new Date()).getTime();

			if (!this._lastWrite) {
				this._lastWrite = now - 100;
				setTimeout(function() {
					me._redrawStyles();
				}, 250);
			}


			if (this._timeout) {

				if (now - this._lastWrite > 250) {
					this._writeStyles();
				}
				clearTimeout(this._timeout);
			}
			var me = this;
			this._timeout = setTimeout(function() {

				me._timeout = null;
				me._writeStyles();
			}, 500);

		},

		_filterColsIn:function(list, blacklist){

			var blackListCols = blacklist.map(function(cell) {
				return cell.col;
			});
			return  list.filter(function(cell) {
				return blackListCols.indexOf(cell.col) == -1;
			});

		},

		_calcCellsWidth:function(list, field){

			var total = 0;
			list.forEach(function(cell) {
				total += parseFloat(cell[field]);
			});
			return total;
		},

		_getEstimatedCellWidth:function(){
			var size = this._listModule.getElement().getSize();
			var padding = 2 * 10;
			
			var staticCells = this._getStaticCells();
			var dynamicCells = this._getDynamicCells()
			var staticWidthTotal = this._calcCellsWidth(staticCells, 'width');
			var available = size.x - (staticWidthTotal + padding);

			var cellWidthEstimate=available/dynamicCells.length;
			return cellWidthEstimate;
		},

		

		_writeStyles: function() {

			this._lastWrite = (new Date()).getTime();

			var size = this._listModule.getElement().getSize();
			if(size.x==0){
				return;
			}
			var padding = 2 * 10;
			
			var cellWidthEstimate=this._getEstimatedCellWidth();

			var closest50Class='cell-width-est-'+Math.round(cellWidthEstimate/50)*50;

			this._listModule.getElement().setAttribute('data-cell-width-est', cellWidthEstimate);

			if(this._lastClassWidth!=closest50Class){
				this._listModule.getElement().removeClass(this._lastClassWidth);
				this._listModule.getElement().addClass(closest50Class);
				this._lastClassWidth=closest50Class;
			}

			var collapsedCells=this._getCollapsedCells(cellWidthEstimate);




			var staticCells = this._getStaticCells();
			var dynamicCells = this._getDynamicCells()

			dynamicCells = this._filterColsIn(dynamicCells, collapsedCells);
			staticCells = this._filterColsIn(staticCells, collapsedCells);

			var staticWidthTotal = this._calcCellsWidth(staticCells, 'width');
			

			var available = size.x - (staticWidthTotal + padding);


			
			var minnedOutItems = this._getDynamicCellsWithMin(available, dynamicCells);
			dynamicCells=this._filterColsIn(dynamicCells, minnedOutItems);
			

			var minnedOutWidth = this._calcCellsWidth(minnedOutItems, 'minWidth');
			

			var maxedOutItems = this._getDynamicCellsWithMax(available - minnedOutWidth, dynamicCells);
			dynamicCells=this._filterColsIn(dynamicCells, maxedOutItems);
			var maxedOutWidth = this._calcCellsWidth(maxedOutItems, 'maxWidth');
			

			var auto = Math.round(1000 / dynamicCells.length) / 10;
			var staticWidthTotalPerItem = Math.round(10 * (minnedOutWidth + maxedOutWidth + staticWidthTotal + padding) / dynamicCells.length) / 10;


			var hiddenCells = this._getHiddenCells();

			this._style.innerHTML =
				dynamicCells.map(function(cell) {
					return '[data-col="' + cell.col + '"]{ width: calc( ' + auto + '% - ' + staticWidthTotalPerItem + 'px ); }';
				}).join("\n") + "\n" +
				minnedOutItems.map(function(cell) {
					return '[data-col="' + cell.col + '"]{ width:' + cell.minWidth + '; }';
				}).join("\n") + "\n" +
				maxedOutItems.map(function(cell) {
					return '[data-col="' + cell.col + '"]{ width:' + cell.maxWidth + '; }';
				}).join("\n") + "\n" +
				staticCells.map(function(cell) {
					return '[data-col="' + cell.col + '"]{ width:' + cell.width + '; }';
				}).join("\n") + "\n" +
				hiddenCells.concat(collapsedCells).map(function(cell) {
					return 'div.field-value-module.inline[data-col="' + cell.col + '"]{ display:none; }';
				}).join("\n");

		},

		_addStyle: function() {


			this._listModule.getElement().addClass("_tableStyle_");

			this._style = document.head.appendChild(new Element("style", {
				"type": "text/css",
				"html": ""
			}));


		},

		_createHeaderFromContent: function(module, then) {
			var me = this;
			module.once('load', function() {
				console.log('loaded: ');
			})
			module.once('display', function() {
				console.log('loaded: ' + module.getElement().innerHTML);
				me._headerString = module.getElement().innerHTML;
				then();
			})

		},

		_addHeaderBehavior: function() {

			var me = this;
			this._listModule.on('load', function() {

				me._renderHeader();

			});

			this._renderHeader();


		},

		_renderHeader: function() {

			var listEl = this._listModule.getElement();

			var header = this._makeHeaderEl();

			if (listEl.firstChild) {
				var child = listEl.firstChild;
				while (child.hasClass('loading') || child.hasClass('uilist-pagination')) {
					child = child.nextSibling;
				}
				if (child) {
					listEl.insertBefore(header, child);
					return;
				}
			}


			listEl.appendChild(header);



		},

		_makeHeaderEl: function() {

			var me = this;

			var header = new Element('div', {
				"class": "table-header",
				html: this._headerString
			});


			if(AppClient.getUserType()!="admin"){
				(new UIModalFormButton(header.AppendChild(new Element('button')), GatherDashboard.getApplication(), this._listModule.getItem(), {
					"formName": "tableLayoutForm",
					"formOptions": {
						template: "form",
						closeable:false
					}
				}));

      		}
			
			header.firstChild.firstChild.childNodes.forEach(function(colEl) {

				colEl.addClass('sortable');

				var column = colEl.getAttribute('data-col');

				me._addFieldStyle(column);

				colEl.setAttribute('data-label', me.labelForCol(column));

				if (me._sort == column) {
					colEl.addClass('active');
					if (me._sortInv) {
						colEl.addClass('asc');
					}
				}


				me.setTipFor(column, colEl);


				if (!ProjectList.HasSortFn(column)) {
					colEl.addClass('disabled');
					return;
				}

				colEl.addEvent('click', function() {



					var sortModule = me._listModule.getSortObject();

					if (!sortModule) {


						/**
							* Not going to render this temporary module, but it should still work
							*/

						sortModule = (new ListSortModule(function() {
							return me._listModule;
						}, {
							sorters: ProjectList.projectSorters()
						}));

						me._listModule.setSortObject(sortModule);

						/**
							*
							*/

					}

					sortModule.applySort(column);
					if (me._sort == column) {
						me._sortInv = !me._sortInv;
					} else {
						me._sortInv = false;
					}
					me._sort = column;



				});
			});


			return header;
		},

		_remove: function() {

			if (this._resizeEventListener) {
				window.removeEvent('resize', this._resizeEventListener);
			}

			this._style.parentNode.removeChild(this._style);
			this._style = null;
		}

	});



	return TableHeader;



})()