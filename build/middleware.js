'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _ServiceClass = require('./ServiceClass');

var middleware = function middleware(store) {
	return function (next) {
		return function (action) {
			//serialize request to map action
			//Differ success call
			if (action instanceof _ServiceClass.ServiceClass) {
				var startAction = action.getStartAction();
				action.launchRequest(store.dispatch);
				return next(startAction);
			}
			return next(action);
		};
	};
};

exports['default'] = middleware;
module.exports = exports['default'];