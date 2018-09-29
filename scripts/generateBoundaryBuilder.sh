mkdir temp
mkdir data

curl -L https://github.com/evansiroky/timezone-boundary-builder/releases/download/2017a/timezones.shapefile.zip -o temp/timezone-boundary-builder.zip;
unzip temp/timezone-boundary-builder.zip -d temp;

mapshaper temp/dist/combined_shapefile.shp -simplify dp keep-shapes 0.3% -o format=topojson data/timezone-boundary-builder.json

rm -rf temp
