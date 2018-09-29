mkdir temp
mkdir data

curl -L https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_time_zones.zip -o temp/tz_world_mp.zip;
unzip temp/tz_world_mp.zip -d temp;

mapshaper temp/ne_10m_time_zones.shp -simplify dp keep-shapes 5% -o format=topojson data/neTimezone.json

rm -rf temp
