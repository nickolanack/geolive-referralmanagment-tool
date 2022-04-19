var NotificationItems=(function(){

	var NotificationItems=new Class_({
		Implements:[Events],
		initialize:function(){

			this._new=0;
			this._posts=0;
			this._postData=[];

			var me=this;

			(new AjaxControlQuery(CoreAjaxUrlRoot, 'discussion_metadata', ObjectAppend_({
				'item': AppClient.getId(),
				'itemType': AppClient.getType(),
				'channel': 'notifications'
			}, {
				"plugin": "Discussions"
			}))).on('success', function(resp) {


				(new AjaxControlQuery(CoreAjaxUrlRoot, 'get_posts', ObjectAppend_({
					'discussion':resp.metadata.id
				}, {
					"plugin": "Discussions"
				}))).on('success', function(resp) {
					me._postData=resp.posts;
					me.fireEvent('change',[me.getInfo()]);
				}).execute();


				
				var change=me._new!=parseInt(resp.metadata.new)||me._posts!=parseInt(resp.metadata.posts);

				me._new=parseInt(resp.metadata.new);
				me._posts=parseInt(resp.metadata.posts);

				if(change){
					me.fireEvent('change',[me.getInfo()]);
				}



				if (resp.subscription) {
					AjaxControlQuery.Subscribe(resp.subscription, function(result) {
						me._new=me._new+1;
						me._posts=me._posts+1;
						me._postData.push(result);
						
						me.fireEvent('change',[me.getInfo()]);
						NotificationBubble.Make("", NotificationContent.formatEventText(result.text, result), {className:"info"});
					});
				}


			}).execute();


		},

		hasItem:function(item){

			var id=item.getId();
			var type=item.getType();

			return this._postData.filter(function(p){
				return p.metadata.items&&p.metadata.items.filter(function(i){
					return i.type==type&&i.id+""===id+"";
				}).length>0
			}).length>0;
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
				this.on('change', update);

			
				var me=this;
				button.getElement().on('click', function(){
					me.clearNew();
				});




		}


	});

	return new NotificationItems();

})();