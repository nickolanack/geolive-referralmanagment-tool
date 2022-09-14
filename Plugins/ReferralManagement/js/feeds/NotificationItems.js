var NotificationItems=(function(){

	var NotificationItems=new Class_({
		Implements:[Events],
		initialize:function(){

			this._new=0;
			this._posts=0;
			this._postData=[];

			this._discussion;

			var me=this;

			if(AppClient.getUserType()=="guest"){
				return;
			}

			(new AjaxControlQuery(CoreAjaxUrlRoot, 'discussion_metadata', ObjectAppend_({
				'item': AppClient.getId(),
				'itemType': AppClient.getType(),
				'channel': 'notifications'
			}, {
				"plugin": "Discussions"
			}))).on('success', function(resp) {

				if(!resp.success){
					//guest dashboard
					return;
				}

				me._discussion=resp.metadata.id;

				(new AjaxControlQuery(CoreAjaxUrlRoot, 'get_posts', ObjectAppend_({
					'discussion':resp.metadata.id,
					'peek':true
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

		removeAllPosts:function(){

			
			if(this._postData.length>0){

				(new AjaxControlQuery(CoreAjaxUrlRoot, 'empty_posts', ObjectAppend_({
					"discussion":this._discussion,
					'channel': 'notifications'
				}, {
					"plugin": "Discussions"
				}))).execute();



				this._postData=[];
				this._posts=0;
				this.fireEvent('change',[this.getInfo()]);


				var controller = application.getNamedValue('navigationController');
				controller.navigateTo("Notifications", "Main");
			}
			
		},

		removePost:function(postId){

			

			var list=this._postData.filter(function(post){
				return post.id+""!==postId+"";
			});


			if(list.length<this._postData.length){
				this._postData=list;
				this._posts=list.length;
				this.fireEvent('change',[this.getInfo()]);
			}

		},

		hasItem:function(item){

			var id=item.getId();
			var type=item.getType();
			var types=[item.getType()];
			if(type=='user'){
				types.push('account');
			}


			return this._postData.slice(this._postData.length-this._new).filter(function(p){
				return p.metadata.items&&p.metadata.items.filter(function(i){
					return types.indexOf(i.type)>=0&&i.id+""===id+"";
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
				this.fireEvent('change',[this.getInfo()]);
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
				button.getElement().addEvent('click', function(){
					me.clearNew();
				});




		}


	});

	return new NotificationItems();

})();