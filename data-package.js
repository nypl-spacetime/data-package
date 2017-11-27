function generate (dataset, schemas, etlResults) {
  const id = dataset.id

  const dataSchema = Object.assign({}, schemas.objects.properties.data, dataset.fields)

  const objectsSchema = Object.assign({}, schemas.objects)
  objectsSchema.properties.data = dataSchema

  const resources = [{
    name: `${id}.zip`,
    format: 'zip',
    description: 'ZIP file containing all the files in this dataset',
    mediatype: 'application/zip',
    path: `${id}.zip`
  }, {
    name: 'dataset',
    format: 'json',
    description: 'NYC Space/Time Directory dataset descriptor',
    mediatype: 'application/json',
    path: `${id}.dataset.json`,
    schema: schemas.dataset
  }]

  if (etlResults.stats.objects) {
    resources.push({
      name: `${id}.objects`,
      format: 'ndjson',
      description: 'NDJSON file with all the objects in the dataset',
      mediatype: 'application/x-ndjson',
      path: `${id}.objects.ndjson`,
      schema: objectsSchema,
      stats: etlResults.stats.objects
    })
  }

  if (etlResults.stats.relations) {
    resources.push({
      name: `${id}.relations`,
      format: 'ndjson',
      description: 'NDJSON file with all the relations in the dataset',
      mediatype: 'application/x-ndjson',
      path: `${id}.relations.ndjson`,
      schema: schemas.relations,
      stats: etlResults.stats.relations
    })
  }

  if (etlResults.stats.logs) {
    resources.push({
      name: `${id}.logs`,
      format: 'ndjson',
      description: 'NDJSON file with log messages of issues encountered during ETL process',
      mediatype: 'application/x-ndjson',
      path: `${id}.logs.ndjson`,
      stats: etlResults.stats.logs
    })
  }

  if (etlResults.stats.objects && etlResults.stats.objects.geometries) {
    resources.push({
      name: `${id}.geojson`,
      format: 'geojson',
      description: `All objects from ${id}.objects.ndjson that have a geometry, converted to GeoJSON`,
      mediatype: 'application/json',
      path: `${id}.geojson`
    }, {
      name: `${id}.sample.geojson`,
      format: 'geojson',
      description: `Random sample of 100 Features from ${id}.geojson`,
      mediatype: 'application/json',
      path: `${id}.sample.geojson`
    })
  }

  const uri = `http://spacetime.nypl.org/#data-${id}`

  return {
    name: id,
    id: uri,
    created: etlResults.date,
    title: dataset.title,
    description: dataset.description,
    version: etlResults.version,
    homepage: dataset.homepage,
    resources,
    licenses: [{
      name: dataset.license
    }],
    sources: dataset.sources,
    contributors: dataset.contributors
  }
}

module.exports = {
  generate
}
