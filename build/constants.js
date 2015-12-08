'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var SERVICE_STATE = {
	EXECUTE: 'EXECUTE',
	ERROR: 'ERROR',
	FINISH: 'FINISH'
};

exports.SERVICE_STATE = SERVICE_STATE;
var METHODS = {
	READ: 'READ',
	DESTROY: 'DESTROY',
	UPDATE: 'UPDATE',
	CREATE: 'CREATE'
};

exports.METHODS = METHODS;
var METHODS_MAPPER = {
	READ: 'GET',
	DESTROY: 'DELETE',
	UPDATE: 'PUT',
	CREATE: 'POST'
};

exports.METHODS_MAPPER = METHODS_MAPPER;
var API_CALL = 'API_CALL';
exports.API_CALL = API_CALL;