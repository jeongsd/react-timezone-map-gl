mkdir temp

# Download timezone data from naturalearthdata
# curl -L https://github.com/nvkelso/natural-earth-vector/raw/master/10m_cultural/ne_10m_time_zones.shp -o temp/ne_10m_time_zones.shp;
wget -nc -P ./temp -i scripts/fetchList.txt 
mapshaper temp/ne_10m_time_zones.shp -simplify dp keep-shapes 3% -o format=topojson temp/natural-earth-data.json
# mapshaper temp/ne_10m_time_zones.shp -simplify dp keep-shapes 3% -o format=topojson temp/natural-earth-data.json
# mapshaper temp/ne_10m_time_zones.shp -simplify dp keep-shapes 3% -o temp/natural-earth-data2.json

# Download timezone data from timezone-boundary-builder
wget https://github.com/evansiroky/timezone-boundary-builder/releases/download/2017a/timezones.shapefile.zip -nc -O temp/timezone-boundary-builder.zip;
unzip -n temp/timezone-boundary-builder.zip -d temp;
mapshaper temp/dist/combined_shapefile.shp -simplify dp keep-shapes 0.2% -o format=topojson temp/timezone-boundary-builder.json
# mapshaper temp/dist/combined_shapefile.shp -simplify dp keep-shapes 0.3% -o format=topojson temp/timezone-boundary-builder.json

# Merge naturalearthdata, timezone-boundary-builder
node ./scripts/mergeTopoJSON.js

# rm -rf temp