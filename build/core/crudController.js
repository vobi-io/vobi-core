'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* eslint-disable */

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Crud = function Crud(Model) {
  var schemaQuery = {};
  // if (Model.schema.options.query) {
  //   schemaQuery = Model.schema.options.query
  // }

  /**
   * Get all items by filter or one item by id
   * @param req
   * @param res
   */
  function httpGet(req, res) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (req.params.id !== undefined) {
      return findById(req, res, options);
    }
    return list(req, res, options);
  }

  /**
   * Get Count by filter
   * @param req
   * @param res
   */
  function count(req, res) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var requestQuery = req.query;

    var query = Model.find();

    query.where(getWhere(requestQuery, options));

    query.count().then(function (count) {
      return res.ok({ count: count });
    }).catch(function (err) {
      return res.serverError(err);
    });
  }

  /**
   * Get Total Page by filter
   * @param req
   * @param res
   */
  function totalPage(req, res) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var requestQuery = req.query;

    var query = Model.find();

    var pageSize = getPageSize(requestQuery, options);

    query.where(getWhere(requestQuery, options));

    query.count().then(function (count) {
      var totalPage = 1;
      if (pageSize) {
        totalPage = Math.ceil(count / pageSize);
      }
      return res.ok(totalPage);
    }).catch(function (err) {
      return res.serverError(err);
    });
  }

  /**
   * Create new Item
   * @param req
   * @param res
   */
  function httpPost(req, res) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    removeReadOnlyFieldFromBody(req);
    var item = new Model(req.body);

    for (var key in req.files) {
      item[key] = req.files[key].name;
    }

    if (req.user) {
      item.owner = req.user._id;
    }
    item.save().then(function (item) {
      if (options.succussPromises && options.succussPromises.length > 0) {
        options.succussPromises.map(function (func) {
          return func(item);
        });
      }
      return res.created(item);
    }).catch(function (err) {
      if (err.name === 'ValidationError') {
        return res.badRequest(err.errors);
      }
      return res.badRequest(err);
    });
  }

  /**
   *  Update an Item with a given Id
   * @param req
   * @param res
   */
  function httpPut(req, res) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var checkPermission = options.permission || function () {
      return true;
    };
    var oldItem = {};
    removeReadOnlyFieldFromBody(req);
    if (!req.params.id) {
      return res.badRequest('id is undefined');
    }
    Model.findById(req.params.id).then(function (item) {
      if (!item) {
        throw new Error('Item not found!');
      }
      oldItem = item.toJSON();
      var result = checkPermission(item, req.user, res);
      if (typeof result !== 'boolean') {
        throw new Error('Permission Error');
      }

      item.set(req.body);

      for (var key in req.files) {
        item[key] = req.files[key].name;
      }

      if (req.user) {
        item.modifierUser = req.user._id;
      }

      return item.save();
    }).then(function (item) {
      if (options.succussPromises && options.succussPromises.length > 0) {
        options.succussPromises.map(function (func) {
          return func(item, oldItem);
        });
      }
      return res.ok(item);
    }).catch(function (err) {
      if (err.message === 'Permission Error') {
        return;
      }
      if (err.name === 'ValidationError') {
        return res.badRequest(err.errors);
      }

      if (err.message === 'Item not found!') {
        return res.notFound('Item not found!');
      }

      return res.badRequest(err);
    });
  }

  /**
   * Get all items by filter
   * @param req
   * @param res
   */
  function list(req, res) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var requestQuery = req.query;

    var query = Model.find();

    var pageSize = parseInt(getPageSize(requestQuery, options));
    if (pageSize) {
      var page = parseInt(requestQuery.page === '{page}' ? 1 : requestQuery.page);
      var skip = (page - 1) * pageSize;
      if (skip > 0) {
        query.skip((page - 1) * pageSize);
      }
      query.limit(pageSize);
    } else {
      var _skip = parseInt(getSkip(requestQuery, options));
      if (_skip) {
        query.skip(_skip);
      }

      var limit = parseInt(getLimit(requestQuery, options));
      if (limit) {
        query.limit(limit);
      }
    }

    query.where(getWhere(requestQuery, options));

    var select = getSelect(requestQuery, options);
    if (select) {
      query.select(select);
    }

    if (options.sort) {
      query.sort(options.sort);
    } else if (requestQuery.sort !== undefined && requestQuery.sort !== '{sort}') {
      query.sort(requestQuery.sort);
    }

    if (options.populate) {
      for (var i = 0; i < options.populate.length; i++) {
        query.populate(options.populate[i]);
      }
    }

    if (schemaQuery.populate) {
      for (var j = 0; j < schemaQuery.populate.length; j++) {
        query.populate(schemaQuery.populate[j]);
      }
    }

    if (requestQuery.populate && requestQuery.populate !== '{populate}') {
      var _list = requestQuery.populate;
      if (typeof requestQuery.populate === 'string') {
        _list = requestQuery.populate.split(',').map(String);
      }
      for (var l = 0; l < _list.length; l++) {
        query.populate(_list[l]);
      }
    }

    if (requestQuery.distinct) {
      query.distinct(requestQuery.distinct);
    }

    var promises = [query.exec()];

    if (requestQuery.count) {
      var queryCount = Model.count();
      queryCount.where(getWhere(requestQuery, options));
      promises.push(queryCount);
    }

    return Promise.all(promises).then(function (result) {
      var response = {
        items: result[0]
      };
      if (result.length > 1) {
        response.totalCount = result[1];
      }
      if (options.promise) {
        return Promise.resolve(response);
      }
      return res.ok(response);
    }).catch(function (err) {
      return res.serverError(err);
    });
  }

  /**
   * Delete and Item by Id
   * @param req
   * @param res
   */
  function httpDelete(req, res) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var checkPermission = options.permission || function () {
      return true;
    };
    if (!req.params.id) {
      return res.badRequest('id is undefined');
    }

    Model.findById(req.params.id).then(function (item) {
      if (!item) {
        return res.notFound('Item not found');
      }

      var result = checkPermission(item, req, res);
      if (typeof result !== 'boolean') {
        throw new Error('Permission Error');
      }

      return item.remove();
    }).then(function () {
      return res.ok('Deleted');
    }).catch(function (err) {
      if (err.message === 'Permission Error') {
        return;
      }
      return res.badRequest(err);
    });
  }

  /**
   * get limit by priority (schemaQuery.limit, options.limit, request.limit)
   * @param requestQuery
   * @param options
   * @returns {int}
   */
  function getLimit(requestQuery) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var limit = null;
    if (schemaQuery.limit) {
      limit = schemaQuery.limit;
    }

    if (options.limit && !isNaN(options.limit)) {
      if (!limit || options.limit < limit) {
        limit = options.limit;
      }
    }

    if (requestQuery.limit && !isNaN(requestQuery.limit)) {
      if (!limit || requestQuery.limit < limit) {
        limit = requestQuery.limit;
      }
    }
    return limit;
  }

  /**
   * get skip by priority (schemaQuery.skip, options.skip, request.skip)
   * @param requestQuery
   * @param options
   * @returns {int}
   */
  function getSkip(requestQuery) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var skip = null;
    if (schemaQuery.skip) {
      skip = schemaQuery.skip;
    }

    if (options.skip && !isNaN(options.skip)) {
      if (!skip || options.skip < skip) {
        skip = options.skip;
      }
    }

    if (requestQuery.skip && !isNaN(requestQuery.skip) && requestQuery.skip !== '{skip}') {
      if (!skip || requestQuery.skip < skip) {
        skip = requestQuery.skip;
      }
    }
    return skip;
  }

  /**
   * get skip by priority (schemaQuery.pageSize, options.pageSize, request.pageSize)
   * @param requestQuery
   * @param options
   * @returns {int}
   */
  function getPageSize(requestQuery) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var pageSize = null;
    if (schemaQuery.pageSize) {
      pageSize = schemaQuery.pageSize;
    }
    if (options.pageSize) {
      pageSize = options.pageSize;
    }
    if (requestQuery.pageSize && requestQuery.pageSize !== '{pageSize}') {
      pageSize = requestQuery.pageSize;
    }

    // if (options.pageSize && !isNaN(options.pageSize)) {
    //   if (!pageSize || options.pageSize < pageSize) {
    //     pageSize = options.pageSize
    //   }
    // }
    // if (requestQuery.pageSize && !isNaN(requestQuery.pageSize)) {
    //   if (!pageSize || requestQuery.pageSize < pageSize) {
    //     pageSize = requestQuery.pageSize
    //   }
    // }
    return pageSize;
  }

  /**
   * get skip by priority (schemaQuery.where, options.where, request.where)
   * @param requestQuery
   * @param options
   * @returns {int}
   */
  function getWhere(requestQuery) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var where = {};

    if (requestQuery.where !== undefined && requestQuery.where !== '{where}') {
      if (_typeof(requestQuery.where) === 'object') {
        where = requestQuery.where;
      } else {
        where = JSON.parse(requestQuery.where);
      }
    }

    if (schemaQuery.where) {
      where = _lodash2.default.merge(where, schemaQuery.where);
    }

    if (options.where) {
      if (options.whereMergeByAnd) {
        where = { $and: [options.where, where] };
      } else {
        where = _lodash2.default.merge(where, options.where);
      }
    }

    return where;
  }

  /**
   * get skip by priority (schemaQuery.select, options.select, request.select)
   * @param requestQuery
   * @param options
   * @returns {int}
   */
  function getSelect(requestQuery) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var select = null;
    if (options.select) {
      select = options.select;
    }

    if (requestQuery.select !== undefined && requestQuery.select !== '{select}') {
      if (select != null) {
        var result = _lodash2.default.intersectionWith(select.split(' '), requestQuery.select.split(' '), _lodash2.default.isEqual);
        select = result.join(' ');
      } else {
        select = requestQuery.select;
      }
    }

    if (select === '' && options.select) {
      select = options.select;
    }

    if (schemaQuery.select) {
      if (select != null) {
        var equal = _lodash2.default.intersectionWith(select.split(' '), schemaQuery.select.split(' '), _lodash2.default.isEqual);
        select = equal.join(' ');
      } else {
        select = schemaQuery.select;
      }
    }

    if (select === '' && schemaQuery.select) {
      select = schemaQuery.select;
    }

    // TODO if contains , then replave commas
    return select;
  }

  /**
   * Get Item by Id
   * @param req
   * @param res
   */
  function findById(req, res) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var requestQuery = req.query;
    var select = getSelect(requestQuery, options);
    var where = {
      _id: req.params.id
    };

    if (options.where) {
      where = _lodash2.default.merge(where, options.where);
    }

    var query = Model.findOne(where, select);
    if (options.populate) {
      for (var i = 0; i < options.populate.length; i++) {
        query.populate(options.populate[i]);
      }
    }

    if (schemaQuery.populate) {
      for (var j = 0; j < schemaQuery.populate.length; j++) {
        query.populate(schemaQuery.populate[j]);
      }
    }

    if (requestQuery.populate && requestQuery.populate !== '{populate}') {
      var _list2 = requestQuery.populate;
      if (typeof requestQuery.populate === 'string') {
        _list2 = requestQuery.populate.split(',').map(String);
      }
      for (var l = 0; l < _list2.length; l++) {
        query.populate(_list2[l]);
      }
    }

    query.exec().then(function (item) {
      if (!item) {
        return res.notFound();
      }
      return res.ok(item);
    }).catch(function (err) {
      return res.badRequest(err);
    });
  }

  function removeReadOnlyFieldFromBody(req) {
    delete req.body.owner;
    delete req.body.modifierUser;
    delete req.body.created;
    delete req.body.modified;
  }

  return {
    httpGet: httpGet,
    httpPost: httpPost,
    httpPut: httpPut,
    httpDelete: httpDelete,
    count: count,
    totalPage: totalPage
  };
};

exports.default = Crud;