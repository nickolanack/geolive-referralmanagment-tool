var ItemReadReceipts=(function(){

	var ItemReadReceipts=new Class({

		getUsersReceipts: function(callback) {

		},

		notifyRead: function() {


			(new AjaxControlQuery(CoreAjaxUrlRoot, 'notify_read_receipt', {
				item:this.getId(),
				type:this.getType(),
				namespace:'default',
				metadata:DashboardLoader.getAccessTokenObject(),
				plugin:'ReadReceipts'
			})).addEvent('success',function(resp){

				console.log(resp)


			}).execute();



		}

	});

	return ItemReadReceipts;


})();