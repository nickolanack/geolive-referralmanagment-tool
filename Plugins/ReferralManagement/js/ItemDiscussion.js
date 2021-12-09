var ItemDiscussion = (function() {

	var ItemDiscussion = new Class({

		hasPosts: function() {
			var me = this;
			return me.numberOfPosts() > 0;
		},
		numberOfPosts: function() {
			var me = this;
			if (!(me.data && me.data.discussion)) {
				return 0;
			}
			return parseInt(me.data.discussion.posts);
		},
		numberOfNewPosts: function() {
			var me = this;
			if (!(me.data && me.data.discussion)) {
				return 0;
			}
			return parseInt(me.data.discussion.new);
		},

		getDiscussionSubscription: function() {
			var me = this;

			if (me.getId() == -1) {
				return false;
			}

			return {
				"channel": "discussion." + me.data.discussion.id,
				"event": "post"
			}
		},

	});


	ItemDiscussion.AddTextFieldFormat=function(module, application) {

		module.runOnceOnLoad(function() {


			var getDiscussion = function() {

				var discussion = module.getViewer()
					.getUIView()
					.getViewer()
					.findChildViews(function(c) {
						return c instanceof DiscussionModule
					})
					.pop();
				return discussion;
			}

			var uitext = module.getTextField();
			uitext.setValue('');
			uitext.getInputElement().addClass('discussion-textbox');



			(new UITextFieldMediaSelection(uitext)).addToolbarBtn({
				"class": "send-btn",
				events: {
					click: function() {

						var value = uitext.getValue();
						value = value.trim();
						uitext.setValue('');
						if (value && value !== "") {

							//console.log("send "+value);
							var discussion = getDiscussion();
							discussion.getDiscussion().post(value, function(success) {
								//console.log('success: '+(success?'true':'false'));  
								if (!success) {
									alert('Something went wrong');
								}
							});
						}

					},
				}
			});

			



			uitext.addEvent('onEnterKey', function(e) {
				if (!e.shiftKey) {
					var value = uitext.getValue();
					value = value.trim();
					uitext.setValue('');
					if (value && value !== "") {

						//console.log("send "+value);
						var discussion = getDiscussion();
						discussion.getDiscussion().post(value, function(success) {
							//console.log('success: '+(success?'true':'false'));  
							if (!success) {
								alert('Something went wrong');
							}
						});
					}
				}
			});

			uitext.addEvent('addMediaItem', function(fileInfo) {


				(new UITextFieldMediaSelection(uitext)).clear();

				var value = fileInfo.html;
				value = value.trim();
				if (value && value !== "") {

					application.getDisplayController().displayPopoverForm(
						'discussionMediaPostForm',
						(new MockDataTypeItem({
							name: fileInfo.name,
							fileInfo:fileInfo
						})).addEvent('save', function() {

							var discussion = getDiscussion();
							discussion.getDiscussion().post(value, function(success) {
								//console.log('success: '+(success?'true':'false'));  
								if (!success) {
									alert('Something went wrong');
								}
							});

						}), {
							template: "form"
						}
					);


				}


			});


			uitext.addAutocompleteDropdown(function(text){

				if(text&&text.length>1&&text[0]=='@'){
					return ProjectTeam.CurrentTeam().getUsers().filter(function(u){ 
						return u.getName().toLowerCase().indexOf(text.substring(1).toLowerCase())===0||u.getEmail().toLowerCase().indexOf(text.substring(1).toLowerCase())===0; 
					}).map(function(u){
						return '@'+u.getEmail()+' - '+u.getName();
					});
				}


			}, {
				minChars:2,
				direction:'up',
				insert:'top',
				textInsert:'inject'
			}).addAutocompleteDropdown(function(text){

				if(text&&text.length>1&&text[0]=='#'){
					return ProjectTeam.CurrentTeam().getProjects().filter(function(p){ 
						return p.getName().toLowerCase().indexOf(text.substring(1).toLowerCase())===0; 
					}).map(function(p){
						return '#'+p.getName();
					});
				}


			}, {
				minChars:2,
				direction:'up',
				insert:'top',
				textInsert:'inject'
			})

		});


	}


	ItemDiscussion.AddItemDiscussionIndicator = function(el, item, application) {

		var newPosts = 0;
		var totalPosts = 0;

		var postCounter = null;

		var addEl = function() {
			postCounter = el.appendChild(new Element('span'));
			postCounter.addClass('posts items');
			el.addClass('withPosts withItemsIndicator');

			if (item instanceof TaskItem) {
				postCounter.addEvent('click', function() {
					application.getDisplayController().displayPopoverForm(
						"taskDetailPopover",
						item,
						application, {}
					);
				})
			}
		}

		var updateCounter = function() {

			if (!postCounter) {
				addEl();
			}

			postCounter.setAttribute('data-posts', totalPosts);
			postCounter.setAttribute('data-items', totalPosts);

			if (totalPosts > 0) {
				el.addClass("hasItems");
			}

			if (newPosts > 0) {
				el.addClass('newPosts');
				el.addClass('new-items');
				postCounter.setAttribute('data-posts', newPosts + '/' + item.numberOfPosts());
			} else {
				el.removeClass('newPosts');
				el.removeClass('new-items');
			}
		};

		if (item.hasPosts()) {
			newPosts = item.numberOfNewPosts();
			totalPosts = item.numberOfPosts();
			updateCounter();
		}


		//AjaxControlQuery.WeakSubscribe(el, ...)
		var subscription = item.getDiscussionSubscription();
		if (!subscription) {
			return;
		}
		AjaxControlQuery.WeakSubscribe(el, subscription, function() {
			newPosts++;
			totalPosts++;
			updateCounter();
		});

	};

	return ItemDiscussion;


})();