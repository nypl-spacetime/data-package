#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const config = require('spacetime-config')
const schemas = require('spacetime-schemas')

const generators = {
  dataPackage: require('./data-package'),
  readme: require('./readme')
}

const STATUS_FILENAME = 'etl-results.json'
const DATAPACKAGE_FILENAME = 'datapackage.json'
const README_FILENAME = 'README.md'

const baseDir = config.etl.outputDir

function getDatasetDir (datasetId, step) {
  return path.join(baseDir, step, datasetId)
}

function createDataPackage (datasetId, step) {
  if (!datasetId) {
    throw new Error('Dataset ID not set')
  }

  if (!step) {
    throw new Error('Step not set')
  }

  const datasetDir = getDatasetDir(datasetId, step)

  if (!fs.existsSync(datasetDir)) {
    throw new Error(`Directory does not exist: ${datasetDir}`)
  }

  const dataset = require(path.join(datasetDir, `${datasetId}.dataset.json`))
  const etlResults = require(path.join(datasetDir, STATUS_FILENAME))

  const readme = generators.readme.generate(dataset, etlResults)
  const dataPackage = generators.dataPackage.generate(dataset, schemas, etlResults)

  return {
    readme,
    dataPackage
  }
}

if (require.main === module) {
  if (process.argv.length !== 3) {
    console.error('Please supply dataset ID and step as command line arguments, in form `datasetId.step`')
    process.exit(1)
  }

  const datasetStep = process.argv[2]
  const [datasetId, step] = datasetStep.split('.')

  let results
  try {
    results = createDataPackage(datasetId, step)
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }

  const datasetDir = getDatasetDir(datasetId, step)
  const readmeFilename = path.join(datasetDir, README_FILENAME)
  const dataPackageFilename = path.join(datasetDir, DATAPACKAGE_FILENAME)

  fs.writeFileSync(readmeFilename, results.readme + '\n')
  fs.writeFileSync(dataPackageFilename, JSON.stringify(results.dataPackage, null, 2) + '\n')

  console.log(`Data Package created in directory ${datasetDir}`)
  console.log('')
  console.log('Files:')
  console.log(`  - ${dataPackageFilename}`)
  console.log(`  - ${readmeFilename}`)
}

module.exports = createDataPackage
