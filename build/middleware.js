'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var middleware = function middleware(store) {
	return function (next) {
		return function (action) {
			var ServiceClass = require('./ServiceClass');
			//serialize request to map action
			//Differ success call
			if (action instanceof ServiceClass) {
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