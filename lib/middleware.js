import {ServiceClass} from './ServiceClass'

const ServiceClassMiddleware = store => next => action => {
	//serialize request to map action
	//Differ success call
	if(action instanceof ServiceClass) {		
		var startAction = action.getStartAction();
		action.launchRequest(store.dispatch);
		return next(startAction);
	}
	return next(action);
}