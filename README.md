# Bullet UI

[![Build Status](https://travis-ci.org/yahoo/bullet-ui.svg?branch=master)](https://travis-ci.org/yahoo/bullet-ui) [![Code Climate](https://codeclimate.com/github/yahoo/bullet-ui/badges/gpa.svg)](https://codeclimate.com/github/yahoo/bullet-ui) [![Test Coverage](https://codeclimate.com/github/yahoo/bullet-ui/badges/coverage.svg)](https://codeclimate.com/github/yahoo/bullet-ui/coverage)

This is the UI for Bullet created with Ember 2. The UI stores all created queries, results and other metadata in the browser's **LocalStorage**.

## Prerequisites

In order for your UI to work with Bullet, you should have:

* An instance of [Bullet](https://github.com/yahoo/bullet-storm)
* An instance of the [Bullet Web-Service](https://github.com/yahoo/bullet-service)
* You should also have a web-service serving your schema (either by using the file based serving from the Bullet Web-Service or your own somewhere else).

## Installation

We are considering various packaging options at the moment. In the meantime, the following option is available:

* Install [Node](https://nodejs.org/) (recommend using [nvm](https://github.com/creationix/nvm) to manage Node versions).
* Install [Bower](https://bower.io/). Use NPM to install it with ```sudo npm install -g bower```
* Install [Ember](http://emberjs.com/). ```sudo npm install -g ember-cli``` (sudo required only if not using nvm)
* git clone this repository
* change into the new directory
* `npm install`
* `bower install`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

The entire application with all its assets and dependencies are compiled and placed into dist/. You could point a web server directly at this folder but you will **only** be able to use the default configuration (see [below](#configuration)).

## Running

There is a Node.js server endpoint defined at [server/index.js](server/index.js) to serve the UI. This dynamically injects the settings (see configuration [below](#configuration)) into the served UI based on the environment variable NODE_ENV. You should not need to worry about if you only have one environment.

The entrypoint for the UI is the [Express](http://expressjs.com/) endpoint defined as the main in package.json that simply adds the server/index.js as a middleware.

You need the following folder structure in order to run the UI:

```
dist/
config/env-settings.json
server/index.js
express-server.js
```

You can use node to launch the UI from the top-level of the folder structure above.

To launch the UI with the default settings (without specifying proper API endpoints you will not be able to create or run a query):

```bash
PORT=8800 node express-server.js
```

To launch with custom settings:

```bash
NODE_ENV=<your_property_name_from_env-settings.json> PORT=8800 node express-server.js
```
Visit localhost:8800 to see your UI that should be configured with the right settings.

## Configuration

All of the configuration for the UI is **environment-specific**. This lets you have different instances of Bullet for different environments (e.g. CI, Staging, Production).
These settings can be found in [config/env-settings.json](config/env-settings.json).

Each property in the env-settings.json file will contain the settings that will be used when running a custom instance of the UI (see [above](#Running)).

The ```default``` property shows the default settings for the UI that can be selectively overridden based on which host you are running on. The file does not specify the ```defaultFilter``` setting shown below.

```json
"default": {
  "drpcHost": "http://foo.bar.com:4080",
  "drpcNamespace": "bullet/api",
  "drpcPath": "drpc",
  "schemaHost": "http://foo.bar.com:4080",
  "schemaNamespace": "bullet/api",
  "helpLinks": [
    {
      "name": "Example Docs Page",
      "link": ""
    }
  ],
  "defaultFilter": {
      "clauses": [
          {
              "field": "primary_key",
              "values":["123123123321321"],
              "operation":"=="
          }
      ],
      "operation":"AND"
  },
  "aggregateDataDefaultSize": 512,
  "modelVersion": 1
}
```

You can add more configuration at the top level for each host you have the UI running on.

```drpcHost``` is the end point (port included) of your web-service machine that is proxying to the Bullet topology.

```drpcNamespace``` is the fragment of the path to your web-service on the ```drpcHost```.

```schemaHost``` is the end point (port included) of your web-service machine that is serving your schema in the JSON API format (see [Bullet Web-Service](https://github.com/yahoo/bullet-service) for details.)

```schemaNamespace``` is the fragment of the path to your schema web-service on the ```schemaHost```. There is no ```schemaPath``` because it **must** be "columns" in order for the UI to be able fetch the column resource (columns in your schema).

```modelVersion``` is a way for you to control your UI users' Ember models saved in LocalStorage. If there is a need for you to purge all your user's created queries, results and other data stored in their LocalStorage, then you should increment this number. The UI, on startup, will compare this number with what it has seen before (your old version) and purge the LocalStorage.

```helpLinks``` is a list of objects, where each object is a help link. These links drive the dropdown list when you click the "Help" button on the UI's top navbar. You can use this to point to your particular help links. For example, you could use this to point your users toward a page that
helps them understand your data (that this UI is operating on).

```defaultFilter``` can either be a [Bullet Filter Specification](https://github.com/yahoo/bullet-storm#filters) or a URL from which one could be fetched dynamically. The UI adds this filter to every newly created Query. You could use this as a way to have user specific (for example, cookie based) filters created for your users when they create a new query in the UI.

```bugLink``` is a url that by default points to the issues page for the UI GitHub repository (this). You can change it to point to your own custom JIRA queue or the like if you want to.

```aggregateDataDefaultSize``` is the aggregation size for all queries that are not pulling raw data. In order to keep the
aggregation size from being ambiguous for UI users when doing a Count Distinct or a Distinct or a Group By query, this is
the size that is used. You should set this to your max size that you have configured for your non-raw aggregations in
your topology configuration.

**Note that all your web-service endpoints must support CORS (return the right headers) in order for the UI to be able to communicate with it.** The Bullet Web-Service already does this for the DRPC and columns endpoints.

To cement all this, if you wanted an instance of the UI in your CI environment, you could add this to the env-settings.json file.

```json
{
  "default": {
      "drpcHost": "",
      "drpcNamespace": "bullet/api",
      "drpcPath": "drpc",
      "schemaHost": "",
      "schemaNamespace": "bullet/api",
      "helpLinks": [
        {
          "name": "Data Documentation",
          "link": "http://data.docs.domain.com"
        }
      ],
      "bugLink": "http://your.issues.page.com",
      "aggregateDataDefaultSize": 500,
      "modelVersion": 1
  },
   "ci": {
        "drpcHost": "http://bullet-ws.development.domain.com:4080",
        "schemaHost": "http://bullet-ws.development.domain.com:4080",
        "defaultFilter": "http://bullet-ws.development.domain.com:4080/custom-endpoint/api/defaultQuery"
      }
}
```

Your UI on CI host will POST to http://bullet-ws.development.domain.com:4080/bullet/api/drpc for UI created Bullet queries, GET the schema from http://bullet-ws.development.domain.com:4080/bullet/api/columns, populate an additional link on the Help dropdown pointing to http://data.docs.domain.com and will GET and cache a defaultFilter from http://bullet-ws.development.domain.com:4080/custom-endpoint/api/defaultQuery.

Code licensed under the Apache 2 license. See LICENSE file for terms.
