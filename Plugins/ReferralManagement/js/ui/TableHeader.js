var TableHeader = (function() {



	var layoutDefault = {
		'icon': {
			width: '30px',

		},
		'id': {
			width: '60px'
		},
		'name': {
			width: 'auto'
		},
		'user': {
			width: 'auto',
			maxWidth:'250px'
		},
		'created': {
			width: 'auto',
			maxWidth:'250px'
		},
		'modified': {
			width: 'auto',
			maxWidth:'250px'
		},
		'type': {
			width: 'auto',
			maxWidth:'250px'
		},
		'attachments': {
			width: 'auto',
			maxWidth:'250px',
		},
		'community': {
			width: 'auto',
			maxWidth:'250px'
		},
		'selection': {
			width: '30px'
		}
	}



	var TableHeader = new Class_({


		labelForCol: function(col) {

			if (!col) {
				return "";
			}

			if (col == "user") {
				return "submitter";
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
				return cell.width != 'auto';
			});
		},

		_getDynamicCells: function() {
			return this._dataCols.filter(function(cell) {
				return cell.width == 'auto';
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

		_redrawStyles: function() {

			if (!this._style) {
				this._addStyle();
				this._resizeEventListener=this._redrawStyles.bind(this);
				window.addEvent('resize', this._resizeEventListener);
			}

			if (this._timeout) {
				clearTimeout(this._timeout);
			}
			var me = this;
			this._timeout = setTimeout(function() {
				me._timeout = null;


				var size = me._listModule.getElement().getSize();
				var padding=2*10;
				var staticWidthTotal=0;

				var staticCells=me._getStaticCells();

				staticCells.forEach(function(c){
					staticWidthTotal+=parseFloat(c.width);
				});

				var dynamicCells=me._getDynamicCells()

				
				
				var available=size.x-(staticWidthTotal+padding);

				var maxedOutItems=me._getDynamicCellsWithMax(available);

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
				var staticWidthTotalPerItem=Math.round(10*(maxedOutWidth+staticWidthTotal+padding)/dynamicCells.length)/10;


				me._style.innerHTML = 
					dynamicCells.map(function(cell){
						return '[data-col="' + cell.col + '"]{ width: calc( '+auto+'% - '+staticWidthTotalPerItem+'px ); }';
					}).join("\n")+"\n"+
					maxedOutItems.map(function(cell){
						return '[data-col="' + cell.col + '"]{ width:'+cell.maxWidth+'; }';
					}).join("\n")+"\n"+
					staticCells.map(function(cell){
						return '[data-col="' + cell.col + '"]{ width:'+cell.width+'; }';
					}).join("\n");





			}, 500);

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
				listEl.insertBefore(header, listEl.firstChild);
			} else {
				listEl.appendChild(header);
			}


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