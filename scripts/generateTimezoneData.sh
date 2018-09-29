mkdir temp
mkdir data

# Download timezone data from naturalearthdata
curl -L https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_time_zones.zip -o temp/tz_world_mp.zip;
unzip temp/tz_world_mp.zip -d temp;
mapshaper temp/ne_10m_time_zones.shp -simplify dp keep-shapes 5% -o format=topojson temp/natural-earth-data.json

# Download timezone data from timezone-boundary-builder
curl -L https://github.com/evansiroky/timezone-boundary-builder/releases/download/2017a/timezones.shapefile.zip -o temp/timezone-boundary-builder.zip;
unzip temp/timezone-boundary-builder.zip -d temp;
mapshaper temp/dist/combined_shapefile.shp -simplify dp keep-shapes 0.3% -o format=topojson temp/timezone-boundary-builder.json

# Merge naturalearthdata, timezone-boundary-builder
node ./scripts/mergeTopoJSON.js

rm -rf temp
