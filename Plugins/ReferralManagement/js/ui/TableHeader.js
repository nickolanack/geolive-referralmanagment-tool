var TableHeader = (function() {



	var TableHeadersClass=new Class({
		Implements:[Events],

		addHeader:function(instance){

			if(!this._headers){
				this._headers=[];
			}

			this._headers.push(instance);
			return this;

		},

		removeHeader:function(instance){

			if(!this._headers){
				return this;
			}

			var i=this._headers.indexOf(instance);

			if(i>=0){
				this._headers.splice(i, 1);
			}

			return this;

		},
		headersWithLayout:function(layoutName, cb){
			if(!this._headers){
				cb([]);
				return;
			}

			cb(this._headers.filter(function(item){
				return item.getLayoutName()==layoutName;
			}));

		},
		updateLayout:function(layoutName, options){

			//TODO: provide namespaced tableLayout using name 'projectTableLayout'
			var me=this;
			options.forEach(function(colData){
				me._layouts[layoutName][colData.col].hidden=colData.hidden;
			});

		},
		getLayout:function(layoutName){

			if(!this._layouts){
				throw 'Not initialized';
			}

			if(!this._layouts[layoutName]){
				throw 'Not initialized: '+layoutName;
			}

			return this._layouts[layoutName];
		},
		setLayout:function(layoutName, data){
			if(!this._layouts){
				this._layouts={};
			}

			this._layouts[layoutName]=data;
			this.fireEvent('load.'+layoutName);
		},
		loadLayout:function(layoutName, cb){

			if(!this._layouts){
				this._layouts={};
			}

			if(this._layouts[layoutName]){
				setTimeout(cb, 50);
				return;
			}

			this.once('load.'+layoutName, cb);


			var me=this;

			(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
				'widget': layoutName,
				'field': "layout"
			})).addEvent('success',function(response){
				me._layouts[layoutName]=response.value;
				me.fireEvent('load.'+layoutName);
			}).execute();

		}



	});


	var TableHeaders=new TableHeadersClass();
	


	var TableHeader = new Class_({
		Implements:[Events],
		initialize: function(layoutName, layout) {


			this._layoutName=layoutName;
			
			TableHeaders.addHeader(this);

			var me=this;
			DashboardPageLayout.addLayout("singleProjectListItemTableDetail", function(content, options, callback) {

				me.runOnceOnLoad(function(){

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


					var layoutDefault=TableHeaders.getLayout(me.getLayoutName());
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


					 callback(content);
				 });
			});


			if(layout){

				TableHeaders.setLayout(layoutName, layout);
				setTimeout(function(){
					me._isLoaded=true;
					me.fireEvent('load');
				},50);

				return;
			}

			TableHeaders.loadLayout(layoutName, function(){
				me._isLoaded=true;
				me.fireEvent('load');
			});


		},

		runOnceOnLoad:function(cb){
			if(this._isLoaded==true){
				cb();
				return;
			}
			this.once('load', cb);
		},

		getLayoutName:function(){
			return this._layoutName;
		},

		labelForCol: function(col) {

			if (!col) {
				return "";
			}

			var layoutDefault=TableHeaders.getLayout(this.getLayoutName());

			if (layoutDefault[col] && typeof layoutDefault[col].label=='string') {
				return layoutDefault[col].label;
			}
			return col;
		},

		setTipFor:function(col, el){

			var layoutDefault=TableHeaders.getLayout(this.getLayoutName());

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

			me.runOnceOnLoad(function(){
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
			});


		},

		_getLayout: function(dataCol) {


			var layoutDefault=TableHeaders.getLayout(this.getLayoutName());

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

		updateLayout(){

			var me=this;
			this._dataCols.forEach(function(data){
				ObjectAppend_(data, me._getLayout(data.col), {
					col: data.col
				});
			});

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

		_getEstimatedCellWidth:function(totalWidth){
			

			var padding = 2 * 10;
			
			var staticCells = this._getStaticCells();
			var dynamicCells = this._getDynamicCells()
			var staticWidthTotal = this._calcCellsWidth(staticCells, 'width');
			var available = totalWidth - (staticWidthTotal + padding);

			var cellWidthEstimate=available/dynamicCells.length;
			return cellWidthEstimate;
		},

		

		_writeStyles: function() {

			this._lastWrite = (new Date()).getTime();

			var size = this._listModule.getElement().getSize();
			if(size.x==0){
				return;
			}

			var coords = this._listModule.getElement().getCoordinates();
			var win=window.getSize();
			var sizeX=Math.min(size.x, win.x-coords.left); //this works if table takes all right space but is overflowing off the page


			var padding = 2 * 10;
			
			var cellWidthEstimate=this._getEstimatedCellWidth(sizeX);

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
			

			var available = sizeX - (staticWidthTotal + padding);


			
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
				}).join("\n")+"\n\n"+(([]).concat(dynamicCells, minnedOutItems, maxedOutItems, staticCells).map(function(cell){


					var style="";
					if(cell.align){
						style+='._tableStyle_>.ui-view [data-col="' + cell.col + '"]{ text-align: '+cell.align+'; } ';
					}
					
					return style;

				}).join("\n"))

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

			var header=this._header;

			if(!header){
				var header = this._makeHeaderEl();
				this._header=header;
			}

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

		_addFieldDecorations: function(colEl){
			
			var column = colEl.getAttribute('data-col');

			var colData=this._getLayout(column);
			colEl.setAttribute('data-label', this.labelForCol(column));

			if(colData.showLabel===false){
				colEl.addClass('hide-label');
			}else{
				colEl.addClass('show-label');
			}

			this.setTipFor(column, colEl);

			this._addFieldStyle(column);

		},

		addSort:function(name, fn){

			if(this._sortModule){
				this._sortModule.addSortFn(name, fn);
				return this;
			}

			this.once('initSort', function(sortModule){
				sortModule.addSortFn(name, fn);
			});

			return this;
		},

		_makeHeaderEl: function() {

			var me = this;

			var header = new Element('div', {
				"class": "table-header",
				html: this._headerString
			});


			var firstRow=header.firstChild;
				if(firstRow.tagName!='DIV'){
					firstRow=firstRow.nextSibling;
				}

			var tableCols=firstRow.firstChild.childNodes;


			tableCols.forEach(function(colEl) {
				me._addFieldDecorations(colEl);
			});

			
			me._listModule.getSortObject(function(sortModule){


				me.fireEvent('initSort', [sortModule]);
				me._sortModule=sortModule;

				if(!sortModule.hasSort('project')){

				}




				tableCols.forEach(function(colEl) {

					colEl.addClass('sortable');
					var column = colEl.getAttribute('data-col');


					if (me._sort == column) {
						colEl.addClass('active');
						if (me._sortInv) {
							colEl.removeClass('asc');
							colEl.addClass('desc');
						}
					}

					if (!sortModule.hasSort(column) /*ProjectList.HasSortFn(column)*/) {
						colEl.addClass('disabled');
						return;
					}

					colEl.addEvent('click', function() {



						var sortModule = me._listModule.getSortObject();

						if (!sortModule) {

							console.error('There was no list sort')
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

						var colData=me._getLayout(column)

						if(me._sortEl!=colEl&&colData.invertSort===true){
							sortModule.applySortInverted(column);
							me._sortInv=true;

						}else{
							sortModule.applySort(column);
						}

						if (me._sort == column) {
							me._sortInv = !me._sortInv;
						} else {
							me._sortInv = false;
						}
						me._sort = column;



						colEl.addClass('active');
						if (me._sortInv) {
							colEl.removeClass('asc');
							colEl.addClass('desc');
						}else{
							colEl.addClass('asc');
							colEl.removeClass('desc');
						}
						if(me._sortEl&&me._sortEl!=colEl){
							me._sortEl.removeClass('active');
							me._sortEl.removeClass('desc');
							me._sortEl.removeClass('asc');
						}
						me._sortEl=colEl;

					});
				});
			});

			if(AppClient.getUserType()=="admin"){
				var btn=new Element('button',{"class":"inline-edit"});
				(new UIModalFormButton(header.insertBefore(btn, header.firstChild), GatherDashboard.getApplication(), new MockDataTypeItem({
					'layout':me.getLayoutName() //TODO: use this to make tableLayoutForm generic and select config name
				}), {
					"formName": "tableLayoutForm",
					"formOptions": {
						template: "form",
						closeable:false
					}
				}));


				new UIPopover(btn, {
					application:GatherDashboard.getApplication(),
					item:new MockDataTypeItem({
						'layout':me.getLayoutName() 
					}),
					detailViewOptions:{
						"viewType": "form",
                    	"namedFormView": "tableLayoutForm",
                    	"formOptions": {
							template: "form",
							closeable:false
						}
					},
					clickable:true,
					anchor:UIPopover.AnchorAuto()
				});


      		}

			return header;
		},

		_remove: function() {

			if (this._resizeEventListener) {
				window.removeEvent('resize', this._resizeEventListener);
			}

			if(this._style&&this._style.parentNode){
				this._style.parentNode.removeChild(this._style);
			}
			this._style = null;
			this._sortModule=null;

			TableHeaders.removeHeader(this);
		}

	});

	TableHeader.UpdateLayout=function(options, layoutName){

		//TODO: provide namespaced tableLayout using name 'projectTableLayout'
		
		TableHeaders.updateLayout(layoutName, options);
		TableHeaders.headersWithLayout(layoutName, function(items){
			items.forEach(function(item){
				item.updateLayout();
			});
		});

	}


	return TableHeader;



})()