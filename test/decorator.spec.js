import {expect} from 'chai';
import Q from 'q';
import rqu from '../dist';

const EXTRACT = /\/([A-Za-z\-]*)$/;
rqu.Promise = Q.Promise;
rqu.isPromiseAlike = Q.isPromise;
rqu.request = (method, route, config) => {
    let xtract = EXTRACT.exec(route),
        path   = xtract[1];
    return new Q.resolve(`${method}: ${path}`);
};

suite('rqu - decorator', () => {
    ['GET', 'POST', 'PUT', 'DETELE', 'PATCH'].forEach((method) => {
        suite(`${method}`, () => {
            test('class method does not return promise', (done) => {
                class Test {
                    @rqu[method]('http://example.com/sync')
                    getAll(users) {
                        return users;
                    }
                }
                let t = new Test();
                t.getAll()
                .then((users) => {
                    expect(users).to.equal(`${method}: sync`);
                    done();
                }, done);
            });

            test('class method returns promise', (done) => {
                class Test {
                    @rqu[method]('http://example.com/promise')
                    getAll(users) {
                        let deferred = Q.defer();
                        deferred.resolve(users);
                        return deferred.promise.delay(10);
                    }
                }
                let t = new Test();
                t.getAll()
                .then((users) => {
                    expect(users).to.equal(`${method}: promise`);
                    done();
                }, done);
            });

            test('prepare function', (done) => {
                let prep = (route, config) => {
                    return {
                        route: `/prepare-${config.args[0]}-${config.args[1]}`,
                        config
                    };
                };
                class Test {
                    @rqu[method]('/prep', {}, prep)
                    getAll(p1, p2, users) {
                        let deferred = Q.defer();
                        deferred.resolve(users);
                        return deferred.promise.delay(10);
                    }
                }
                let t = new Test();
                t.getAll('bar', 'foo')
                .then((resp) => {
                    expect(resp).to.equal(`${method}: prepare-bar-foo`);
                    done();
                }, done);
            });
        });
    });
});
