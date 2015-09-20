
function dfErrorHandler(error) {
    throw error;
}

import request from 'request';
import Q from 'q';


function Get(route, config, errorHandler = dfErrorHandler) {
    return (target, name, descriptor) => {
        let origFn = descriptor.value;
        descriptor.value = function(...args) {
            let deferred = Q.defer();

            request(route, (err, res) => {
                args.push(res.body);

                let potentialPromise = origFn.apply(this, args);

                if (Q.isPromise(potentialPromise)) {
                    potentialPromise.then((finalResult) => {
                        deferred.resolve(finalResult);
                    }, (reason) => {
                        deferred.reject(reason);
                    });
                } else {
                    deferred.resolve(potentialPromise);
                }
            });

            return deferred.promise;
        }
    };
}

export default {GET: Get};
