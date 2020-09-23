var ProjectSearch = (function() {



	var ProjectSearch = new Class({


		_getApplication:function(){

			return ReferralManagementDashboard.getApplication();

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
									search.setValue('');

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

			return [new ProjectSearchAggregator(search, {})];

		}


	});

	return new ProjectSearch();


})();