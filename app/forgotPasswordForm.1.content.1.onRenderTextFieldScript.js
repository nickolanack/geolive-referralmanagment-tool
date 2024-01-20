inputElement.addEvent('keydown', function(k) {
			var key = k.key;
			if (key.toLowerCase() == "enter") {
				item.setSendMagicLink();
                wizard.complete();

				return false; //returning false stops the character from printing.
			}
})


