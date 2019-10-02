const fs = require('fs')
const path = require('path')

export const collectModulePaths = (pathPattern) => {
  try {
    const glob = require('glob')
    return glob.sync(pathPattern)
  } catch (e) {
    console.log('error', e)
  }
}

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getModuleName = (modulePath) => {
  const modulePathArr = modulePath.split('/')
  return capitalize(modulePathArr[modulePathArr.length - 1])
}

export const modelsFromModule = (modulePath, models) => {
  try {
    const moduleName = getModuleName(modulePath).toLowerCase()
    const defaultModelPath = `${modulePath}/${moduleName}.js`
    if (fs.existsSync(defaultModelPath)) {
      const model = require(defaultModelPath)
      models.set(model.modelName, model)
    }
    if (fs.existsSync(`${modulePath}/models`)) {
      const glob = require('glob')
      const pathPattern = path.resolve(`${modulePath}/models/*`)
      const modelPaths = glob.sync(pathPattern)
      modelPaths.forEach(modelPath => {
        const model = require(modelPath)
        models.set(model.modelName, model)
      })
    }
  } catch (e) {
    console.log('error in modelsFromModule: ', e)
  }
}

export const modelsFromModules = (pathPattern) => {
  try {
    const modulePaths = collectModulePaths(pathPattern)
    const models = new Map()
    modulePaths.forEach(modulePath => {
      modelsFromModule(modulePath, models)
    })
    return [...models.values()]
  } catch (e) {
    console.log('error trying to collect models', e)
  }
}
