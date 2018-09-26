const reduce = require('lodash/reduce');
const timespaceTimezone = require('@mapbox/timespace/lib/timezones.json');
const tilebelt = require('@mapbox/tilebelt');
const geojsonMerge = require('@mapbox/geojson-merge');
const fs = require('fs-extra')
const path = require('path')

const DATA_DIR = path.join(__dirname, '../data');
const JSON_FILE = path.join(DATA_DIR, 'TsTzGeo.json');


function generateTimespaceTimezone() {
  const tileGroupByTz = reduce(timespaceTimezone, (result, tz, tilePoint) => {
    if(result[tz]) {
      result[tz] = [...result[tz], tilePoint];
    } else {
      result[tz] = [tilePoint];
    }
    return result;
  }, {})

  const result = reduce(tileGroupByTz, (result, tiles, tz) => {
    // console.log(
    const a = tiles.map(tilePoint => {
      // console.log(tilePoint)
      const geometry = tilebelt.tileToGeoJSON(tilePoint.split('/'));
      geometry.properties = {
        timezone: tz,
      };
      return geometry;
    });
    // )
    result[tz] = geojsonMerge.merge(
      a
    )
    // console.log(a)
    // result[tz] = geojsonMerge.merge(
    //   tiles.map(tilePoint => tilebelt.tileToGeoJSON(tilePoint.split('/')))
    // )

    // result[tz] = {
    //   polygon: tiles.map(tilePoint => tilebelt.tileToGeoJSON(tilePoint.split('/')))
    // }


    // {
    //   polygon: [
    //     [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
    //   ],
    //   prop0: 'value0',
    //   prop1: {"this": "that"}
    // }

    // if(result[tz]) {
    //   result[tz] = [...result[tz], tilePoint];
    // } else {
    //   result[tz] = [tilePoint];
    // }
    return result;
  }, {})

  console.log(result);

  fs.emptyDirSync(DATA_DIR)
  fs.writeJsonSync(JSON_FILE, result)
  // tileGroupByTz
  // const tilePonewData = tileGroupByTz[selectTimezone]
  // tileToGeoJSON()
  // var mergedGeoJSON = ;
}

generateTimespaceTimezone()