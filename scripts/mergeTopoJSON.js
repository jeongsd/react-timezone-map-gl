const jsonfile = require('jsonfile')
const NE_JSON = require('../temp/natural-earth-data.json')
const TBB_JSON = require('../temp/timezone-boundary-builder.json')
const path = require('path')

const TIMEZONE_TOPO_PATH = path.join(
  __dirname,
  '../src/data',
  'timezoneTopo.json'
)

function mergeTopoJSON() {
  const obj = {
    naturalEarth: NE_JSON,
    timezoneBoundaryBuilder: TBB_JSON
  }
  jsonfile.writeFile(TIMEZONE_TOPO_PATH, obj, function (err) {
    if (err) console.error(err)
    console.log('Merge natural-earth-data.json, timezone-boundary-builder.json')
  })
}

mergeTopoJSON()
