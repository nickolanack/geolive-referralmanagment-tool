var ItemShareLinks=(function(){

	var ItemShareLinks=new Class({
		getShareLinks: function() {
			if (this.data.links&&isArray_(this.data.links)){
				return this.data.links;
			}
			return [];
		}
	});

	return ItemShareLinks;
})();