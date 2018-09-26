const momentTimezone = require('moment-timezone/data/meta/latest.json');
const GeoJSON = require('geojson');
const immutable = require('immutable');
const fs = require('fs-extra')
const path = require('path')

const DATA_DIR = path.join(__dirname, '../data');
const JSON_FILE = path.join(DATA_DIR, 'timezoneCities.json');

function generateTimezoneCities() {
  const timezoneList = immutable.fromJS(momentTimezone.zones).valueSeq().toArray().map(item => item.toJS())

  const geoJSON = GeoJSON.parse(timezoneList, {Point: ['lat', 'long']});

  fs.emptyDirSync(DATA_DIR)
  fs.writeJsonSync(JSON_FILE, geoJSON)
}

generateTimezoneCities();