# express-rbac-guard

[![Build Status](https://travis-ci.org/lfurnielis/express-rbac-guard.svg?branch=master)](https://travis-ci.org/lfurnielis/express-rbac-guard)
![GitHub](https://img.shields.io/github/license/lfurnielis/express-rbac-guard.svg)
![npm](https://img.shields.io/npm/dm/express-rbac-guard.svg)
[![Coverage Status](https://coveralls.io/repos/github/lfurnielis/express-rbac-guard/badge.svg?branch=master)](https://coveralls.io/github/lfurnielis/http-json-error-handler?branch=master)

Express Middleware for Role Based Access Control library enable you to manage the requests made to your express server.

## Installation

You can download `express-rbac-guard` from NPM

```bash

$ npm install express-rbac-guard

```

then in your project require

```js
const rbac = require('express-rbac-guard');
```

or GitHub

```bash

$ git clone https://github.com/lfurnielis/express-rbac-guard.git

```

## Guide

First step is to create a file `policies.json` and place this in project folder. This is the file where we will define the roles that can access our application, and the policies that restrict or give access to certain resources.

**Configuration Example**

```json
[
  {
    "group": "admin",
    "permissions": [
      {
        "resource": "*",
        "methods": "*",
        "action": "allow"
      }
    ]
  },
  {
    "group": "guest",
    "permissions": [
      {
        "resource": "/auth",
        "methods": ["POST"],
        "action": "allow"
      }
    ]
  }
]
```


| Params      | Type     | Purpose                                                                                                                                                                  |
| ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| group       | `String` | This property defines the access group to which a user can belong to user, guest, admin.                                                                                 |
| permissions | `String` | This property contains an array of objects that define the resources exposed to a group and the methods allowed/denied.                                                  |
| methods     | `String` |                                                                                                                                                                          | `Array` | This are http methods that a user is allowed or denied from executing. ["POST", "GET", "PUT"]. use glob \* if you want to include all http methods. |
| action      | `String` | This property tell access control what action to perform on the permission given. Using the above example, the user policy specifies a deny action, meaning all traffic. |


## Middleware

**config\[type: function, params: options { filename<string>,path<string>, prefix, policies}]**

This methods loads the configuration json file or array os policies.

### config

| Params              | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| filename (optional) | Name of the policies file `policies.json`.                     |
| path (optional)     | Location of the policies file.                                 |
| prefix (optional)   | The base url of your API `/api/v1`.                            |
| policies (optional) | Allows you to set policies directly without using config file. |



```js

const app = require('express');
const path = require('path');
const rbac = require('express-rbac-guard');

// Using policies file

rbac.config({
  prefix: '/api/v1',
  path: path.join(__dirname, '/'),
  filename: 'polices.json',
});

// Using policies from array

const policiesArray = [
  {
    group: 'admin',
    permissions: [
      {
        resource: '*',
        methods: '*',
        action: 'allow',
      },
    ],
  },
];

rbac.config({ accessControl: policiesArray, prefix: '/api/v1' });

// Setting express access control middleware

app.use(rbac.authorize());
```

## Customization

To set custom message error / search path

```js
rbac.config(options, {
  customMessage: '<Your denied message>',
  // by default the middleware search user group into [req.group, req.session.group, req.locals.group, if not match return `guest`]
  // use `searchPath`, to get user group from diffetent path into request
  searchPath: 'session.user.group',
});
```
