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
			
	
	
	var status=item.getOnlineVisibility();
    el.addClass('with-status-'+status);
    this.addWeakEvent(item, 'onlineStatusChanged', function(){
        el.removeClass('with-status-'+status);
        status=item.getOnlineVisibility();
        el.addClass('with-status-'+status)
    });