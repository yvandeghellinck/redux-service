const {STACK_SERVICES} = require('./constants');

export const stackServices = [];

const middleware = store => next => action => {

	let ServiceClass = require('./ServiceClass');
	//serialize request to map action
	//Differ success call
	if(action instanceof ServiceClass) {

		if(action.type === STACK_SERVICES) {
			stackServices.push(action);
			return;
		}

		var startAction = action.getStartAction();
		action.launchRequest(store.dispatch);
		return next(startAction);
	}

	return next(action);
}

export default middleware