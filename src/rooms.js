const Xlsx = require("xlsx");
const fs = require("fs");

function processExcel(filePath) {
  const workbook = Xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const jsonData = Xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let extractedData = jsonData
    .map((row) => {
      if (!row[0] || typeof row[0] !== "string") return null;

      const splitRow = row[0].split("%");

      if (splitRow.length < 8) return null;

      return {
        Room: splitRow[5], // rooms
        Date: splitRow[6], // date
        Session: splitRow[7], // session
      };
    })
    .filter((item) => item && item.Room && item.Date && item.Session);

  return groupByDateAndSession(extractedData);
}

function groupByDateAndSession(data) {
  const result = {};

  data.forEach(({ Date, Session, Room }) => {
    if (!result[Date]) {
      result[Date] = {};
    }

    if (!result[Date][Session]) {
      result[Date][Session] = new Set();
    }

    Room.split("/").forEach((room) => result[Date][Session].add(room.trim()));
  });

  Object.keys(result).forEach((date) => {
    Object.keys(result[date]).forEach((session) => {
      result[date][session] = Array.from(result[date][session]);
    });
  });

  return result;
}

const filename =
  "C:/Users/mrman/Desktop/exams/generated/Midsem_Timetable_2024-25_Midsem-cleaned.xlsx";
const output = "C:/Users/mrman/Desktop/exams/generated/grouped_rooms.json";

const groupedData = processExcel(filename);
fs.writeFileSync(output, JSON.stringify(groupedData, null, 2));

console.log("Processing Complete, Data saved in: ", output)
