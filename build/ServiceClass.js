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

exports['default'] = ServiceClass = (function () {
	_createClass(ServiceClass, null, [{
		key: 'fake',
		value: function fake(docName, data, dispatcher) {
			debugger;
		}
	}, {
		key: 'asAction',
		value: function asAction(docName) {
			var serviceState = arguments.length <= 1 || arguments[1] === undefined ? ServiceState.FINISH : arguments[1];

			return API_CALL + '_' + docName + '_' + serviceState;
		}
	}, {
		key: 'isErrorQuery',
		value: function isErrorQuery(str) {
			if (!str.startsWith(API_CALL)) {
				return false;
			}
			if (!str.endsWith(ServiceState.ERROR)) {
				return false;
			}
			return true;
		}
	}]);

	function ServiceClass(docName, action, url, data, options) {
		_classCallCheck(this, ServiceClass);

		this.type = API_CALL;

		this.docName = docName;
		this.action = action;
		this.url = url;
		this.data = data;
		this.options = options || {};
	}

	_createClass(ServiceClass, [{
		key: 'isFinished',
		value: function isFinished() {
			return this.state == ServiceState.FINISH;
		}
	}, {
		key: 'isExecuting',
		value: function isExecuting() {
			return this.state == ServiceState.EXECUTE;
		}
	}, {
		key: 'hasAnError',
		value: function hasAnError() {
			return this.state == ServiceState.error;
		}
	}, {
		key: 'launchRequest',
		value: function launchRequest(dispatch) {
			_jquery2['default'].ajax(this.url, this.generateAjaxOption(dispatch));
		}
	}, {
		key: 'defaultAjaxOptions',
		value: function defaultAjaxOptions(dispatch) {
			return {
				'method': METHODS_MAPPER[this.action],
				'contentType': 'application/json; charset=utf-8',
				'dataType': 'json',
				"crossDomain": true,
				"headers": {
					"accept": "application/json"
				},
				'success': (function (data, status, request) {
					this.state = ServiceState.FINISH;
					if (this.options.parse) {
						this.data = this.options.parse.apply(this, [data, this.options]);
					} else {
						this.data = data;
					}
					dispatch(this.serialize());
				}).bind(this),
				'error': (function (error) {
					this.state = ServiceState.ERROR;
					this.error = error;
					dispatch(this.serialize());
				}).bind(this)
			};
		}
	}, {
		key: 'generateAjaxOption',
		value: function generateAjaxOption(dispatch) {
			var ajaxOptions = this.defaultAjaxOptions(dispatch);

			if (this.data) {
				if (this.action == METHODS.READ) {
					ajaxOptions.data = this.data;
				} else {
					ajaxOptions.data = JSON.stringify(this.data);
				}
			}

			if (this.options.success) {
				var defaultsSuccess = ajaxOptions.success;
				ajaxOptions.success = (function (res) {
					defaultsSuccess(res);
					this.options.success.apply(this, [res]);
				}).bind(this);
			}

			if (this.options.error) {
				var defaultError = ajaxOptions.error;
				ajaxOptions['error'] = (function (res) {
					defaultError(res);
					this.options.error.apply(this, [res]);
				}).bind(this);
			}

			if (this.options.headers) {
				ajaxOptions.headers = _underscore2['default'].extend(ajaxOptions.headers || {}, this.options.headers);
			}
			return ajaxOptions;
		}
	}, {
		key: 'getStartAction',
		value: function getStartAction() {
			this.state = ServiceState.EXECUTE;
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
				data: this.data,
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

module.exports = exports['default'];