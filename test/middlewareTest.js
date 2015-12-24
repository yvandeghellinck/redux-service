// import chai from 'chai';
import { expect, assert } from 'chai';
import { middleware, queuingServiceMiddleware, ServiceMiddlewareManager } from '../src/middleware';

// var assert = require('assert');
const ServiceClass = require('../src/ServiceClass');
const { SERVICE_STATE } = require('../src/constants');

class TestServiceClass extends ServiceClass {

	constructor(success = true) {
		super('test', 'unknow', null, null, null);
		this.endWithSuccess = success;
	}

	launchRequest(dispatch) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (this.endWithSuccess) {
					this.state = SERVICE_STATE.FINISH;
					this.dataResponse = 'XYZ';
					dispatch(this.serialize());
					resolve();
				} else {
					this.state = SERVICE_STATE.ERROR;
					dispatch(this.serialize());
					reject(new Error('REJECT SERVICE'));
				}
			}, Math.random() * 200);
		});
	}
}

class Store {
	getState() {
		return {};
	}
	dispatch() {}
}

const generateFakeStore = () => {
	return new Store();
};

// const generateNext = () => {
// 	return ()=>{};
// };

describe('Array', () => {
	describe('#testing middleware', () => {
		it('test serviceclass correctly serialized by middleware in normal mode', () => {
			middleware(generateFakeStore())((action) => {
				expect(action).to.be.an('object');
				expect(action).to.have.property('type');// .with.length(3);
			})(new TestServiceClass());
		});

		it('test serviceclass correctly stopped by queuingServiceMiddleware', () => {
			const myStack = [];
			const mw = queuingServiceMiddleware(myStack);
			mw(generateFakeStore())(() => {
				// expect(action).to.be.an('object');
				throw new Error('Unexpected call');
			})(new TestServiceClass());
			mw(generateFakeStore())(() => {
				// expect(action).to.be.an('object');
				throw new Error('Unexpected call');
			})(new TestServiceClass());
			assert(myStack.length === 2);
		});

		it('test middleware manager stack switch False call next', () => {
			const manager = new ServiceMiddlewareManager();

			const generatedMiddleware = manager.middleware();
			const aService = new TestServiceClass();

			manager.setStackMode(false);

			generatedMiddleware(generateFakeStore())(() => {
				assert(true);
			})(aService);
		});


		it('test middleware manager stack switch true not call next', () => {
			const manager = new ServiceMiddlewareManager();

			const generatedMiddleware = manager.middleware();
			const aService = new TestServiceClass();

			manager.setStackMode(true);

			generatedMiddleware(generateFakeStore())(() => {
				assert(false);
			})(aService);
			assert(true);
		});


		it('test middleware manager stack switch true and false after', () => {
			const manager = new ServiceMiddlewareManager();

			const generatedMiddleware = manager.middleware();
			const aService = new TestServiceClass();

			manager.setStackMode(false);
			generatedMiddleware(generateFakeStore())(() => {
				assert(true);
			})(aService);

			manager.setStackMode(true);
			generatedMiddleware(generateFakeStore())(() => {
				assert(false);
			})(aService);
			assert(true);
		});


		it('test middleware manager stack correctly pushed when stack mode', () => {
			const manager = new ServiceMiddlewareManager();

			const generatedMiddleware = manager.middleware();
			manager.setStackMode(true);
			const store = generateFakeStore();
			const neverCalledNext = () => { assert(false, ' is called ?'); };

			generatedMiddleware(store)(neverCalledNext)(new TestServiceClass());
			generatedMiddleware(store)(neverCalledNext)(new TestServiceClass());
			generatedMiddleware(store)(neverCalledNext)(new TestServiceClass());

			assert(manager.getStack().length === 3);
		});


		it('test async callback when stacked services all ok', (done) => {
			const manager = new ServiceMiddlewareManager();

			const generatedMiddleware = manager.middleware();
			manager.setStackMode(true);
			const store = generateFakeStore();
			const neverCalledNext = () => {};

			generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(true));
			generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(true));
			generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(true));

			manager.executeStackServices(store)
			.then(() => done())
			.catch(done);
		});

		it('test async callback when stacked services one ko on 3', (done) => {
			const manager = new ServiceMiddlewareManager();

			const generatedMiddleware = manager.middleware();
			manager.setStackMode(true);
			const store = generateFakeStore();
			const neverCalledNext = () => {};

			generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(true));
			generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(false));
			generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(true));

			manager.executeStackServices(store)
			.then(() => done(new Error('accepted but error inside request...')))
			.catch(() => done());
		});

		it('test async callback when no stacked services', (done) => {
			const manager = new ServiceMiddlewareManager();

			// const generatedMiddleware = manager.middleware();
			manager.setStackMode(true);
			const store = generateFakeStore();
			// const neverCalledNext = ()=>{};

			manager.executeStackServices(store)
			.then(() => done())
			.catch(done);
		});
	});
});
