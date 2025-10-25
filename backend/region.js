import { point, pointToPolygonDistance, polygon } from "@turf/turf";
import fs from 'fs';

const polygonData = fs.readFileSync('./backend/OSU_MAP_FINAL.json', 'utf8');
let polygonJSON = JSON.parse(polygonData);
let features = polygonJSON.features;
const polygons = {};

for (var i = 0; i < features.length; i++) {
    let name = features[i].properties.Name;
    polygons[name] = polygon(features[i].geometry.coordinates);
}

function getRegion(latitude, longitude) {
    let closestRegion = "None";
    let minDistance = 1000000;

    for (const region in polygons) {
        let dist = pointToPolygonDistance(
            point([longitude, latitude]),
            polygons[region],
            "meters",
            "planar"
        );
        console.log(minDistance);
        if (dist < minDistance) {
            minDistance = dist;
            closestRegion = region;
        }
    }

    return closestRegion;
}
console.log(polygons)
console.log(getRegion(39.9931, -83.0200));