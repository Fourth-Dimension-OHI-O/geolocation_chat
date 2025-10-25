import { point, pointToPolygonDistance, polygon } from "@turf/turf";
import fs from 'fs';

const polygonData = fs.readFileSync('./backend/OSU_MAP_FINAL.json', 'utf8');
const polygonJSON = JSON.parse(polygonData);
const features = polygonJSON.features;
let polygons = {};

for (var i = 0; i < features.length; i++) {
    let name = features[i].properties.Name;
    polygons[name] = polygon(features[i].geometry.coordinates);
}

export const regionNames = Object.entries(polygons).map(kv => kv[0]);

export function getRegion(latitude, longitude) {
    let closestRegion = "None";
    let minDistance = 1000000;

    for (const region in polygons) {
        let dist = pointToPolygonDistance(
            point([longitude, latitude]),
            polygons[region],
            { units: 'meters' },
            "planar"
        );

        if (dist < minDistance) {
            minDistance = dist;
            closestRegion = region;
        }
    }

    if (minDistance > 200) {
        return "Off Campus"
    }
    return closestRegion;
}
