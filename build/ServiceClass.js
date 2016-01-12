'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _require = require('./constants');

var API_CALL = _require.API_CALL;
var METHODS = _require.METHODS;
var METHODS_MAPPER = _require.METHODS_MAPPER;
var SERVICE_STATE = _require.SERVICE_STATE;

var ServiceClass = (function () {
	_createClass(ServiceClass, null, [{
		key: 'fake',
		value: function fake(docName, data, dispatch) {
			var aTimeout = arguments.length <= 3 || arguments[3] === undefined ? Math.random() * 2000 : arguments[3];

			dispatch({
				type: API_CALL + '_' + docName + '_' + SERVICE_STATE.EXECUTE
			});
			setTimeout(function () {
				dispatch({
					type: API_CALL + '_' + docName + '_' + SERVICE_STATE.FINISH,
					data: data
				});
			}, aTimeout);
		}
	}, {
		key: 'asAction',
		value: function asAction(docName) {
			var serviceState = arguments.length <= 1 || arguments[1] === undefined ? SERVICE_STATE.FINISH : arguments[1];

			return API_CALL + '_' + docName + '_' + serviceState;
		}
	}, {
		key: 'isErrorQuery',
		value: function isErrorQuery(str) {
			if (!str.startsWith(API_CALL)) {
				return false;
			}
			if (!str.endsWith(SERVICE_STATE.ERROR)) {
				return false;
			}
			return true;
		}
	}]);

	function ServiceClass(docName, action, url, data, options) {
		_classCallCheck(this, ServiceClass);

		this.type = API_CALL;

		this.docName = docName;
		this.action = action || METHODS.READ;
		this.url = url || '';
		this.data = data;
		this.options = options || {};
	}

	_createClass(ServiceClass, [{
		key: 'isFinished',
		value: function isFinished() {
			return this.state === SERVICE_STATE.FINISH;
		}
	}, {
		key: 'isExecuting',
		value: function isExecuting() {
			return this.state === SERVICE_STATE.EXECUTE;
		}
	}, {
		key: 'hasAnError',
		value: function hasAnError() {
			return this.state === SERVICE_STATE.error;
		}
	}, {
		key: 'launchRequest',
		value: function launchRequest(dispatch) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				var options = _this.generateAjaxOption(dispatch);
				var defaultSuccess = options.success;
				var defaultError = options.error;
				options.success = function () {
					for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
						args[_key] = arguments[_key];
					}

					defaultSuccess.apply(_this, args);
					resolve.apply(undefined, args);
				};
				options.error = function () {
					for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
						args[_key2] = arguments[_key2];
					}

					defaultError.apply(_this, args);
					reject.apply(undefined, args);
				};

				_jquery2['default'].ajax(_this.url, _this.generateAjaxOption(dispatch));
			});
		}
	}, {
		key: 'defaultAjaxOptions',
		value: function defaultAjaxOptions(dispatch) {
			var _this2 = this;

			return {
				'method': METHODS_MAPPER[this.action],
				'contentType': 'application/json; charset=utf-8',
				'dataType': 'json',
				'crossDomain': true,
				'headers': {
					'accept': 'application/json'
				},
				'success': function success(data) {
					_this2.state = SERVICE_STATE.FINISH;
					if (_this2.options.parse) {
						_this2.dataResponse = _this2.options.parse.apply(_this2, [data, _this2.options]);
					} else {
						_this2.dataResponse = data;
					}
					dispatch(_this2.serialize());
				},
				'error': function error(_error) {
					_this2.state = SERVICE_STATE.ERROR;
					_this2.error = _error.responseJSON;
					dispatch(_this2.serialize());
				}
			};
		}
	}, {
		key: 'generateAjaxOption',
		value: function generateAjaxOption(dispatch) {
			var _this3 = this;

			var ajaxOptions = this.defaultAjaxOptions(dispatch);

			if (this.data) {
				if (this.action === METHODS.READ) {
					ajaxOptions.data = this.data;
				} else {
					ajaxOptions.data = JSON.stringify(this.data);
				}
			}

			if (this.options.success) {
				(function () {
					var defaultsSuccess = ajaxOptions.success;
					ajaxOptions.success = function (res) {
						defaultsSuccess(res);
						_this3.options.success.apply(_this3, [res]);
					};
				})();
			}

			if (this.options.error) {
				(function () {
					var defaultError = ajaxOptions.error;
					ajaxOptions.error = function (res) {
						defaultError(res);
						_this3.options.error.apply(_this3, [res]);
					};
				})();
			}

			if (this.options.headers) {
				ajaxOptions.headers = _underscore2['default'].extend(ajaxOptions.headers || {}, this.options.headers);
			}
			return ajaxOptions;
		}
	}, {
		key: 'getStartAction',
		value: function getStartAction() {
			this.state = SERVICE_STATE.EXECUTE;
			return this.serialize();
		}
	}, {
		key: 'serializeType',
		value: function serializeType() {
			return ServiceClass.asAction(this.docName, this.state);
		}
	}, {
		key: 'serialize',
		value: function serialize() {
			return {
				type: this.serializeType(),
				docName: this.docName,
				action: this.action,
				url: this.url,

				state: this.state,
				data: this.dataResponse,
				error: this.error,

				isFinished: this.isFinished(),
				isExecuting: this.isExecuting(),
				hasAnError: this.hasAnError(),
				isAQuery: true,
				options: this.options
			};
		}
	}]);

	return ServiceClass;
})();

exports['default'] = ServiceClass;
module.exports = exports['default'];