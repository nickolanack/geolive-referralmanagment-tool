var TableHeader = (function() {



	var layoutDefault = {

		

		'icon': {
			width: '30px',

		},
		'id': {
			width: '60px',
			label:'ID #'
		},
		'auth': {
			width: 'auto',
			maxWidth:'250px',
			label:'Auth #'
		},
		'created': {
			width: 'auto',
			maxWidth:'250px',
			hidden:true,
			label:"Submitted"
		},
		
		'name': {
			width: 'auto',
			minWidth:'250px',
			label:"Name"
		},
		'user': {
			width: 'auto',
			maxWidth:'250px',
			label:'Submitter'
		},
		
		'type': {
			width: 'auto',
			maxWidth:'250px',
			label:"Type"
		},
		'modified': {
			width: 'auto',
			maxWidth:'250px',
			label:"Last Edit"
		},
		'attachments': {
			width: 'auto',
			maxWidth:'250px',
			label:"Attachments"
		},
		'community': {
			width: 'auto',
			maxWidth:'250px',
			hidden:true,
			label:"Community"
		},

		'status':{
			width: 'auto',
			maxWidth:'250px',
			hidden:true,
		},
		
		'selection': {
			width: '100px'
		},

		
	}



	var TableHeader = new Class_({


		initialize:function(){


			DashboardPageLayout.addLayout("singleProjectListItemTableDetail", function(content) {

				//var map = ['name', 'owner', 'date', 'time', 'tag', 'docs', 'approval', 'ownership'];

				//var columnIds=['col-name', 'col-user', 'col-created', 'col-modified', 'col-type', 'col-apporval', 'col-ownership']

				var removeCols = ['col-approval', 'col-ownership', ];


				if(ProjectTeam.GetAllCommunities().length===1){
					removeCols.push('col-community')
				}
		   

				if(!DashboardConfig.getValue('enableProposals')){
					removeCols.push('col-status');
					removeCols.push('col-auth');
				}

				content = content.filter(function(m) {
					return removeCols.indexOf(m.getIdentifier()) < 0;
				})

				var order=Object.keys(layoutDefault)
				content.sort(function(a, b){
					var aId=a.getIdentifier().split('col-').pop();
					var bId=b.getIdentifier().split('col-').pop();

					var aOrder=order.indexOf(aId);
					var bOrder=order.indexOf(bId);
					if(aOrder==-1){
						aOrder=Infinity;
					}
					if(bOrder==-1){
						bOrder=Infinity;
					}

					return aOrder-bOrder;
				});


				return content;
			});


		},


		labelForCol: function(col) {

			if (!col) {
				return "";
			}

			if(layoutDefault[col]&&layoutDefault[col].label){
				return layoutDefault[col].label;
			}
			return col;
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

		_getLayout:function(dataCol){
			return ObjectAppend_({ width: 'auto'}, layoutDefault[dataCol]);
		},

		_addFieldStyle: function(dataCol) {

			if((!dataCol)||dataCol==''){
				return;
			}

			if (!this._dataCols) {
				this._dataCols = [];
			}

			if(this._dataCols.filter(function(data){
				return data.col==dataCol;
			}).length==0){
				this._dataCols.push(ObjectAppend_(this._getLayout(dataCol), {col: dataCol}));
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

		_getHiddenCells: function() {
			return this._dataCols.filter(function(cell) {
				return cell.hidden === true;
			});
		},

		_getDynamicCellsWithMax:function(available, dynamicCells){

			var dynamic=dynamicCells||this._getDynamicCells();
			var availableEach=available/dynamic.length;

			var filterFn=function(cell){
				return cell.maxWidth&&parseFloat(cell.maxWidth)<availableEach;
			};

			var maxed = dynamic.filter(filterFn);

			if(maxed.length){
				var nextAvailable=available;
				maxed.forEach(function(cell){
					nextAvailable-=parseFloat(cell.maxWidth);
				});
				return maxed.concat(this._getDynamicCellsWithMax(nextAvailable, dynamic.filter(function(cell){
					return !filterFn(cell);
				})));
			}

			return [];

		},

		_getDynamicCellsWithMin:function(available, dynamicCells){

			var dynamic=dynamicCells||this._getDynamicCells();
			var availableEach=available/dynamic.length;

			var filterFn=function(cell){
				return cell.minWidth&&parseFloat(cell.minWidth)>availableEach;
			};

			var minned = dynamic.filter(filterFn);

			if(minned.length){
				var nextAvailable=available;
				minned.forEach(function(cell){
					nextAvailable-=parseFloat(cell.minWidth);
				});
				return minned.concat(this._getDynamicCellsWithMin(nextAvailable, dynamic.filter(function(cell){
					return !filterFn(cell);
				})));
			}

			return [];

		},

		_redrawStyles: function() {

			if (!this._style) {
				this._addStyle();
				this._resizeEventListener=this._redrawStyles.bind(this);
				window.addEvent('resize', this._resizeEventListener);
			}

			var now=(new Date()).getTime();

			if(!this._lastWrite){
				this._lastWrite=now-100;
				setTimeout(function() {
					me._redrawStyles();
				}, 250);
			}


			if (this._timeout) {
				
				if(now-this._lastWrite>250){
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

		_writeStyles:function(){

			this._lastWrite=(new Date()).getTime();

			var size = this._listModule.getElement().getSize();
			var padding=2*10;
			var staticWidthTotal=0;

			var staticCells=this._getStaticCells();

			staticCells.forEach(function(c){
				staticWidthTotal+=parseFloat(c.width);
			});

			var dynamicCells=this._getDynamicCells()

			var available=size.x-(staticWidthTotal+padding);

			var minnedOutItems=this._getDynamicCellsWithMin(available);

			if(minnedOutItems.length){
				var minnedOutCols=minnedOutItems.map(function(cell){
					return cell.col;
				});
				dynamicCells=dynamicCells.filter(function(cell){
					return minnedOutCols.indexOf(cell.col)==-1;
				});
			}

			var minnedOutWidth=0;
			minnedOutItems.forEach(function(cell){
				minnedOutWidth+=parseFloat(cell.minWidth);
			});


			var maxedOutItems=this._getDynamicCellsWithMax(available-minnedOutWidth, dynamicCells);

			if(maxedOutItems.length){
				var maxedOutCols=maxedOutItems.map(function(cell){
					return cell.col;
				});
				dynamicCells=dynamicCells.filter(function(cell){
					return maxedOutCols.indexOf(cell.col)==-1;
				});
			}

			var maxedOutWidth=0;
			maxedOutItems.forEach(function(cell){
				maxedOutWidth+=parseFloat(cell.maxWidth);
			});

			var auto=Math.round(1000/dynamicCells.length)/10;
			var staticWidthTotalPerItem=Math.round(10*(minnedOutWidth+maxedOutWidth+staticWidthTotal+padding)/dynamicCells.length)/10;


			var hiddenCells=this._getHiddenCells();

			this._style.innerHTML = 
				dynamicCells.map(function(cell){
					return '[data-col="' + cell.col + '"]{ width: calc( '+auto+'% - '+staticWidthTotalPerItem+'px ); }';
				}).join("\n")+"\n"+
				minnedOutItems.map(function(cell){
					return '[data-col="' + cell.col + '"]{ width:'+cell.minWidth+'; }';
				}).join("\n")+"\n"+
				maxedOutItems.map(function(cell){
					return '[data-col="' + cell.col + '"]{ width:'+cell.maxWidth+'; }';
				}).join("\n")+"\n"+
				staticCells.map(function(cell){
					return '[data-col="' + cell.col + '"]{ width:'+cell.width+'; }';
				}).join("\n")+"\n"+
				hiddenCells.map(function(cell){
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
				var child=listEl.firstChild;
				while(child.hasClass('loading')||child.hasClass('uilist-pagination')){
					child=child.nextSibling;
				}
				if(child){
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


			header.firstChild.firstChild.childNodes.forEach(function(colEl) {

				colEl.addClass('sortable');

				var sort = colEl.getAttribute('data-col');

				me._addFieldStyle(sort);

				colEl.setAttribute('data-label', me.labelForCol(sort));

				if (me._sort == sort) {
					colEl.addClass('active');
					if (me._sortInv) {
						colEl.addClass('asc');
					}
				}


				if (!ProjectList.HasSortFn(sort)) {
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

					sortModule.applySort(sort);
					if (me._sort == sort) {
						me._sortInv = !me._sortInv;
					} else {
						me._sortInv = false;
					}
					me._sort = sort;



				});
			});


			return header;
		},

		_remove: function() {

			if(this._resizeEventListener){
				window.removeEvent('resize', this._resizeEventListener);
			}

			this._style.parentNode.removeChild(this._style);
			this._style = null;
		}

	});



	return TableHeader;



})()