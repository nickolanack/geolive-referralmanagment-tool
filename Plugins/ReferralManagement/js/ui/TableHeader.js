var TableHeader=(function(){

	var TableHeader=new Class_({

		render:function(listModule){

			var me=this;

			listModule.runOnceOnLoad( /*addEvent('renderModule:once', */ function() {
				var index = 0;
				var module = listModule.getDetailViewAt(0);

				if (!module) {
					console.error('empty project list')
					return;
				}


				listModule.getSortObject(function(sort){
					sort.hide();
				})

				listModule.getFilterObject(function(filter){
					filter.hide();
				})


				module.runOnceOnLoad(function() {
					me._renderHeader(listModule);
					setTimeout(function() {
						listModule.addEvent('load', function() {
							me._renderHeader(listModule);
						})
					}, 500);

				});

				//}

				console.log('render project');
			});
		},

		_renderHeader: function(listModule, module) {





		var module=listModule.getDetailViewAt(0);

		module.getViewName(function(view) {

			if (view !== "singleProjectListItemTableDetail") {
				return;
			}

			var counter = 0;

			var interval = setInterval(function() {



				module=listModule.getDetailViewAt(0);
				counter++;

				if(!module){
					return;
				}


				var el = module.getElement();
				var header = new Element('div', {
					"class": "table-header",
					html: el.innerHTML
				});

				var parentNode = listModule.getElement();

				if (!(parentNode &&el.parentNode===parentNode&& header.firstChild && header.firstChild.firstChild)) {

					if (counter > 15) {
						console.error('unable to inject header');
						clearInterval(interval);
						interval=null;
					}

					return;
				}
				clearInterval(interval);
				interval=null;

				if (parentNode.firstChild) {
					parentNode.insertBefore(header, el);//parentNode.firstChild);
				} else {
					parentNode.appendChild(header);
				}

				header.firstChild.firstChild.childNodes.forEach(function(colEl) {

					colEl.addClass('sortable');

					var sort = colEl.getAttribute('data-col');
					if (!ProjectList.HasSortFn(sort)) {
						colEl.addClass('disabled');
						return;
					}

					colEl.addEvent('click', function() {

						var sort = colEl.getAttribute('data-col');
						var sortModule = listModule.getSortObject();

						if (!sortModule) {


							/**
							 * Not going to render this temporary module, but it should still work
							 */


							sortModule = (new ListSortModule(function() {
								return listModule;
							}, {
								sorters: ProjectList.projectSorters()
							}));

							listModule.setSortObject(sortModule);



							/**
							 *
							 */



						}

						sortModule.applySort(sort);



					});
				});


			}, 200);

			listModule.once('remove',function(){
				if(interval){
					clearInterval(interval);
					interval=null;
				}
			});

		});
	}



	});



	return TableHeader;






})()
