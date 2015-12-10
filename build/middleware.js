'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ServiceClass = require('./ServiceClass');

var queuingServiceMiddleware = function queuingServiceMiddleware() {
	var stack = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	return function (store) {
		return function (next) {
			return function (action) {

				if (action instanceof ServiceClass) {
					stack.push(action);
					return;
					// var startAction = action.getStartAction();
					// action.launchRequest(store.dispatch);
					// return next(startAction);
				}

				return next(action);
			};
		};
	};
};

exports.queuingServiceMiddleware = queuingServiceMiddleware;
var middleware = function middleware(store) {
	return function (next) {
		return function (action) {
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

exports.middleware = middleware;

var ServiceMiddlewareManager = (function () {
	function ServiceMiddlewareManager() {
		var stackMode = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

		_classCallCheck(this, ServiceMiddlewareManager);

		this._stack = [];
		this.setStackMode(stackMode);
		this.configureMiddlewares();
	}

	_createClass(ServiceMiddlewareManager, [{
		key: 'configureMiddlewares',
		value: function configureMiddlewares() {
			this._queuingServiceMiddleware = queuingServiceMiddleware(this.getStack());
			this._middleware = middleware;
		}
	}, {
		key: 'setStackMode',
		value: function setStackMode(stackMode) {
			if (stackMode) {
				this._stack = [];
				this._queuingServiceMiddleware = queuingServiceMiddleware(this.getStack());
			}
			this._stackMode = stackMode;
		}
	}, {
		key: 'getStack',
		value: function getStack() {
			return this._stack;
		}
	}, {
		key: 'middleware',
		value: function middleware() {
			var _this = this;

			return function (store) {
				return function (next) {
					return (function (action) {
						// if(this._silentMode) {
						// 	return next(action);
						// }
						if (_this._stackMode) {
							return _this._queuingServiceMiddleware(store)(next)(action);
						} else {
							return _this._middleware(store)(next)(action);
						}
					}).bind(_this);
				};
			};
		}
	}, {
		key: 'executeStackServices',
		value: function executeStackServices(store, requestLauncher) {
			var _this2 = this;

			var manager = this;
			return new Promise((function (resolve, reject) {
				var services = _this2.getStack();

				var promises = services.map((function (service, index) {
					store.dispatch(service.getStartAction());

					var promise = null;
					if (!requestLauncher) {
						promise = service.launchRequest(store.dispatch);
					} else {
						promise = requestLauncher.apply(service, [service.url, service.generateAjaxOption(store.dispatch)]);
					}
					promise.then((function () {
						promises[index] = 'accepted';
						var count = 0;
						promises.forEach(function (currentPromise) {
							if (currentPromise === 'accepted') {
								count = count + 1;
							}
						});
						if (count === promises.length) {
							resolve();
						}
					}).bind(manager))['catch'](reject);
					return 'start_request';
				}).bind(manager));
			}).bind(manager));
		}
	}]);

	return ServiceMiddlewareManager;
})();

exports.ServiceMiddlewareManager = ServiceMiddlewareManager;