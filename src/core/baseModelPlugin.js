/* eslint-disable */

import CrudController from './crudController';

const BaseModelPlugin = (schema) => {
  schema.set('toJSON', { getters: true, virtuals: true });

  schema.statics.httpGet = function (req, res, options) {
    return CrudController(this).httpGet(req, res, options);
  };

  schema.statics.httpPost = function (req, res, options) {
    return CrudController(this).httpPost(req, res, options);
  };

  schema.statics.httpPut = function (req, res, options) {
    return CrudController(this).httpPut(req, res, options);
  };

  schema.statics.httpDelete = function (req, res, options) {
    return CrudController(this).httpDelete(req, res, options);
  };

  schema.statics.countItems = function (req, res, options) {
    return CrudController(this).count(req, res, options);
  };

  schema.statics.totalPages = function (req, res, options) {
    return CrudController(this).totalPage(req, res, options);
  };

  schema.statics.registerRouter = function (router, url) {
    const crud = CrudController(this);
    const { modelName } = this;
    router.route(`${url + modelName}/list`).get(crud.httpGet); // get all items
    router.route(`${url + modelName}/`).post(crud.httpPost); // Create new Item

    router.route(`${url + modelName}/:id`)
      .get(crud.httpGet) // Get Item by Id
      .put(crud.httpPut) // Update an Item with a given Id
      .delete(crud.httpDelete); // Delete and Item by Id
  };
};

export default BaseModelPlugin;
