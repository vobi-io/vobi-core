'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crudController = require('./crudController');

var _crudController2 = _interopRequireDefault(_crudController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseModelPlugin = function BaseModelPlugin(schema) {
  schema.set('toJSON', { getters: true, virtuals: true });

  schema.statics.httpGet = function (req, res, options) {
    return (0, _crudController2.default)(this).httpGet(req, res, options);
  };

  schema.statics.httpPost = function (req, res, options) {
    return (0, _crudController2.default)(this).httpPost(req, res, options);
  };

  schema.statics.httpPut = function (req, res, options) {
    return (0, _crudController2.default)(this).httpPut(req, res, options);
  };

  schema.statics.httpDelete = function (req, res, options) {
    return (0, _crudController2.default)(this).httpDelete(req, res, options);
  };

  schema.statics.countItems = function (req, res, options) {
    return (0, _crudController2.default)(this).count(req, res, options);
  };

  schema.statics.totalPages = function (req, res, options) {
    return (0, _crudController2.default)(this).totalPage(req, res, options);
  };

  schema.statics.registerRouter = function (router, url) {
    var crud = (0, _crudController2.default)(this);
    var modelName = this.modelName;

    router.route(url + modelName + '/list').get(crud.httpGet); // get all items
    router.route(url + modelName + '/').post(crud.httpPost); // Create new Item

    router.route(url + modelName + '/:id').get(crud.httpGet) // Get Item by Id
    .put(crud.httpPut) // Update an Item with a given Id
    .delete(crud.httpDelete); // Delete and Item by Id
  };
}; /* eslint-disable */

exports.default = BaseModelPlugin;