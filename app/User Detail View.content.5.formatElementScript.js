    var application=GatherDashboard.getApplication();

			new UIPopover(el, {
				application: application,
				item: item,
				"--className": "priority-",
				detailViewOptions: {
					"viewType": "form",
					"namedFormView": "userOnlineStatusForm",
					"formOptions": {
						template: "form",
						closeable: true
					}
				},
				clickable: true,
				anchor: UIPopover.AnchorAuto()
			});
			
			
    el.addClass('with-status-'+item.getOnlineVisibility());