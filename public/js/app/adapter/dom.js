"use strict";

var G = namespace("HD.Game.Gomoku");
G.Adapter = namespace("HD.Game.Gomoku.Adapter");

/**
 * Alkalmazás csatolása DOM elemeket kezelő függvényekhez
 * @returns {Object} G.Adapter.DOM felület
 */
G.Adapter.DOM = {

	/**
	 *
	 * @param {String} selector
	 * @returns {Array.<HTMLElement>}
	 */
	getAll : function(selector){
		return $(selector).toArray();
	},

	/**
	 *
	 * @param {String} selector
	 * @returns {HTMLElement}
	 */
	get : function(selector){
		return $(selector).get(0);
	},

	/**
	 *
	 * @param {String} name
	 * @param {Mixed} [value]
	 * @returns {Array.<HTMLElement>}
	 */
	getByDataAll : function(name, value){
		return $('*').filter(function(){
			if (typeof value === "undefined"){
				return ($(this).data(name) !== undefined) ? true : false;
			}
			else {
				return ($(this).data(name) === value) ? true : false;
			}
		}).toArray();
	},

	/**
	 *
	 * @param {String} name
	 * @param {Mixed} [value]
	 * @returns {HTMLElement}
	 */
	getByData : function(name, value){
		return this.getByDataAll(name, value)[0];
	},

	/**
	 *
	 * @param {HTMLElement} element
	 * @param {String} selector
	 * @returns {Array.<HTMLElement>}
	 */
	findAll : function(element, selector){
		return $(element).find(selector).toArray();
	},

	/**
	 *
	 * @param {HTMLElement} element
	 * @param {String} selector
	 * @returns {HTMLElement}
	 */
	find : function(element, selector){
		return $(element).find(selector).get(0);
	},

	/**
	 *
	 * @param {HTMLElement} element
	 * @param {Function} func
	 * @returns {Array.<HTMLElement>}
	 */
	filterAll : function(element, func){
		return $(element).filter(func).toArray();
	},

	/**
	 *
	 * @param {HTMLElement} element
	 * @param {Function} func
	 * @returns {HTMLElement}
	 */
	filter : function(element, func){
		return $(element).filter(func).get(0);
	},

	/**
	 *
	 * @param {HTMLElement} element
	 * @param {String} name
	 * @returns {Mixed}
	 */
	getData : function(element, name){
		return $(element).data(name);
	},

	/**
	 *
	 * @param {HTMLElement} element
	 * @returns {HTMLElement}
	 */
	clone : function(element){
		return $(element).clone().get(0);
	},

	/**
	 *
	 * @param {HTMLElement} element
	 * @param {String} eventName
	 * @param {Function} handler
	 */
	event : function(element, eventName, handler){
		$(element).on(eventName, handler);
	}

};
