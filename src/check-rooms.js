const ROOMS = [
  "LT",
  "304",
  "PB212",
  "RMA",
  "PB001",
  "PB201",
  "PB214",
  "N2",
  "ECR",
  "PB020",
  "N1",
  "VSLA",
  "PB208",
  "EA",
  "NEB-FF1",
  "RMB",
  "PB012",
  "PB008",
  "A110",
  "NAF1",
  "303",
  "206",
  "PB014",
  "VCR",
  "NEB-GF",
  "NEB-FF2",
  "NEB-SF",
  "Computer Based",
  "GIS Lab",
  "NEB-TF",
];

const Excel = require("exceljs");

async function verifyRooms(filename) {
  const workbook = new Excel.Workbook();
  try {
    await workbook.xlsx.readFile(filename);
    const ws = workbook.worksheets[0];
    ws.eachRow((row, rowNum) => {
      let cell = row.getCell("A").value;
      let rooms = cell.split("%")[5];
      rooms.split("/").forEach((room) => {
        if (room.isEmpty) {
          console.log(`Empty Room: ${room} on row: ${rowNum}`);
        }
        if (!ROOMS.includes(room.trim())) {
          console.log(`False Room: ${room} on row: ${rowNum}`);
        }
      });
    });
  } catch (error) {
    console.log(error);
  } finally {
    console.log("✔️ Finished Checking Rooms.");
  }
}

async function checkAllocationSchedule(timetableOutput) {
  const workbook = new Excel.Workbook();
  try {
    await workbook.xlsx.readFile(timetableOutput);
    const ws = workbook.worksheets[0];
    ws.eachRow((row, rowNum) => {
      let cell = row.getCell("A").value.split("%");
      const rooms = cell[5];
      const allocationSchedule = cell[8];
      if (isNaN(parseInt(allocationSchedule.split("/")[0], 10))) {
        console.log(`Bad allocation schedule at row: ${rowNum}`);
      }
    });
  } catch (err) {
    console.log(err);
  } finally {
    console.log("✔️ Finished Checking Allocations.");
  }
}

const output = "C:/Users/mrman/Desktop/second-sem/generated/Examtt2k24_25_SS_EXAMS_cleaned.xlsx"

verifyRooms(output);
// checkAllocationSchedule(output);
