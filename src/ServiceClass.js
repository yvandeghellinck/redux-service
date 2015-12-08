import $ from 'jquery';
import _ from 'underscore';

const {API_CALL, METHODS, METHODS_MAPPER} = require('./constants');

export default ServiceClass = class {

	static fake(docName, data, dispatcher) {
		debugger
	}

	static asAction(docName, serviceState = ServiceState.FINISH) {
		return API_CALL+'_'+docName+'_'+serviceState;
	}

	static isErrorQuery(str) {
		if(!str.startsWith(API_CALL)) {
			return false;
		}
		if(!str.endsWith(ServiceState.ERROR)) {
			return false;
		}
		return true;
	}

	constructor(docName, action, url, data, options) {
		this.type = API_CALL;

		this.docName = docName;
		this.action = action;
		this.url = url;
		this.data = data;
		this.options = options || {};
	}

	isFinished() {
		return this.state == ServiceState.FINISH;
	}

	isExecuting() {
		return this.state == ServiceState.EXECUTE;
	}

	hasAnError() {
		return this.state == ServiceState.error;
	}

	launchRequest(dispatch) {
		$.ajax(this.url, this.generateAjaxOption(dispatch));	
	}

	defaultAjaxOptions(dispatch) {
		return  {
			'method': METHODS_MAPPER[this.action],
			'contentType': 'application/json; charset=utf-8',
			'dataType': 'json',
			"crossDomain": true,
			"headers": {
			      "accept": "application/json",
			},
			'success': function(data, status, request){
				this.state = ServiceState.FINISH;
				if(this.options.parse) {
					this.data = this.options.parse.apply(this, [data, this.options]);
				} else {
					this.data = data;
				}
				dispatch(this.serialize());
			}.bind(this),
			'error': function(error){
				this.state = ServiceState.ERROR;
				this.error = error;
				dispatch(this.serialize())
			}.bind(this)
		};
	}

	generateAjaxOption (dispatch) {
		var ajaxOptions = this.defaultAjaxOptions(dispatch);

		if(this.data) {
			if(this.action == METHODS.READ) {
				ajaxOptions.data = this.data;
			} else {
				ajaxOptions.data = JSON.stringify(this.data);
			}
		}

		if(this.options.success){
			var defaultsSuccess = ajaxOptions.success;
			ajaxOptions.success = function(res){
				defaultsSuccess(res);
				this.options.success.apply(this, [res]);
			}.bind(this)
		}

		if(this.options.error){
			var defaultError = ajaxOptions.error;
			ajaxOptions['error'] = function(res) {
				defaultError(res);
				this.options.error.apply(this, [res]);
			}.bind(this)
		}

		if(this.options.headers){
			ajaxOptions.headers = _.extend(
				ajaxOptions.headers||{}, 
				this.options.headers
			);
		}
		return ajaxOptions;
	}

	getStartAction() {
		this.state = ServiceState.EXECUTE;
		return this.serialize();
	}

	serializeType() {
		return ServiceClass.asAction(this.docName, this.state)
	}

	serialize() {
		return {
			
			type : this.serializeType(),
			docName : this.docName,
			action : this.action,
			url : this.url,
			
			state : this.state,
			data : this.data,
			error : this.error,

			isFinished : this.isFinished(),
			isExecuting : this.isExecuting(),
			hasAnError : this.hasAnError(),
			isAQuery : true,
			options : this.options
		}
	}
}

