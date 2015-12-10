let ServiceClass = require('./ServiceClass');

export const queuingServiceMiddleware = (stack = []) => store => next => action => {
	
	if(action instanceof ServiceClass) {
		stack.push(action);
		return;
		// var startAction = action.getStartAction();
		// action.launchRequest(store.dispatch);
		// return next(startAction);
	}

	return next(action);
}

export const middleware = store => next => action => {
	//serialize request to map action
	//Differ success call
	if(action instanceof ServiceClass) {
		var startAction = action.getStartAction();
		action.launchRequest(store.dispatch);
		return next(startAction);
	}

	return next(action);
}

export class ServiceMiddlewareManager {
	
	constructor(stackMode = false) {
		this._stack = [];
		this.setStackMode(stackMode);
		this.configureMiddlewares();
	}
	configureMiddlewares() {
		this._queuingServiceMiddleware = queuingServiceMiddleware(this.getStack());
		this._middleware = middleware;
	}

	setStackMode(stackMode) {
		if(stackMode) {
			this._stack = [];
			this._queuingServiceMiddleware = queuingServiceMiddleware(this.getStack());
		}
		this._stackMode = stackMode;
	}

	getStack() {
		return this._stack;
	}

	middleware (){
		return store => next => action => {
			// if(this._silentMode) {
			// 	return next(action);
			// }
			if(this._stackMode) {
				return this._queuingServiceMiddleware(store)(next)(action);
			} else {
				return this._middleware(store)(next)(action);
			}
		}.bind(this)
	}

	executeStackServices (store, requestLauncher) {
		return new Promise((resolve, reject) => {
			var services = this.getStack();

			var promises = services.map((service, index)=>{
				store.dispatch(service.getStartAction());
				
				var promise = null;
				if(!requestLauncher) {
					promise = service.launchRequest(store.dispatch)	
				} else {
					promise = requestLauncher(service.url, this.generateAjaxOption(store.dispatch));
				}
				promise
				.then(()=>{
					promises[index] = 'accepted';
					var count = 0;
					promises.forEach(currentPromise=>{
						if(currentPromise === 'accepted') {
							count = count + 1;
						}
					});
					if(count === promises.length) {
						resolve();
					}
				}.bind(this))
				.catch(reject);
				return 'start_request'
			}.bind(this));
		}.bind(this));
	}
}