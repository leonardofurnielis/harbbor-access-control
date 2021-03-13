#  express-iam

  
![npm](https://img.shields.io/npm/v/express-iam)
[![Build Status](https://travis-ci.org/leonardofurnielis/express-iam.svg?branch=master)](https://travis-ci.org/leonardofurnielis/express-iam)
[![codecov](https://codecov.io/gh/leonardofurnielis/express-iam/branch/master/graph/badge.svg?token=MKNBSDCL7N)](https://codecov.io/gh/leonardofurnielis/express-iam)
![GitHub](https://img.shields.io/github/license/leonardofurnielis/express-iam)

  

Express Middleware for Identity and Access Management, this library enable you to manage the requests made to your express server.

  

##  Installation

  
  ```bash

$ npm install express-iam --save

```
  

##  Use

  

First step is to create your access policies, it could be stored in a database, file or a simple array, the structure should follow the below example.

  

### Definition of Access Policies

| Option | Default | Description |
| ------ |---------| ------------ |
| access_group | `String` | The access group with name. |
| permissions | `Array` | Array of permissions that defined to an access group, to allow or deny. |
| resource | `String` | The route that the permission will be applied. Use `*` to include all routes or sub-routes. e.g. `/foo/*`. |
| methods | `String \| Array` | The methods that the permission will be applied. Use `*` to include all methods. |
| action | `String` | This property tells `express-iam` what action will be applied on the permission, deny or allow. |
  
```json
[
 {
  "access_group":  "admin",
  "permissions": [
   {
    "resource":  "*",
		"methods":  "*",
		"action":  "allow"
		}
		]
	},
	{
	"access_group":  "guest",
	"permissions": [
		{
		 "resource":  "/foo",
		 "methods": ["POST"],
		 "action":  "allow"
		},
		{
		 "resource":  "/foo2",
		 "methods": ["POST","UPDATE"],
		 "action":  "deny"
		},			
   ]
 }
]

```


## config\[type: function]
This methods loads the configuration to express-iam.

| Option | Default | Description |
| ------ |---------| ------------ |
| access_policies | `Array \| Function` | The access policies array or function. |
| [access_group_search_path] | `String` | The path in request object where access group resides. |
| [custom_message] | `String` | The custom message when user is denied. |
| [default_access_group] | `String` | The default access_group to be assigned if no role defined. |
| [prefix] | `String` | The base URL of your api. e.g. `api/v1`. |
  


```js
const app = require('express');
const path = require('path');
const fs = require('fs');
const expressIAM = require('express-iam');

// Using access policies from file
const accessPoliciesFile =  fs.readFileSync(path.join(__dirname,  './access-policies/access-policies.json'));
expressIAM.config({
	prefix:  '/api/v1',
	access_policies:  accessPoliciesFile,
});

// Using access policies from array
const  accessPoliciesArray = [
	{
		group:  'admin',
			permissions:  [
				{
					resource:  '*',
					methods:  '*',
					action:  'allow',
				},
			],
		},
	];

expressIAM.config({  
access_policies:  accessPoliciesArray,  
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

##  License

  
[MIT](LICENSE)
