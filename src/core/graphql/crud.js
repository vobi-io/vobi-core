/* eslint-disable */

const camelCase = require('lodash/camelCase');
const {
  composeWithMongoose,
} = require('graphql-compose-mongoose/node8');

const prepareCrudModel = ({ Model, name }) => {
  const nameNormalized = name
      || camelCase(Model.modelName);
  const ModelTC = composeWithMongoose(Model);

  const queries = {
    [`${nameNormalized}ById`]: ModelTC
      .getResolver('findById'),
    [`${nameNormalized}ByIds`]: ModelTC
      .getResolver('findByIds'),
    [`${nameNormalized}One`]: ModelTC
      .getResolver('findOne'),
    [`${nameNormalized}Many`]: ModelTC
      .getResolver('findMany'),
    [`${nameNormalized}Count`]: ModelTC
      .getResolver('count'),
    [`${nameNormalized}Connection`]: ModelTC
      .getResolver('connection'),
    [`${nameNormalized}Pagination`]: ModelTC
      .getResolver('pagination'),
  };

  const mutations = {
    [`${nameNormalized}Create`]: ModelTC
      .getResolver('createOne'),
    [`${nameNormalized}UpdateById`]: ModelTC
      .getResolver('updateById'),
    [`${nameNormalized}UpdateOne`]: ModelTC
      .getResolver('updateOne'),
    [`${nameNormalized}UpdateMany`]: ModelTC
      .getResolver('updateMany'),

    [`${nameNormalized}RemoveById`]: ModelTC
      .getResolver('removeById'),
    [`${nameNormalized}RemoveOne`]: ModelTC
      .getResolver('removeOne'),
    [`${nameNormalized}RemoveMany`]: ModelTC
      .getResolver('removeMany'),
  };

  return {
    queries,
    mutations,
    ModelTC,
  };
};

module.exports = {
  prepareCrudModel,
};
