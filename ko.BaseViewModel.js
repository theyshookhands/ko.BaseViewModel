﻿
(function ($, ko, undefined) {

	ko.BaseViewModel = function () {
		var self = this;

		// current domain
		self.domain = "http://" + window.location.host;

		// list of items
		self.items = ko.observableArray([]);

		// object to observe form for creating new item
		self.newItem = {};

		// list of dirty (changed) items
		self.dirtyItems = ko.computed(function () {
			return self.items().filter(function (item) {
				return item.dirtyFlag.isDirty();
			});
		});

		// items have been changed (need to be saved)
		self.isDirty = ko.computed(function () {
			return self.dirtyItems().length > 0;
		});

		// messages to display on page
		self.messages = ko.observableArray([]);

		// needs to be overridden, used to check validity of new item form
		// and call self.save if valid
		self.addItem = function () { };

		// saves item to server
		self.save = function (item, url, success) {
			$.ajax({
				type: "post",
				data: item,
				url: self.domain + url,
				success: success,
				error: self.error
			});
		}

		// needs to be overridden, calls _saveChanges
		self.saveChanges = function () { };

		// saves changes to list of items to server
		self._saveChanges = function (data, url, callback) {
			$.ajax({
				type: "post",
				url: self.domain + url,
				data: JSON.stringify(data),
				contentType: "application/json, charset=utf-8",
				traditional: true,
				datatype: "json",
				success: function (result) {
					resetDirtyItems();
					self.messages([result.message]);
					if (typeof callback === "function") {
						callback();
					}
				},
				error: self.error
			});
		}

		// resets dirty items
		function resetDirtyItems() {
			self.dirtyItems().map(function (item) {
				item.dirtyFlag.reset();
			});
		}

		// needs to be overridden, used to remove item from list, call deleteItem
		self.removeItem = function () { };

		// shows a pop-up dialog to confirm deletion of item
		self.confirmDeletion = function (callback) {
			$("#dialog").dialog({
				resizable: false,
				modal: true,
				buttons: {
					"Delete": callback,
					Cancel: function () {
						$(this).dialog("close");
					}
				}
			});
		}

		// deletes item on server
		self.deleteItem = function (item, url, success) {
			$.ajax({
				type: "delete",
				url: self.domain + url,
				data: { id: item.id },
				success: success,
				error: self.error
			});
		}

		// needs to be overridden, initial load of items from server
		self.load = function () { };

		// generic error function to use in ajax calls
		self.error = function (XHR, text, err) {
			self.messages([text + ": " + err]);
		};
	};

}(jQuery, ko));