inputElement.addEvent('keydown', function(k) {
			var key = k.key;
			if (key == "enter") {
				wizard.save();

				return false; //returning false stops the character from printing.
			}
})