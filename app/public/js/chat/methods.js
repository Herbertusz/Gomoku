"use strict";

var CHAT = window.CHAT || {};

/**
 * Alkalmazásspecifikus függvények
 * @type Object
 */
CHAT.Method = {

	/**
	 * Felhasználói üzenet beszúrása
	 * @param {jQuery} $box
	 * @param {Object} data
	 * @param {Boolean} [highlighted=false]
	 */
	appendUserMessage : function($box, data, highlighted){
		highlighted = HD.Misc.funcParam(highlighted, false);
		var time = HD.DateTime.format('H:i:s', data.time);
		var $list = $box.find(CHAT.DOM.list);
		$list.append('\
			<li>\
				<span>' + time + '</span>\
				<strong class="' + (highlighted ? "self" : "") + '">' + CHAT.Util.escapeHtml(data.name) + '</strong>:\
				<br />\
				' + CHAT.Util.escapeHtml(data.message) + '\
			</li>\
		');
		CHAT.Util.scrollToBottom($box);
	},

	/**
	 * Rendszerüzenet beszúrása
	 * @param {jQuery} $box
	 * @param {String} type
	 * @param {String} name
	 * @param {String} otherName
	 */
	appendSystemMessage : function($box, type, name, otherName){
		var $list = $box.find(CHAT.DOM.list);
		if (type === 'join'){
			$list.append('<li class="highlighted">' + name + ' csatlakozott!</li>');
		}
		else if (type === 'leave'){
			$list.append('<li class="highlighted">' + name + ' kilépett!</li>');
		}
		else if (type === 'forcejoinyou'){
			$list.append('<li class="highlighted">' + name + ' hozzáadott ehhez a csatornához!</li>');
		}
		else if (type === 'forcejoinother'){
			$list.append('<li class="highlighted">' + name + ' hozzáadta ' + otherName + ' felhasználót ehhez a csatornához!</li>');
		}
		else if (type === 'forceleaveyou'){
			$list.append('<li class="highlighted">' + name + ' kidobott!</li>');
		}
		else if (type === 'forceleaveother'){
			$list.append('<li class="highlighted">' + name + ' kidobta ' + otherName + ' felhasználót!</li>');
		}
		CHAT.Util.scrollToBottom($box);
	},

	/**
	 * Gépelés megállásának lekezelése
	 * @param {jQuery} $box
	 * @param {String} name
	 * @param {String} message
	 */
	stopWrite : function($box, name, message){
		if (message.trim().length > 0){
			$box.find(CHAT.DOM.indicator).html(name + ' szöveget írt be');
		}
		else{
			$box.find(CHAT.DOM.indicator).html('');
		}
	},

	/**
	 * Felhasználónév id alapján
	 * @param {Number} id
	 * @returns {String}
	 */
	getUserName : function(id){
		var $element = $(CHAT.DOM.onlineListItems).filter('[data-id="' + id + '"]');
		return $element.data("name");
	},

	/**
	 * Doboz tetején lévő felhasználólista létrehozása
	 * @param {jQuery} $to
	 * @param {Array} userIds
	 * @param {Boolean} [regenerate=false]
	 */
	generateUserList : function($to, userIds, regenerate){
		regenerate = HD.Misc.funcParam(regenerate, false);
		var $user, $keep;
		if (regenerate){
			$to.children(':not(.cloneable)').remove();
		}
		$(CHAT.DOM.onlineListItems).each(function(){
			var $user;
			var $this = $(this);
			var currentUserId = $this.data("id");
			if (userIds.indexOf(currentUserId) > -1){
				$user = CHAT.Util.cloneElement($to.find('.cloneable'), $to, currentUserId === CHAT.USER.id);
				$user.attr("data-id", currentUserId);
				$user.find('.status').addClass(CHAT.Method.getStatus($this)).addClass("run");
				$user.find('.name').html(CHAT.Method.getUserName(currentUserId));
			}
		});
	},

	/**
	 * Státuszjelző DOM-elem módosítása
	 * @param {jQuery} $elem
	 * @param {String} status
	 */
	setStatus : function($elem, status){
		var n;
		var $statusElem = $elem.find('.status');
		var statuses = ["on", "busy", "inv", "off"];
		if (status === "idle"){
			$statusElem.addClass("idle");
		}
		else{
			$statusElem.removeClass("idle");
			for (n = 0; n < statuses.length; n++){
				$statusElem.removeClass(statuses[n]);
			}
			$statusElem.addClass(status);
		}
	},

	/**
	 * Státuszjelző DOM-elem lekérdezése
	 * @param {jQuery} $elem
	 * @returns {String}
	 */
	getStatus : function($elem){
		var n, status;
		var $statusElem = $elem.find('.status');
		var statuses = ["on", "busy", "idle", "inv", "off"];
		for (n = 0; n < statuses.length; n++){
			if ($statusElem.hasClass(statuses[n])){
				status = statuses[n];
				break;
			}
		}
		return status;
	},

	/**
	 * Státuszok frissítése
	 * @param {Object} connectedUsers
	 */
	updateStatuses : function(connectedUsers){
		var socketId, isIdle;
		var onlineUserStatuses = {};
		for (socketId in connectedUsers){
			isIdle = connectedUsers[socketId].isIdle;
			onlineUserStatuses[connectedUsers[socketId].id] = isIdle ? "idle" : connectedUsers[socketId].status;
		}
		$(CHAT.DOM.onlineListItems).each(function(){
			var $this = $(this);
			var currentId = $this.data("id");
			if (typeof onlineUserStatuses[currentId] !== "undefined"){
				CHAT.Method.setStatus($this, onlineUserStatuses[currentId]);
			}
			else{
				CHAT.Method.setStatus($this, "off");
			}
		});
		$(CHAT.DOM.box).each(function(){
			$(this).find(CHAT.DOM.userItems).each(function(){
				var onlineStatus = onlineUserStatuses[$(this).attr("data-id")];
				CHAT.Method.setStatus($(this), onlineStatus || "off");
			});
		});
	},

	/**
	 * Felhasználó státuszának megváltoztatása
	 * @param {String} newStatus
	 * @returns {Object}
	 */
	changeCurrentStatus : function(newStatus){
		var thisSocket = null, socketId;
		var connectedUsers = $(CHAT.DOM.online).data("connectedUsers");
		for (socketId in connectedUsers){
			if (connectedUsers[socketId].id === CHAT.USER.id){
				thisSocket = socketId;
				break;
			}
		}
		if (thisSocket){
			if (newStatus === "idle"){
				connectedUsers[thisSocket].isIdle = true;
			}
			else if (newStatus === "notidle"){
				connectedUsers[thisSocket].isIdle = false;
			}
			else{
				connectedUsers[thisSocket].isIdle = false;
				connectedUsers[thisSocket].status = newStatus;
			}
		}
		$(CHAT.DOM.online).data("connectedUsers", connectedUsers);
		return connectedUsers;
	},

	/**
	 * Doboz kitöltése DB-ből származó adatokkal
	 * @param {jQuery} $box
	 * @param {String} roomName
	 * @param {Function} [callback]
	 */
	fillBox : function($box, roomName, callback){
		callback = HD.Misc.funcParam(callback, function(){});
		$.ajax({
			type : "POST",
			url : "/chat/getroommessages",
			data : {
				roomName : roomName
			},
			dataType : "json",
			success : function(resp){
				resp.messages.forEach(function(msgData){
					var timestamp = (new Date(msgData.created.replace(/ /g, 'T'))).getTime() / 1000;
					CHAT.Method.appendUserMessage($box, {
						name : msgData.username,
						time : timestamp,
						message : msgData.message
					});
				});
				callback();
			}
		});
	}

};
