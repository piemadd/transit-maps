const fs = require("fs");
const Jimp = require("jimp");

let shapes = {};
let routes = {};
let stops = {};
let allShapeIDs = [];

let geoJSONTemplate = {
  type: "FeatureCollection",
  features: [],
};

//console.log(fs.readFileSync('../'))

console.log("opening shapes file");
const shapesRaw = JSON.parse(
  fs.readFileSync("../google_transit_json/shapes.json", "utf8"),
  {
    columns: true,
    skip_empty_lines: true,
  }
);

console.log("opening routes file");
const routesRaw = JSON.parse(
  fs.readFileSync("../google_transit_json/routes.json", "utf8"),
  {
    columns: true,
    skip_empty_lines: true,
  }
);

console.log("opening trips file");
const tripsRaw = JSON.parse(
  fs.readFileSync("../google_transit_json/trips.json", "utf8"),
  {
    columns: true,
    skip_empty_lines: true,
  }
);

console.log("opening stops file");
const stopsRaw = JSON.parse(
  fs.readFileSync("../google_transit_json/stops.json", "utf8"),
  {
    columns: true,
    skip_empty_lines: true,
  }
);

console.log("establishing routes");
routesRaw.forEach((route) => {
  console.log(route.route_type, typeof route.route_type);
  if (route.route_type == "1") {
    routes[route.route_id] = route;
  }
});

const routesList = Object.keys(routes);

console.log("associating shapes");
tripsRaw.forEach((trip) => {
  if (routesList.includes(trip.route_id)) {
    routes[trip.route_id].trips = routes[trip.route_id].trips || [];
    if (!routes[trip.route_id].trips.includes(trip.trip_id)) {
      routes[trip.route_id].trips.push(trip.trip_id);
      allShapeIDs.push(trip.shape_id);
    }
  }
});

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

const findYCoordinateAlongLineGivenX = (x, x1, y1, x2, y2) => {
  const slope = (y2 - y1) / (x2 - x1);
  const y = slope * (x - x1) + y1;
  return y;
};

const findXCoordinateAlongLineGivenY = (y, x1, y1, x2, y2) => {
  const slope = (x2 - x1) / (y2 - y1);
  const x = slope * (y - y1) + x1;
  return x;
};

const filteredShapes = Object.keys(shapes).filter((shapeID) => {
  return allShapeIDs.includes(shapeID);
});

filteredShapes.forEach((shapeID, shapeIDIndex) => {
  const shape = shapes[shapeID];
  let shapePoints = [];

  if (shapeIDIndex == 0) {
    console.log(Object.values(shape))
  }

  Object.values(shape).forEach((point, i, arr) => {

    if (i == arr.length - 1) { return; }

    point.lat = Number(point.lat.toFixed(5));
    point.lon = Number(point.lon.toFixed(5));

    let nextPoint = arr[i + 1];
    nextPoint.lat = Number(nextPoint.lat.toFixed(5));
    nextPoint.lon = Number(nextPoint.lon.toFixed(5));

    let diffLat = Math.abs(nextPoint.lat - point.lat);
    let diffLon = Math.abs(nextPoint.lon - point.lon);

    if (diffLat > diffLon) {
      if (nextPoint.lat > point.lat) {
        for (let i = point.lat; i <= nextPoint.lat; i += 0.00001) {
          let x = findXCoordinateAlongLineGivenY(
            i,
            point.lat,
            point.lon,
            nextPoint.lat,
            nextPoint.lon
          );
          shapePoints.push([x, i]);
        }
      } else if (nextPoint.lat < point.lat) {
        for (let i = point.lat; i >= nextPoint.lat; i -= 0.00001) {
          let x = findXCoordinateAlongLineGivenY(
            i,
            point.lat,
            point.lon,
            nextPoint.lat,
            nextPoint.lon
          );
          shapePoints.push([x, i]);
        }
      }
    } else {
      if (nextPoint.lon > point.lon) {
        for (let i = point.lon; i <= nextPoint.lon; i += 0.00001) {
          let y = findYCoordinateAlongLineGivenX(
            i,
            point.lat,
            point.lon,
            nextPoint.lat,
            nextPoint.lon
          );
          shapePoints.push([i, y]);
        }
      } else if (nextPoint.lon < point.lon) {
        for (let i = point.lon; i >= nextPoint.lon; i -= 0.00001) {
          let y = findYCoordinateAlongLineGivenX(
            i,
            point.lat,
            point.lon,
            nextPoint.lat,
            nextPoint.lon
          );
          shapePoints.push([i, y]);
        }
      }
    }
  });

  if (shapeIDIndex == 0) {
    console.log(shapePoints)
  }
});

//map limits
let left = 180; //lower lat
let right = -180; //higher lat
let top = -90; //lower lon
let bottom = 90; //higher lon

/*
console.log("adding to geojson");
filteredShapes.forEach((shapeID, i, arr) => {
  const shape = shapes[shapeID];

  //if (!allShapeIDs.includes(shapeID)) { return; };

  geoJSONTemplate.features.push({
    type: "Feature",
    properties: {
      "stroke-width": 1,
      "stroke-opacity": 1,
      stroke: `hsl(${(i / arr.length) * 360} deg, 100%, 50%)`,
    },
    geometry: {
      coordinates: Object.values(shape).map((point) => {
        if (point.lat < left) {
          left = point.lat;
        }
        if (point.lat > right) {
          right = point.lat;
        }
        if (point.lon > top) {
          top = point.lon;
        }
        if (point.lon < bottom) {
          bottom = point.lon;
        }

        return [point.lon, point.lat];
      }),
      type: "LineString",
    },
  });
});

console.log("shapes processed");

console.log("putting onto image");

console.log(right.toFixed(5))
console.log(right.toFixed(5).split('.'))
console.log(right.toFixed(5).split('.').join(''))
console.log(Number(right.toFixed(5).split('.').join('')))

//sometimes i enjoy seeing god cry
const width = Math.abs(Number(right.toFixed(5).split('.').join('')) - Number(left.toFixed(5).split('.').join('')));
const height = Math.abs(Number(bottom.toFixed(5).split('.').join('')) - Number(top.toFixed(5).split('.').join('')));

console.log(width, height)

new Jimp(width, height, 0x00000000, (err, image) => {
  if (err) throw err;
  console.log("image created");
  
  console.log('adding points to image')

  filteredShapes.forEach((shapeID) => {
    const shape = shapes[shapeID];

    Object.values(shape).forEach((point, index, arr) => {
      const x = Math.abs(Number(point.lat.toFixed(5).split('.').join('')) - Number(left.toFixed(5).split('.').join('')));
      const y = Math.abs(Number(point.lon.toFixed(5).split('.').join('')) - Number(bottom.toFixed(5).split('.').join('')));

      if (index < arr.length - 1) {
        const nextPoint = arr[index + 1];
        const nextX = Math.abs(Number(nextPoint.lat.toFixed(5).split('.').join('')) - Number(left.toFixed(5).split('.').join('')));
        const nextY = Math.abs(Number(nextPoint.lon.toFixed(5).split('.').join('')) - Number(bottom.toFixed(5).split('.').join('')));

        for (let i = x; i < nextX; i++) {
          
        }
      }

      image.setPixelColor(0xffffffff, x, y);
    });
  });
});

//fs.writeFileSync("./shapes.json", JSON.stringify(geoJSONTemplate, null, 2));
*/