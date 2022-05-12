AppClient.authorize('write', {
				id: item.getId(),
				type: item.getType()
			}, function(access) {
				//check access, bool.
				if (access) {
					callback(list)
				} else {
				    list.content=[];
					callback(list)
				}
			});
