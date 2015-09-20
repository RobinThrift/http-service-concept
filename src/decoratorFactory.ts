/// <reference path='./lodash.defaults.d.ts'/>

import assignDefaults = require('lodash.defaults');

type Descriptor = {
    value: Function
}

// basically an identity function
function prep(route, config) {
    return {route, config};
}

function decoratorFactory(method, rqu) {
    return function(route, config = {}, prepare = prep) {
        let {Promise, request, isPromiseAlike, defaults} = rqu; // we do this here, so we don't bind too early

        if (Promise === null) {
            throw new Error('Please speciy a promise implementation');
        }

        config = assignDefaults(config, defaults);
        
        // this is the actual decorator that will be called by the 'runtime'
        return (target: Function, name: string, descriptor: Descriptor) => {
            let origFn = descriptor.value;
            descriptor.value = function(...args) { // explicitly using 'function' here for 'this' binding!
                return new Promise((resolve, reject) => { // outer promise
                    config['args'] = args;
                    // prepare the route using the prepare function
                    let {route: _route, config: _config} = prepare(route, config);

                    request(method, _route, _config) // actually fire of the request
                        .then((res) => {
                            args.push(res);
                            
                            // execute the original method. 'this' here should bind
                            // to the original instance
                            let potentialPromise = origFn.apply(this, args);

                            if (isPromiseAlike(potentialPromise)) {
                                potentialPromise.then((finalResult) => {
                                    resolve(finalResult); // resolve the outer promise
                                }, (reason) => {
                                    reject(reason); // reject the outer promise
                                });
                            } else {
                                resolve(potentialPromise); // resolve the outer promise
                            }
                        }, (reason) => {
                            reject(reason); // reject the outer promise
                        });
                });
            };
        };
    };
}

export default decoratorFactory;
