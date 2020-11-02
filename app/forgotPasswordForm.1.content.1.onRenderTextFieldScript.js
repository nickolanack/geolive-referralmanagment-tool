inputElement.addEvent('keydown', function(k) {
			var key = k.key;
			if (key == "enter") {
				item.setSendMagicLink();
                wizard.complete();

				return false; //returning false stops the character from printing.
			}
})