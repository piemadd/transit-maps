var map = L.map('map').setView([41.881893255823435, -87.6299864250765], 13);

L.tileLayer('https://map.amtrakle.com/{z}/{x}/{y}.png', {
  maxZoom: 14,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

fetch('../process_shapes/shapes.json')
  .then(res => res.json())
  .then((data) => {
    console.log(data)
    L.geoJSON(data, {
      style: function(feature) {
        console.log(feature.properties.stroke)
        return { color: feature.properties.stroke.replace(' deg', '') };
      }
    }).addTo(map);
  })