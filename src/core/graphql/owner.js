/* eslint-disable */

const R = require('ramda');
const {
  attachTo,
} = require('./utils');

const CREATOR_FIELD_NAME = 'creator';
const CREATED_ON_FIELD_NAME = 'createdOn';
const MODIFIER_FIELD_NAME = 'modifier';
const MODIFIED_ON_FIELD_NAME = 'modifiedOn';

/**
 * Attaches changes trackers
 */
const setModifiersWrapper = ({ userProp, dateProp }) => next => (rp) => {
  if (!rp.context.user) {
    throw new Error('No user!!!');
  }

  rp.args.record[userProp] = rp.context.user;
  rp.args.record[dateProp] = new Date();

  return next(rp);
};

/**
 *
 */
const setCreatorWrapper = setModifiersWrapper({
  userProp: CREATOR_FIELD_NAME,
  dateProp: CREATED_ON_FIELD_NAME,
});

/**
 *
 */
const setModifierWrapper = setModifiersWrapper({
  userProp: MODIFIER_FIELD_NAME,
  dateProp: MODIFIED_ON_FIELD_NAME,
});

/**
 * Attaches filters by owner
 */
const filterByUser = ({ userProp }) => next => (rp) => {
  const {
    user,
  } = rp.context;
  rp.args.filter = rp.args.filter || {};
  rp.args.filter[userProp] = user._id;

  return next(rp);
};

/**
 *
 */
const filterByCreator = filterByUser({
  userProp: CREATOR_FIELD_NAME,
});

/**
 *
 */
const removeOwnerFields = (ModelTC) => {
  ModelTC.removeField(CREATOR_FIELD_NAME);
  ModelTC.removeField(CREATED_ON_FIELD_NAME);
  ModelTC.removeField(MODIFIER_FIELD_NAME);
  ModelTC.removeField(MODIFIED_ON_FIELD_NAME);
};

/**
 *
 */
const attachOwner = (resolvers) => {
  const isQuery = R.propEq('kind', 'query');
  const isMutation = R.propEq('kind', 'mutation');
  const isUpdateMutation = R.allPass([
    isMutation,
    res => R.contains(
      R.prop('name', res),
      ['updateById', 'updateOne', 'updateMany'],
    ),
  ]);
  const isCreateMutation = R.allPass([
    isMutation,
    R.propEq('name', 'createOne'),
  ]);
  const attachFilterByCreator = resolver => ((
    isQuery(resolver)
        || isUpdateMutation(resolver)
  )
    ? attachTo(filterByCreator)(resolver)
    : resolver);
  const attachSetCreator = resolver => (isCreateMutation(resolver)
    ? attachTo(setCreatorWrapper)(resolver)
    : resolver);
  const attachSetModifier = resolver => (isUpdateMutation(resolver)
    ? attachTo(setModifierWrapper)(resolver)
    : resolver);
  const attachAll = R.pipe(
    attachFilterByCreator,
    attachSetCreator,
    attachSetModifier,
  );

  return Object
    .keys(resolvers)
    .reduce(
      (res, name) => {
        res[name] = attachAll(resolvers[name]);

        return res;
      },
      {},
    );
};

module.exports = {
  CREATOR_FIELD_NAME,
  CREATED_ON_FIELD_NAME,
  MODIFIER_FIELD_NAME,
  MODIFIED_ON_FIELD_NAME,
  setCreatorWrapper,
  setModifierWrapper,
  filterByCreator,
  removeOwnerFields,
  attachOwner,
};
