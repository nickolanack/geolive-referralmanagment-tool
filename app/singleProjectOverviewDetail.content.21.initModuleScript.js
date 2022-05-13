
AppClient.authorize('write', {
				id: item.getId(),
				type: item.getType()
			}, function(access) {
				//check access, bool.
				if (access) {
				    module.draw();
				}else{
				    module.getElement().addClass('hidden')
				}
			});