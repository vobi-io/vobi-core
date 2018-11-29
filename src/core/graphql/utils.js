/* eslint-disable */

const _ = require('lodash');

/**
 *
 */
const attachTo = resolver => query => query.wrapResolve(resolver);

/**
 *
 */
const attachToAll = resolver => (queries) => {
  const attachResolver = attachTo(resolver);

  return Object
    .keys(queries)
    .reduce(
      (result, name) => {
        result[name] = attachResolver(queries[name]);
        return result;
      },
      {},
    );
};

/**
 *
 */
const arrayfy = src => (Array.isArray(src)
  ? src
  : [src]);

/**
 *
 */
const defaultActionParams = [
  'args',
  'context.user',
];

/**
 *
 */
const extractArgs = (obj, props) => _.reduce(
  props,
  (o, p) => _.set(
    o,
    _.last(_.toPath(p)),
    _.get(obj, p),
  ),
  {},
);

/**
 *
 */
const promiseToPreResolver = (actions, params = defaultActionParams) => next => (rp) => {
  const args = extractArgs(rp, params);

  return Promise
    .all(
      arrayfy(
        actions,
      ).map(pre => pre(args)),
    )
    .then(() => next(rp));
};

/**
 *
 */
const promiseToPostResolver = (actions, params = defaultActionParams) => next => async (rp) => {
  const newRP = await next(rp);
  const args = extractArgs(rp, params);

  return Promise
    .all(
      arrayfy(
        actions,
      ).map(pre => pre(args, newRP)),
    )
    .then(() => newRP);
};

/**
 *
 */
const chainToResolver = (chain) => {
  /**
     * to maintain correct order of execution
     * 1. need to find resolver obj in chain
     *    1.1. if no resolver, then throw error,
     *          cause no 'wrapResolve' method to call
     * 2. assume that items before resolver are all pre's
     *    2.1. pre resolvers should be wrapped in reverse order
     * 3. assume that items after resolver are all post's
     *    3.1. post resolvers should be wrapped in order
     *          they've been passed
     */
  const resolverIndex = chain
    .findIndex(
      item => 'wrapResolve' in item,
    );
  if (resolverIndex === -1) {
    throw new Error(
      'chain should contain a resolver to call \'wrapResolve\'',
    );
  }

  const sorted = [
    // put resolver first
    chain[resolverIndex],
    // then goes pre's in reverse
    ...chain
      .slice(
        0,
        resolverIndex,
      )
      .reverse(),
    // lastly post's
    ...chain
      .slice(
        resolverIndex + 1,
        chain.length,
      ),
  ];

  return sorted
    .reduce(
      (result, current) => attachTo(current)(result),
      sorted.shift(),
    );
};

module.exports = {
  attachTo,
  attachToAll,
  promiseToPreResolver,
  promiseToPostResolver,
  chainToResolver,
};
