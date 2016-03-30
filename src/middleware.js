const ServiceClass = require('./ServiceClass');

export const queuingServiceMiddleware = (stack = []) => () => next => action => {
	console.log("Queing stack?");
	if (action instanceof ServiceClass) {
		stack.push(action);
		return null;
	}
	console.log("Not servicle class action");
	console.log(action);
	return next(action);
};

// serialize request to map action
// Differ success call
export const middleware = store => next => action => {
	if (action instanceof ServiceClass) {
		const startAction = action.getStartAction();
		action.launchRequest(store.dispatch);
		return next(startAction);
	}

	return next(action);
};

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
		if (stackMode) {
			this._stack = [];
			this._queuingServiceMiddleware = queuingServiceMiddleware(this.getStack());
		}
		this._stackMode = stackMode;
	}

	getStack() {
		return this._stack;
	}

	middleware() {
		return store => next => action => {
			if (this._stackMode) {
				return this._queuingServiceMiddleware(store)(next)(action);
			}
			return this._middleware(store)(next)(action);
		};// .bind(this)
	}

	executeStackServices(store) {
		// const manager = this;

		const services = this.getStack();
		return 	Promise.all(services.map(
			service => {
				store.dispatch(service.getStartAction());
				return service.launchRequest(store.dispatch);
			}));

		// return new Promise(function promiseFunction(resolve, reject) {
		// 	const services = this.getStack();

		// 	// if (services.length === 0) {
		// 	// 	return resolve();
		// 	// }

		// 	// const promises = [];

		// 	Promise.all(serives.map(service => {
		// 		store.dispatch(service.getStartAction());
		// 		return service.launchRequest(store.dispatch);
		// 	}));
		// 	.then(resolve)
		// 	.catch(reject)

		// 	// services.forEach((service, index) => {
		// 	// 	store.dispatch(service.getStartAction());

		// 	// 	service.launchRequest(store.dispatch)
		// 	// 	.then(() => {
		// 	// 		promises[index] = 'accepted';
		// 	// 		let count = 0;
		// 	// 		promises.forEach(currentPromise => {
		// 	// 			if (currentPromise === 'accepted') {
		// 	// 				count = count + 1;
		// 	// 			}
		// 	// 		});
		// 	// 		if (count === promises.length) {
		// 	// 			resolve();
		// 	// 		}
		// 	// 	})
		// 	// 	.catch(reject);
		// 	// 	return 'start_request';
		// 	// });

		// }.bind(this));
	}
}
