import SJQuery from 'jquery';
import _ from 'underscore';

const {API_CALL, METHODS, METHODS_MAPPER, SERVICE_STATE} = require('./constants');

const ServiceClass = class {

	static fake(docName, data, dispatch, aTimeout = (Math.random()*2000)) {
		dispatch({
			type:API_CALL+'_'+docName+'_'+SERVICE_STATE.EXECUTE,
		});
		setTimeout(() => {
			dispatch({
				type:API_CALL+'_'+docName+'_'+SERVICE_STATE.FINISH,
				data
			});
		}, aTimeout);
	}

	static asAction(docName, serviceState = SERVICE_STATE.FINISH) {
		return API_CALL+'_'+docName+'_'+serviceState;
	}

	static isErrorQuery(str) {
		if(!str.startsWith(API_CALL)) {
			return false;
		}
		if(!str.endsWith(SERVICE_STATE.ERROR)) {
			return false;
		}
		return true;
	}

	constructor(docName, action, url, data, options) {
		this.type = API_CALL;

		this.docName = docName;
		this.action = action|| METHODS.READ;
		this.url = url||'';
		this.data = data;
		this.options = options || {};
	}

	isFinished() {
		return this.state == SERVICE_STATE.FINISH;
	}

	isExecuting() {
		return this.state == SERVICE_STATE.EXECUTE;
	}

	hasAnError() {
		return this.state == SERVICE_STATE.error;
	}

	launchRequest(dispatch) {
		return new Promise((resolve, reject)=>{
			var options = this.generateAjaxOption(dispatch);
			var defaultSuccess = options.success;
			var defaultError = options.error;
			options.success = (...args)=>{
				defaultSuccess.apply(this, args)
				resolve(...args);
			};
			options.error = (...args)=>{
				defaultError.apply(this, args)
				reject(...args);
			};

			SJQuery.ajax(this.url, this.generateAjaxOption(dispatch));
		});
		
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
				this.state = SERVICE_STATE.FINISH;
				if(this.options.parse) {
					this.dataResponse = this.options.parse.apply(this, [data, this.options]);
				} else {
					this.dataResponse = data;
				}
				dispatch(this.serialize());
			}.bind(this),
			'error': function(error){
				this.state = SERVICE_STATE.ERROR;
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
		this.state = SERVICE_STATE.EXECUTE;
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
			data : this.dataResponse,
			error : this.error,

			isFinished : this.isFinished(),
			isExecuting : this.isExecuting(),
			hasAnError : this.hasAnError(),
			isAQuery : true,
			options : this.options
		}
	}
}

export default ServiceClass;
