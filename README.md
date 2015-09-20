# rqu
Simple ES7/2016 decorators that wrap around class methods to make async requests for them. Inspired by [Retrofit](https://square.github.io/retrofit/).

## Usage
rqu provides a set of decorators (one for each HTTP Method) that all have the same basic API:

```javascript
import rqu from 'rqu'
// set promise and request handler implementation and defaults (see below)
class UserService {
    @rqu.GET('/users')
    getAll(users) {
        return map(users, (u) => {return u.name.toUpperCase();});
    }

    @rqu.GET('/users/:id')
    getById(id, user) {
        user.name = user.name.toUpperCase();
        return user;
    }

    @rqu.GET('/users/:id', {}, prepare)
    getById(id, user) {
        user.name = user.name.toUpperCase();
        return user;
    }
}

var us = new UserService();
us.getById(1)
    .then((user) => {
        // ...
    });
```

### `@METHOD` API
The decorator takes 3 arguments:

- `route`: The route that will be forwarded to the requester (see below)
- `config`: A config object that will be forwarded to the requester (see below)
- `prepare`: This function will be called before the request is sent off, and before the placeholders have been filled, with the `route` and `config` as parameters. It should return an object containing a route and a config property. This way you can add your own route composing/handling and set other config options based on input parameters.

All arguments that are passed to the host method (e. g. `getAll` above) are captured in `config.args` when being passed to the request
implementation. The host method will be called by the decorator with all the original arguments and the result of the request
as the last argument.

All errors that are handed to the internal promises should bubble up to the outermost (e. g. `.getById(1).then` above) promise `then` handler.

#### Route Placeholders
You can set route placeholders by using a semicolon `:`. You can name them whatever you like, but they will be filled in order
by the arguments that are passed to the method (in `config.args`), i. e.:

```javascript
class UserService {
    @rqu.GET('/users/:id/:date')
    getByIdAndDate(id, date, user) {
        user.name = user.name.toUpperCase();
        return user;
    }
}
var us = new UserService();

us.getByIdAndDate(1, '01-01-2015') // <- this would result in 'user/1/01-01-2015'
    .then((user) => {
        // ...
    });
```


### `Promise` implementation
To keep this library small, I have chosen not to include a promise library by default. You can set your own by setting `rqu.Promise`.
For example, to use the excellent [Q-Library](https://github.com/kriskowal/q):

```javascript
import rqu from 'rqu';
import Q from 'q';

rqu.Promise = Q.Promise;
```

### `request` implementation
rqu does not come with its own way of handling requests, that's up to you. To set your handler set `rqu.request` and make
sure it returns a `Promise` (preferably the same type as set in `rqu.Promise`):

```javascript
import rqu from 'rqu';
import request from 'request';

rqu.request = (method, route, config) => {
    return new Promise((resolve, reject) => {
        request[method](`${config.baseUrl}${route}`, (err, res) => {
            if (err) {
                reject(err);
            } else { // skipping over status code checking here!
                resolve(res.body);
            }
        });
    });
};
```


## Git Commit Messages

- Use the past tense ("Added feature" not "Add feature")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally
- Consider starting the commit message with an applicable emoji:
 - ➕ when adding a feature
 - ➖ when removing a feature
 - 🎉 when improving a feature
 - 🎨 when improving the format/structure of the code
 - 🐎 when improving performance
 - 🚱 when plugging memory leaks
 - 🔞 when using dirty hacks
 - 📝 when writing docs
 - 🐛 when fixing a bug
 - 🔥 when removing code or files
 - 💚 when fixing the CI build
 - 💻 when making changes to the infrastructure
 - ✅ when adding tests
 - 🔒 when dealing with security
 - ⬆️ when upgrading dependencies
 - ⬇️ when downgrading dependencies
 - 👕 when removing linter warnings

([source](https://atom.io/docs/latest/contributing#git-commit-messages))
