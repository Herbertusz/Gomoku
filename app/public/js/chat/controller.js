"use strict";

var CHAT = window.CHAT || {};

$(document).ready(function(){

	// Csatorna létrehozása
	$(CHAT.DOM.start).click(function(){
		CHAT.Events.Client.createRoom();
		$(CHAT.DOM.userSelect).prop("checked", false).trigger("change");
	});

	// Kilépés csatornából
	$(CHAT.DOM.box).find(CHAT.DOM.close).click(function(){
		CHAT.Events.Client.leaveRoom($(this).parents(CHAT.DOM.box));
	});

	// User hozzáadása csatornához
	$(CHAT.DOM.userSelect).change(function(){
		if ($(CHAT.DOM.selectedUsers).length > 0){
			$(CHAT.DOM.box).find(CHAT.DOM.addUser).show();
		}
		else{
			$(CHAT.DOM.box).find(CHAT.DOM.addUser).hide();
		}
	});
	$(CHAT.DOM.box).find(CHAT.DOM.addUser).click(function(){
		var $add = $(this);
		$(CHAT.DOM.selectedUsers).each(function(){
			CHAT.Events.Client.forceJoinRoom($add, Number($(this).val()));
		});
		$(CHAT.DOM.userSelect).prop("checked", false).trigger("change");
	});

	// User kidobása csatornából
	$(CHAT.DOM.box).find(CHAT.DOM.userThrow).click(function(){
		CHAT.Events.Client.forceLeaveRoom($(this));
	});

	// Tétlen állapot
	$(CHAT.DOM.idleCheck).idleTimer(CHAT.timer.idle);
	$(CHAT.DOM.idleCheck).on("idle.idleTimer", function(){
		var connectedUsers = CHAT.Method.changeCurrentStatus("idle");
		CHAT.Method.updateStatuses(connectedUsers);
		CHAT.socket.emit('statusChanged', connectedUsers);
	});
	$(CHAT.DOM.idleCheck).on("active.idleTimer", function(){
		var connectedUsers = CHAT.Method.changeCurrentStatus("notidle");
		CHAT.Method.updateStatuses(connectedUsers);
		CHAT.socket.emit('statusChanged', connectedUsers);
	});

	// Státusz megváltoztatása
	$(CHAT.DOM.online).find(CHAT.DOM.statusChange).change(function(){
		var connectedUsers = CHAT.Method.changeCurrentStatus($(this).val());
		CHAT.Method.updateStatuses(connectedUsers);
		CHAT.socket.emit('statusChanged', connectedUsers);
	});

	// Üzenetküldés indítása ENTER leütésére
	$(CHAT.DOM.box).find(CHAT.DOM.message).keydown(function(event){
		var $box = $(this).parents('.chat');
		if (event.which === HD.Misc.keys.ENTER){
			if (!event.shiftKey && $box.find(CHAT.DOM.sendSwitch).prop("checked")){
				CHAT.Events.Client.sendMessage($box);
				event.preventDefault();
			}
		}
	});

	// Üzenetküldés indítása gombnyomásra
	$(CHAT.DOM.box).find(CHAT.DOM.sendButton).click(function(){
		var $box = $(this).parents('.chat');
		CHAT.Events.Client.sendMessage($box);
	});

	// Fájlküldés
	$(CHAT.DOM.box).find(CHAT.DOM.file).change(function(){
		var $box = $(this).parents('.chat');
		var files = $box.find(CHAT.DOM.file).get(0).files;
		CHAT.Events.Client.sendFile($box, files);
	});
	$(CHAT.DOM.box).on('click', 'a.notredirect', function(event){
		//event.preventDefault();
	});
	$('body').on('dragover', function(event){
		event.stopPropagation();
		event.preventDefault();

		var $dropArea = $(CHAT.DOM.box).find(CHAT.DOM.dropFile);

		$dropArea.addClass("active");
		if (CHAT.timer.drag.timerID) {
			window.clearTimeout(CHAT.timer.drag.timerID);
		}
		CHAT.timer.drag.timerID = window.setTimeout(function(){
			$dropArea.removeClass("active");
		}, CHAT.timer.drag.interval);
	});
	$(CHAT.DOM.box).find(CHAT.DOM.dropFile).on('dragover', function(event){
		event.stopPropagation();
		event.preventDefault();

		var $dropArea = $(this);
		$dropArea.addClass("drop-active");
		if (CHAT.timer.drop.timerID) {
			window.clearTimeout(CHAT.timer.drop.timerID);
		}
		CHAT.timer.drop.timerID = window.setTimeout(function(){
			$dropArea.removeClass("drop-active");
		}, CHAT.timer.drop.interval);
	});
	$(CHAT.DOM.box).find(CHAT.DOM.dropFile).on('drop', function(event){
		event.stopPropagation();
		event.preventDefault();

		var $box = $(this).parents('.chat');
		var files = event.originalEvent.dataTransfer.files;
		$(this).removeClass("active").removeClass("drop-active");
		CHAT.Events.Client.sendFile($box, files);
	});


	// Üzenet gépelése
	$(CHAT.DOM.box).find(CHAT.DOM.message).keyup(function(event){
		var $box = $(this).parents('.chat');
		if (event.which !== HD.Misc.keys.ENTER){
			CHAT.Events.Client.typeMessage($box);
		}
	});

	// Üzenetküldés módja
	$(CHAT.DOM.box).find(CHAT.DOM.sendSwitch).change(function(){
		CHAT.Events.Client.sendMethod($(this));
	});


	// Szerver által küldött események lekezelése
	for (var func in CHAT.Events.Server){
		CHAT.socket.on(func, CHAT.Events.Server[func]);
	}

});
