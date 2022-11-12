const fs = require("fs");

let shapes = {};
let routes = {};

let geoJSONTemplate = {
  type: "FeatureCollection",
  features: [],
};

//console.log(fs.readFileSync('../'))

console.log("opening file");
const shapesRaw = JSON.parse(
  fs.readFileSync("../google_transit_json/shapes.json", "utf8"),
  {
    columns: true,
    skip_empty_lines: true,
  }
);

console.log("file parsed");
console.log("processing points");

shapesRaw.forEach((point) => {
  const shapeID = Number(point.shape_id);
  const lat = Number(point.shape_pt_lat);
  const lon = Number(point.shape_pt_lon);
  const sequence = Number(point.shape_pt_sequence);
  const distTraveled = Number(point.shape_dist_traveled);

  if (!shapes[shapeID]) {
    shapes[shapeID] = {};
  }

  shapes[shapeID][sequence] = {
    lat,
    lon,
    distTraveled,
  };
});

console.log("points processed");
console.log("processing shapes");

Object.values(shapes).forEach((shape) => {
  geoJSONTemplate.features.push({
    type: "Feature",
    properties: {},
    geometry: {
      coordinates: Object.values(shape).map((point) => [point.lon, point.lat]),
      type: "LineString",
    },
  });
});

console.log("shapes processed");

fs.writeFileSync("./shapes.json", JSON.stringify(geoJSONTemplate, null, 2));
