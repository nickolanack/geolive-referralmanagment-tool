var ItemDiscussion=(function(){

	var ItemDiscussion=new Class({

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
			return {
				"channel": "discussion." + me.data.discussion.id,
				"event": "post"
			}
		},

	});





	ItemDiscussion.AddItemDiscussionIndicator =function(el, item, application) {

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