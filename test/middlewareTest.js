import chai from 'chai';
import {expect, assert} from 'chai';
// var assert = require('assert');
const ServiceClass = require('../src/ServiceClass');
const {SERVICE_STATE} = require('../src/constants')

class TestServiceClass extends ServiceClass {

	constructor(success=true) {
		super('test', 'unknow', null, null, null);
		this.endWithSuccess = success;
	}

	launchRequest(dispatch) {
		return new Promise((resolve, reject)=>{
			setTimeout(function() {

				if(this.endWithSuccess) {
					this.state = SERVICE_STATE.FINISH;
					this.dataResponse = 'XYZ';
					dispatch(this.serialize());
					resolve();				
				} else {
					this.state = SERVICE_STATE.ERROR;
					dispatch(this.serialize());
					reject(new Error('REJECT SERVICE'));
				}

			}.bind(this), Math.random()*200);				
		});
	}
}

import {middleware, queuingServiceMiddleware, ServiceMiddlewareManager}  from '../src/middleware';

class Store {
	getState() {
		return {};
	}

	dispatch(action) {
		
	}
}

const generateFakeStore = () => {
	return new Store();
}

const generateNext = () => {
	return ()=>{};
}

describe('Array', function() {
  describe('#testing middleware', function () {
    it('test serviceclass correctly serialized by middleware in normal mode', function () {
    	middleware(generateFakeStore())((action)=>{
    		expect(action).to.be.an('object');
    		expect(action).to.have.property('type');//.with.length(3);
    	})(new TestServiceClass());
    });

    it('test serviceclass correctly stopped by queuingServiceMiddleware', function () {
    	const myStack = [];
    	var mw = queuingServiceMiddleware(myStack);
    	mw(generateFakeStore())((action)=>{
    		// expect(action).to.be.an('object');
    		throw new Error('Unexpected call');
    	})(new TestServiceClass());
    	mw(generateFakeStore())((action)=>{
    		// expect(action).to.be.an('object');
    		throw new Error('Unexpected call');
    	})(new TestServiceClass());
    	assert(myStack.length === 2);
    });

    it('test middleware manager stack switch False call next', function () {
    	var manager = new ServiceMiddlewareManager();

    	var generatedMiddleware = manager.middleware();
		var aService = new TestServiceClass();

    	manager.setStackMode(false);

    	generatedMiddleware(generateFakeStore())(action=>{
    		assert(true);
    	})(aService);

    });


    it('test middleware manager stack switch true not call next', function () {
    	var manager = new ServiceMiddlewareManager();

    	var generatedMiddleware = manager.middleware();
		var aService = new TestServiceClass();

    	manager.setStackMode(true);

    	generatedMiddleware(generateFakeStore())(action=>{
    		assert(false);
    	})(aService);
    	assert(true);
    });


    it('test middleware manager stack switch true and false after', function () {
    	var manager = new ServiceMiddlewareManager();

    	var generatedMiddleware = manager.middleware();
		var aService = new TestServiceClass();

    	manager.setStackMode(false);
    	generatedMiddleware(generateFakeStore())(action=>{
    		assert(true);
    	})(aService);

    	manager.setStackMode(true);
    	generatedMiddleware(generateFakeStore())(action=>{
    		assert(false);
    	})(aService);
    	assert(true);
    });


    it('test middleware manager stack correctly pushed when stack mode', function () {
    	var manager = new ServiceMiddlewareManager();

    	var generatedMiddleware = manager.middleware();
    	manager.setStackMode(true);
    	var store = generateFakeStore();
    	var neverCalledNext = ()=>{assert(false, ' is called ?')};

    	generatedMiddleware(store)(neverCalledNext)(new TestServiceClass());
    	generatedMiddleware(store)(neverCalledNext)(new TestServiceClass());
    	generatedMiddleware(store)(neverCalledNext)(new TestServiceClass());

    	assert(manager.getStack().length === 3);

    });


    it('test async callback when stacked services all ok', function (done) {
    	var manager = new ServiceMiddlewareManager();

    	var generatedMiddleware = manager.middleware();
    	manager.setStackMode(true);
    	var store = generateFakeStore();
    	var neverCalledNext = ()=>{};

    	generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(true));
    	generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(true));
    	generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(true));
    	
    	manager.executeStackServices(store)
    	.then(response=>done())
    	.catch(done);
    });

    it('test async callback when stacked services one ko on 3', function (done) {
    	var manager = new ServiceMiddlewareManager();

    	var generatedMiddleware = manager.middleware();
    	manager.setStackMode(true);
    	var store = generateFakeStore();
    	var neverCalledNext = ()=>{};

    	generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(true));
    	generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(false));
    	generatedMiddleware(store)(neverCalledNext)(new TestServiceClass(true));
    	
    	manager.executeStackServices(store)
    	.then(response=>done(new Error('accepted but error inside request...')))
    	.catch(error=>done());
    });

  });
});


