'use strict';

var LayerGroupItem = (function() {


	var SaveLayerGroupItemQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(options) {
			this.parent(CoreAjaxUrlRoot, 'save_layer_item', Object.append({
				plugin: 'ReferralManagement'
			}, options));
		}
	});

	var LayerGroupItem = new Class({
		Extends: MockDataTypeItem,
		initialize: function(options) {
			this.parent(options);

			this.setName = function(n) {
				options.name = n
			}
			this.setDescription = function(d) {
				options.description = d
			}

		},
		save: function(callback) {

			var i = LayerGroupItemList.getLayerGroupItems().indexOf(this);
			if (i < 0) {
				LayerGroupItemList.addLayerGroupItem(this);
			}

			var args={
				name:this.getName(),
				description:this.getDescription()
			};

			if(this.getId()>0){
				args.id=this.getId();
			}

			var me=this;

			(new SaveLayerGroupItemQuery(args)).addEvent('success', function(response){

				if(response.success){					
					me._id=response.department.id;
					me.fireEvent('update');
					callback(true);
				}

			}).execute();

		}
	});

	return LayerGroupItem;

})();




var LayerGroupItemList = (function() {


	var _layerItems=false;
	var _layerNames=false;


	var LayerGroupItemListQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(options) {
			this.parent(CoreAjaxUrlRoot, 'list_layer_items', Object.append({
				plugin: 'ReferralManagement'
			}, options));
		}
	});



	(new LayerGroupItemListQuery()).addEvent('success', function(response) {
		_layerItems=[];
		_layerNames=[];

		if(!response.parameters){
			return;
		}

		_layerNames=Object.keys(response.parameters);
		Object.keys(response.parameters).map(function(group){



			response.parameters[group].forEach(function(layer){
				_layerItems.push(
					new LayerGroupItem(Object.append({
						name: "",
						description: "",
						type: "Project.layer",
						group:group,
					}, {
						id:layer
					}))
				);
			});
			
		});

	}).execute();


	return {

		getNewLayerGroupItem: function(group) {


			var newTag = new LayerGroupItem({
				name: "",
				description: "",
				type: "Project.layer",
				group:group,
				id: -1
			});

			return newTag;

		},
		getGroupNames:function(){

			return _layerNames.slice(0);

		},
		getGroups:function(){

			if(_layerItems===false){
				throw "departments not loaded yet";
			}


			var groupNames=[];
			var groups=[];
			_layerItems.forEach(function(item){
				var group=item.getGroup();
				if(groupNames.indexOf(group)==-1){
					groupNames.push(group);
					groups.push(new MockDataTypeItem({
						name:group,
						type:"Project.layerGroup"
					}));
				}
			});

			return groups;
		},

		addLayerGroupItem:function(department){
			_layerItems.push(department);
		},

		getLayerGroupItems: function(group) {

			if(_layerItems===false){
				throw "departments not loaded yet";
			}


			var items= _layerItems.slice(0);


			if(group){
				items=items.filter(function(item){
					return item.getGroup()==group;
				});
			}

			return items;
		}


	};



})();