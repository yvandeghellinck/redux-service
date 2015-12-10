'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _require = require('./constants');

var STACK_SERVICES = _require.STACK_SERVICES;
var stackServices = [];

exports.stackServices = stackServices;
var middleware = function middleware(store) {
	return function (next) {
		return function (action) {

			var ServiceClass = require('./ServiceClass');
			//serialize request to map action
			//Differ success call
			if (action instanceof ServiceClass) {

				if (action.type === STACK_SERVICES) {
					stackServices.push(action);
					return;
				}

				var startAction = action.getStartAction();
				action.launchRequest(store.dispatch);
				return next(startAction);
			}

			return next(action);
		};
	};
};

exports['default'] = middleware;