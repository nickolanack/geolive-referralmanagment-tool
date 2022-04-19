var NotificationItems=(function(){

	var NotificationItems=new Class_({
		Implements:[Events],
		initialize:function(){

			this._new=0;
			this._posts=0;

			var me=this;

			(new AjaxControlQuery(CoreAjaxUrlRoot, 'discussion_metadata', ObjectAppend_({
				'item': AppClient.getId(),
				'itemType': AppClient.getType(),
				'channel': 'notifications'
			}, {
				"plugin": "Discussions"
			}))).on('success', function(resp) {

				
				var change=me._new!=parseInt(resp.metadata.new)||me._posts!=parseInt(resp.metadata.posts);

				me._new=parseInt(resp.metadata.new);
				me._posts=parseInt(resp.metadata.posts);

				if(change){
					me.fireEvent('change',[me.getInfo()]);
				}



				if (resp.subscription) {
					AjaxControlQuery.Subscribe(resp.subscription, function(result) {
						me._new=me._new+1;
						me._new=me._posts+1;
						
						me.fireEvent('change',[me.getInfo()]);
						NotificationBubble.Make("", NotificationContent.formatEventText(result.text, result), {className:"info"});
					});
				}


			});


		},

		getInfo:function(){
			return {
				new:this._new,
				posts:this._posts
			};

		},
		clearNew:function(){
			var change=this._new>0;
			this._new=0;
			if(change){
				me.fireEvent('change',[me.getInfo()]);
			}
		},
		addIndicator:function(button, options){

				options=ObjectAppend_({
					clearsNotifications:false
				}, options);

				var indicator = button.getElement().appendChild(new Element('span', {
					"class": "notification-indicator"
				}));

				var update=function(info){

					indicator.setAttribute('data-count', info.posts);
					indicator.setAttribute('data-new', info.new);
					
					if(info.new>0){
						indicator.addClass('has-new');
					}else{
						indicator.removeClass('has-new');
					}

					if(info.posts==0){
						indicator.addClass('empty');
					}else{
						indicator.removeClass('empty');
					}


				}
				
				update(this.getInfo());
				this.on('update', update);

			
				var me=this;
				button.on('click', function(){
					me.clearNew();
				});




		}


	})

	return new NotificationItems();

})():