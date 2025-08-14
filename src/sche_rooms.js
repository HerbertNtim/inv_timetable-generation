const xlsx = require("xlsx");
const fs = require("fs");

function workOnExcel(filepath) {
  const workbook = xlsx.readFile(filepath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let extractedData = jsonData
    .map((row) => {
      if (!row[0] || typeof row[0] !== "string") return null;

      const splitRow = row[0].split("%");
      if (splitRow.length < 8) return null;

      return {
        Rooms: splitRow[5],
        Dates: splitRow[6],
        Sessions: splitRow[7],
      };
    })
    .filter((item) => item && item.Rooms && item.Dates && item.Sessions);

  return groupRoomsForAllocation(extractedData);
}

function groupRoomsForAllocation(data) {
  const result = {};

  data.forEach(({ Dates, Sessions, Rooms }) => {
    if (!result[Dates]) {
      result[Dates] = {};
    }

    if (!result[Dates][Sessions]) {
      result[Dates][Sessions] = {};
    }

    Rooms.split("/").forEach((room) => {
      if (
        Object.keys(result[Dates][Sessions]).includes(room) ||
        room.trim() === "Computer Based"
      ) {
        return;
      }
      result[Dates][Sessions][room] = [];
    });
  });

  return result;
}

const filename =
  "C:/Users/mrman/Desktop/second-sem/generated/Examtt2k24_25_SS_EXAMS_cleaned.xlsx";

const output = "./src/generated/rooms-ta.json";

fs.writeFileSync(output, JSON.stringify(workOnExcel(filename), null, 2));
