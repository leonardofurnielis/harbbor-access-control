# Express Access Control

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/55fd7fc2ca1a40f989cfd4fb08ef143f)](https://www.codacy.com/app/leonardofurnielis1/express-accesscontrol?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=leonardofurnielis1/express-accesscontrol&amp;utm_campaign=Badge_Grade)
[![License](https://img.shields.io/github/license/leonardofurnielis1/express-accesscontrol.svg)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE)
![npm](https://img.shields.io/npm/dt/@leonardofurnielis1/express-accesscontrol.svg)
[![Coverage Status](https://coveralls.io/repos/github/leonardofurnielis1/express-accesscontrol/badge.svg?branch=master)](https://coveralls.io/github/leonardofurnielis1/express-accesscontrol?branch=master)

Express Middleware for Role Based Access Control library enable you to manage the requests made to your express server.

## Installation

You can download `express-accesscontrol` from NPM

```bash
$ npm install @leonardofurnielis1/express-accesscontrol
```

then in your project require @leonardofurnielis1/express-accesscontrol

```js
const accessControl = require('@leonardofurnielis1/express-accesscontrol');
```

or GitHub

```bash
$ git clone https://github.com/leonardofurnielis1/express-accesscontrol.git
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
  }
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

| Property        | Type              | Description                                                                                                                                                              |
|-----------------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **group**       | `string`          | This property defines the access group to which a user can belong to `user`, `guest`, `admin`.                                                                           |
| **permissions** | `string`          | This property contains an array of objects that define the resources exposed to a group and the methods allowed/denied.                                                  |
| **methods**     | `string || Array` | This are http methods that a user is allowed or denied from executing. `["POST", "GET", "PUT"]`. use glob `*` if you want to include all http methods.                   |
| **action**      | `string`          | This property tell access control what action to perform on the permission given. Using the above example, the user policy specifies a deny action, meaning all traffic. |

## Middleware

**config\[type: function, params: options { filename<string>,path<string>, prefix, policies}]**

This methods loads the configuration json file or array os policies.

### config

*··**filename**: Name of the policies file `policies.json`
*··**path**: Location of the policies file
*··**prefix**: The base url of your API  `/api/v1`
*··**policies**: Allows you to set policies directly without using config file.

```js
const app = require('express');
const accessControl = require('@leonardofurnielis1/express-accesscontrol');
const path = require('path');

// Using policies file

accessControl.config({
  prefix: '/api/v1',
  path: path.join(__dirname, '/'),
  filename: 'polices.json'
});

// Using policies from array

accessControl.config({
  accessControl: policiesArray,
  prefix: '/api/v1'
});

// Setting express access control middleware

app.use(accessControl.authorize());

```

## Customization

To set custom message error / search path

```js
accessControl.config(options, {
	customMessage: '<Your denied message>',
	// by default the middleware search user group into [req.group, req.session.group, default = 'guest']
	// use `searchPath`, to get user group from diffetent path into request
	searchPath: 'session.user.group' 
	});
};
```
