"use strict";

var G = namespace("HD.Game.Gomoku");
G.Adapter = namespace("HD.Game.Gomoku.Adapter");

/**
 * Alkalmazás csatolása űrlapokhoz
 * @type {Object}
 */
G.Adapter.Form = {

	/**
	 * Űrlap működtetése
	 * @param {HTMLFormElement} form űrlap wrapper
	 * @param {Object} canvas G.options.canvas objektum
	 */
	optionsHandle : function(form, canvas){
		var $form = $(form);
		var $x = $form.find('[name="gridSize_x"]');
		var $y = $form.find('[name="gridSize_y"]');
		var $n = $form.find('[name="connectNum"]');
		var $ais = $form.find('[name="playerAIs[]"]');
		var $names = $form.find('[name="playerNames[]"]');
		var $stones = $form.find('[name="playerStones"]');
		var $stoneImagesWrapper = $form.find(':data(stoneImages)');
		var $fp = $form.find('[name="firstPlayerID"]');
		var scale = HD.Math.floor(canvas.width / canvas.height, -1);

		// UI elemek beállításai
		$form.find('.spinner').spinner();
		$x.spinner("option", {min : 3, max : 30});
		$y.spinner("option", {min : 3, max : 20});
		$n.spinner("option", {min : 3});
		$stoneImagesWrapper.sortable();

		// Játékosok száma változik
		$form.find('[name="playerNum"]').change(function(){
			var num = $(this).val();
			$ais.prop("disabled", false).slice(num).prop("disabled", true);
			$fp.prop("disabled", false).slice(num).prop("disabled", true);
			if ($fp.filter(':checked:disabled').length > 0){
				$fp.eq(0).prop("checked", true);
			}
			$names.prop("disabled", false).slice(num).prop("disabled", true);
			$ais.each(function(index){
				if (index > 0 && index < num){
					$names.eq(index).prop("disabled", $(this).val() === "human");
				}
			});
		});

		// Játékos algoritmusa változik
		$ais.change(function(){
			$names.eq($ais.index(this)).prop("disabled", $(this).val() === "human");
		});

		// Játékos jelének beállítása
		$stoneImagesWrapper.on("sortstop", function(){
			var order = [];
			$form.find(':data(stoneImage)').each(function(){
				order.push($(this).data("stoneImage"));
			});
			$stones.val(order.join(","));
		});

		// Grid méretarányának biztosítása
		$x.on("spin", function(event, ui){
			var x = ui.value;
			var y = $y.spinner("value");
			var n = $n.spinner("value");
			var maxN;
			if (x / y > scale){
				y = Math.ceil(x / scale);
				$y.spinner("value", y);
			}
			maxN = Math.min(x, y);
			if (n > maxN){
				$n.spinner("value", maxN);
			}
		});
		$y.on("spin", function(event, ui){
			var x = $x.spinner("value");
			var y = ui.value;
			var n = $n.spinner("value");
			var maxN;
			if (x / y > scale){
				x = Math.floor(scale * y);
				$x.spinner("value", x);
			}
			maxN = Math.min(x, y);
			if (n > maxN){
				$n.spinner("value", maxN);
			}
		});

		// Kövek kirakhatóságának biztosítása
		$n.on("spin", function(event, ui){
			if (ui.value > Math.min($x.spinner("value"), $y.spinner("value"))){
				event.preventDefault();
			}
		});
	},

	/**
	 * Űrlap validálása
	 * @param {HTMLFormElement} form űrlap wrapper
	 * @returns {Array} hibaüzenetek
	 */
	optionsValidate : function(form){
		var errors = [];
		var names = G.Adapter.DOM.findAll(form, '[name="playerNames[]"]:not(:disabled)');
		names.every(function(elem){
			if (elem.value.trim().length === 0){
				errors.push(G.Lang.error.formFillNames);
				return false;
			}
		});
		return errors;
	},

	/**
	 * Űrlapon bevitt adatok átkonvertálása a G.options objektumnak megfelelő formára
	 * @param {Object} form űrlap-adatok
	 * @returns {Object} átkonvertált adatok
	 */
	optionsConvert : function(form){
		var data = {};
		var n;

		// gridSize
		data.gridSize = [parseInt(form.gridSize_y), parseInt(form.gridSize_x)];

		// connectNum
		data.connectNum = parseInt(form.connectNum);

		// playerNum
		data.playerNum = form.playerNum;

		// playerAIs
		data.playerAIs = [];
		for (n = 0; n < data.playerNum; n++){
			data.playerAIs.push(form.playerAIs[n]);
		};

		// playerStones
		form.playerStones = form.playerStones.split(",");
		data.playerStones = [];
		for (n = 0; n < data.playerNum; n++){
			data.playerStones.push(form.playerStones[n]);
		};

		// playerNames (szerver oldal után módosítani kell)
		data.playerNames = [];
		for (n = 0; n < data.playerNum; n++){
			if (typeof form.playerNames[n] !== "undefined"){
				data.playerNames.push(form.playerNames[n]);
			}
			else {
				data.playerNames.push("Csatlakozásra vár...");
			}
		};

		// firstPlayer
		data.firstPlayerID = parseInt(form.firstPlayerID);

		return data;
	}

};
