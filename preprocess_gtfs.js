const fs = require("fs");
const { parse } = require("csv-parse/sync");

/*
const shapesRaw = parse(
  fs.readFileSync("./google_transit/shapes.txt", "utf8"),
  {
    columns: true,
    skip_empty_lines: true,
  }
);
*/

fs.mkdirSync('./google_transit_json')

const input = fs.readdirSync("./google_transit");
input.forEach((filename) => {
  if (!filename.endsWith(".txt")) return;

  //lol
  if (filename == "stop_times.txt") return;

  const finalFilename = filename.replace(".txt", ".json");

  if (fs.existsSync(`./google_transit_json/${finalFilename}`)) {
    //console.log("file exists, skipping");
    //return;
  }

  console.log("opening file", filename);

  console.log("parsing file");
  const parsed = parse(
    fs.readFileSync(`./google_transit/${filename}`, "utf8"),
    {
      columns: true,
      skip_empty_lines: true,
    }
  );

  console.log("writing file");
  /*
  let stream = fs.createWriteStream(`./google_transit_json/${filename.split(".")[0]}.json`, {flags: 'a'});

  console.log('serializing');
  const stringified = JSON.stringify(parsed);

  stream.write(stringified);
  stream.end();
  */

  fs.writeFile(
    `./google_transit_json/${filename.split(".")[0]}.json`,
    JSON.stringify(parsed, null, 2),
    "utf8",
    function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }

      console.log("JSON file has been saved.");
    }
  );
});
