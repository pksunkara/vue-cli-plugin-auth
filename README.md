# vue-cli-plugin-auth

Vue CLI plugin for Authentication

## Installation

```
$ vue add auth
```

## Usage

##### Script

This will create a `src/auth.js` file which you can use in your Vue component script as following:

```js
import auth from './auth';

export default {
  data() {
    return {
      auth
    }
  }
}
```

and then you can use `auth.authenticated` to check whether the user is authorized or not.

##### Template

You can also use `auth.login()` and `auth.logout()` to do the described actions.

```html
<a @click="auth.login()" href="#" v-show="!auth.authenticated">Login</a>
<a @click="auth.logout()" href="#" v-show="auth.authenticated">Logout</a>
```

## Contributors
Here is a list of [Contributors](http://github.com/pksunkara/vue-cli-plugin-auth/contributors)

### TODO

__I accept pull requests and guarantee a reply back within a day__

## License
MIT/X11

## Bug Reports
Report [here](http://github.com/pksunkara/vue-cli-plugin-auth/issues). __Guaranteed reply within a day__.

## Contact
Pavan Kumar Sunkara (pavan.sss1991@gmail.com)

Follow me on [github](https://github.com/users/follow?target=pksunkara), [twitter](http://twitter.com/pksunkara)
