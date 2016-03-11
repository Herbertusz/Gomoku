/*!
 * Gomoku v1.0.0 alpha
 * Copyright (c) 2016.02.28.
 */

"use strict";

var G = namespace("HD.Game.Gomoku");

G.APP = new HD.Web();
G.APP.init();
// Program indítása document.ready-re
G.APP.pushReady(function(){

	var form = G.Adapter.DOM.get('#form-options');
	var overlay = G.Adapter.DOM.get('#game-overlay');
	var start = G.Adapter.DOM.get('#start');
	G.Adapter.Form.optionsHandle(form, G.options.canvas);
	overlay.style.display = 'block';

	G.Adapter.DOM.event(start, 'click', function(){
		var errors = G.Adapter.Form.optionsValidate(form);
		if (errors.length === 0){
			G.start(HD.Site.formCollect($(G.Adapter.DOM.findAll(form, 'input,select,textarea')))); // TODO: FormData API
			overlay.parentNode.removeChild(overlay);
		}
		else {
			G.Adapter.DOM.find(form, '.error').innerHTML = errors.join('<br />');
		}
	});

});
