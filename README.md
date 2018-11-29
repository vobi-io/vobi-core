# Vobi-core

Basic CRUD operations module for RESTful api and GraphQL based on MongoDB (Mongoose) 

### Install
Install vobi-core

```
npm install -g vobi-cli
```

### Usage
import plugin

```js
let { BaseModelPlugin } = require('vobi-core')
```

Inject to mongoose schema

```js
var schema = new Schema({
  ...
})

// Inject BaseModelPlugin to mongoose schema
schema.plugin(BaseModelPlugin)
```