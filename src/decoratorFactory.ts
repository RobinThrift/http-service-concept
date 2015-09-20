
type Options = {
    Promise: Function,
    request: (method: string, route: string, config: Object) => any
}

type Descriptor = {
    value: Function
}

function decoratorFactory(method, rqu) {
    return function(route, config = {}) {
        let {Promise, request, isPromiseAlike} = rqu;

        if (Promise === null) {
            throw new Error('Please speciy a promise implementation');
        }
        return (target: Function, name: string, descriptor: Descriptor) => {
            let origFn = descriptor.value;
            descriptor.value = function(...args) {
                return new Promise((resolve, reject) => {
                    request(method, route, config)
                        .then((res) => {
                            args.push(res);

                            let potentialPromise = origFn.apply(this, args);

                            if (isPromiseAlike(potentialPromise)) {
                                potentialPromise.then((finalResult) => {
                                    resolve(finalResult);
                                }, (reason) => {
                                    reject(reason);
                                });
                            } else {
                                resolve(potentialPromise);
                            }
                        }, (reason) => {
                            reject(reason);
                        });
                });
            };
        };
    }
}

export default decoratorFactory;
