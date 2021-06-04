#  express-iam

  
![npm](https://img.shields.io/npm/v/express-iam)
[![Build Status](https://travis-ci.org/leonardofurnielis/express-iam.svg?branch=master)](https://travis-ci.org/leonardofurnielis/express-iam)
[![codecov](https://codecov.io/gh/leonardofurnielis/express-iam/branch/master/graph/badge.svg?token=MKNBSDCL7N)](https://codecov.io/gh/leonardofurnielis/express-iam)
![GitHub](https://img.shields.io/github/license/leonardofurnielis/express-iam)
![npm](https://img.shields.io/npm/dm/express-iam)

  

Express Middleware for Identity and Access Management, this library enable you to manage the requests made to your express server.

  

##  Installation

  
  ```bash
$ npm install express-iam --save

```
  

##  Use

  

First step is to create your access control, it could be stored in a database, file or a simple array, the structure should follow the below example.

  

### Definition of Access Control

| Option | Default | Description |
| ------ |---------| ------------ |
| access_group | `String` | The access group with name. |
| permissions | `Array` | Array of permissions that defined to an access group, to allow or deny. |
| path | `String` | The route that the permission will be applied. Use `*` to include all routes or sub-routes. e.g. `/foo/*`. |
| methods | `String \| Array` | The methods that the permission will be applied. Use `*` to include all methods. |
| action | `String` | This property tells `express-iam` what action will be applied on the permission, deny or allow. |


```json
[
  {
    "access_group":"admin",
    "permissions":[
      {
        "path":"*",
        "methods":"*",
        "action":"allow"
      }
    ]
  },
  {
    "access_group":"guest",
    "permissions":[
      {
        "path":"/foo",
        "methods":[
          "POST"
        ],
        "action":"allow"
      },
      {
        "path":"/foo2",
        "methods":[
          "POST",
          "UPDATE"
        ],
        "action":"deny"
      }
    ]
  }
]

```


## config\[type: function]
This methods loads the configuration to express-iam.

| Option | Default | Description |
| ------ |---------| ------------ |
| access_control | `Array \| Function` | The access control array or function. |
| access_group_search_path | `String` | The path in request object where access group resides. |
| custom_message | `String` | The custom message when user is denied. |
| default_access_group | `String` | The default access_group to be assigned if no role defined. |
| prefix | `String` | The base URL of your api. e.g. `api/v1`. |
  


```js
const app = require('express');
const path = require('path');
const fs = require('fs');
const expressIAM = require('express-iam');

// Using access control from file
const accessControlFile =  fs.readFileSync(
  path.join(__dirname,  './access-control/access-control.json'));
  
expressIAM.config({
	prefix:  '/api/v1',
	access_control:  accessControlFile,
});

// Using access control from array
const  accessControlArray = [
  {
    "group":"admin",
    "permissions":[
      {
        "path":"*",
        "methods":"*",
        "action":"allow"
      }
    ]
  }
];

expressIAM.config({  
access_control:  accessControlArray,  
prefix:  '/api/v1'  });
```

## authorize\[type: function]
This methods is the middleware to express-iam manage your requests.

In an [express](https://www.npmjs.com/package/express) based application:

```js
const express = require('express');
const app = express();

app.use(expressIAM.authorize());

```

### unless\[type: function]

By default, express-iam will block any route that does not have access control defined. This method allows you to create exceptions for routes that did not use express-iam.


| Option | Type | Description |
| ------ |---------| ------------ |
| paths | `String\|Array` | String or an array of string containing the path to be skipped. It also could be an array of object which is `path` and `methods` key-pairs. |
| methods | `String\|Array` | String or an array of string containing the methods to be skipped. |
| useOriginalUrl | `Boolean` | It could be `true` or `false`, default is `true`. if `false`, path will match against `req.url` instead of `req.originalUrl`. Please refer to [express](https://www.npmjs.com/package/express) for the difference between `req.url` and `req.originalUrl`. |

```js
const express = require('express');
const app = express();

app.use(expressIAM.authorize().unless({ paths: ['/foo'] }));

```

##  License

  
[MIT](LICENSE)
