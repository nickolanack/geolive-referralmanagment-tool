var ProjectSearch = (function() {



	var ProjectSearch = new Class({


		_getApplication:function(){

			return ReferralManagementDashboard.getApplication();

		},

		formatSearchModule:function(searchModule){

			searchModule.addEvent('focus',function(){
			    setTimeout(function(){  
			    searchModule.results.setStyle('width', "370px");
			    },100);
			    
			});

			searchModule.addEvent('blur',function(){
			        
			    setTimeout(function(){
			    var p =  searchModule.search.searchInput.getCoordinates( searchModule.search.container);
			     searchModule.results.setStyle('width', (p.width) + "px");
			    },100);

			    
			});

		},

		getAggregators: function(search) {

			var aggregator = this;

			var ProjectSearchAggregator = new Class({
				Extends: UISearchListAggregator,
				initialize: function(search, options) {
					var me=this;
					
					this.parent(search, Object.append({

						PreviousTemplate: UIListAggregator.PreviousTemplate,
						MoreTemplate: UIListAggregator.MoreTemplate,
						ResultTemplate: UIListAggregator.NamedViewTemplate(aggregator._getApplication(), {
							namedView: "projectSearchResult",
							formatResult: function(result) {
								return ProjectTeam.CurrentTeam().getProject(result.item);
							},
							events: {
								click: function(result) {

									UIInteraction.navigateToProjectOverview(ProjectTeam.CurrentTeam().getProject(result.item));
									me.clear();

								}
							}
						}),
						resultFilters:[function(result){
							return ProjectTeam.CurrentTeam().hasProject(result.item);
						}]
					}, options));
				},
				getLastResponse: function() {
					return this._results;
				},
				clear:function(){
					this.getSearchControl().clear();
				},
				getCurrentResults:function(callback){
					callback(this._results);
				},
				_getRequest: function(filters) {
					var me = this;
					var string = me.currentSearchString;


					return (new AjaxControlQuery(CoreAjaxUrlRoot, 'project_search', {
						'plugin': 'ReferralManagement',
						'search': {
							name: string
						},
						searchOptions: filters
					})).addEvent('success', function(results) {

						me._results = results;

					});
				}
			});


			var projectSearchAggregator=new ProjectSearchAggregator(search, {});
			search.addEvent('search', function(){
				projectSearchAggregator.getLastResponse(function(results){
					projectSearchAggregator.clear();
					UIInteraction.navigateToProjectSearchResults(results);
				});
			});


			return [projectSearchAggregator];

		}


	});

	return new ProjectSearch();


})();