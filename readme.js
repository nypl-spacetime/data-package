const BASE_DATA_URL = 'http://s3.amazonaws.com/spacetime-nypl-org/'

function link (url, text) {
  if (!url) {
    return text
  }

  if (!text) {
    text = url
  }

  return `<a href="${url}">${text}</a>`
}

function getDetails (dataset, etlResults) {
  return [
    ['ID', `<code>${dataset.id}</code>`],
    ['Title', dataset.title],
    ['Description', dataset.description],
    ['License', dataset.license],
    ['Homepage', dataset.homepage && link(dataset.homepage)],
    ['Sources', dataset.sources && dataset.sources.map((source) => link(source.path, source.title)).join('<br />\n')],
    ['Contributors', dataset.contributors && dataset.contributors.map((contributor) => contributor.title).join(', ')],
    ['ETL module', `<a href="https://github.com/nypl-spacetime/etl-${dataset.id}">https://github.com/nypl-spacetime/etl-${dataset.id}</a>`],
    ['Download', link(`${BASE_DATA_URL}datasets/${dataset.id}/${dataset.id}.zip`, 'ZIP file')]
  ]
}

const readme = (dataset, etlResults) => `
  # ${dataset.title}

  Dataset from NYPL’s [NYC Space/Time Directory](http://spacetime.nypl.org).

  - [Download this dataset as a ZIP file](${BASE_DATA_URL}${dataset.id}/${dataset.id}.zip)
  - [Data Package](${BASE_DATA_URL}${dataset.id}/datapackage.json)
  - [View dataset on homepage of NYC Space/Time Directory](http://spacetime.nypl.org/#data-${dataset.id})

  ## Details

  <table>
    <tbody>
    ${getDetails(dataset, etlResults)
      .filter((row) => row[1])
      .map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`)
      .join('\n')}
    </tbody>
  </table>
`

function generate (dataset, etlResults) {
  return readme(dataset, etlResults)
    .split('\n')
    .map((line) => line.trim())
    .join('\n').trim()
}

module.exports = {
  generate
}
