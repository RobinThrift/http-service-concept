/// <reference path='../typings/tsd.d.ts'/>

import decoratorFactory from './decoratorFactory';

var rqu = {
    Promise: null,
    request: () => {
        throw new Error('Please specify a request handler!')
    },
    isPromiseAlike(testee) {
        return testee instanceof rqu.Promise || typeof testee.then === 'function';
    },
    defaults: {}
};

['GET', 'POST', 'PUT', 'DETELE', 'PATCH'].forEach((method) => {
    rqu[method] = decoratorFactory(method, rqu);
});


export default rqu;
