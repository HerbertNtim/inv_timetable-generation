// Cleaning the excel functions

const Excel = require("exceljs");
const fs = require('node:fs')

function isValidMonth(str) {
  const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ]

  if(months.includes(str.toLowerCase())) {
    return true;
  }
  return false;
}

async function readTimetableFile(filename) {
  const workbook = new Excel.Workbook();
  try {
    await workbook.xlsx.readFile(filename);
  } catch (error) {
    console.log(error)
    throw new Error(error);
  }

  return workbook;
}

async function saveWorkbookToXlsxFile(workbook, saveFileName) {
  try {
    await workbook.xlsx.writeFile(saveFileName);
  } catch (err) {
    console.log(err);
  }
}

async function cleanTimetable(srcPath, sheetName, rowCount, colCount) {
  const workbook = await readTimetableFile(srcPath);

  console.log("Available Sheets:", workbook.worksheets.map(ws => ws.name));

  const worksheet = workbook.getWorksheet(sheetName);

  let paperCount = 0;

  let currentDate = "";
  let lastDate = "";
  let currentSession = "";
  let lastSession = "";

  let allPapers = [];
  let iterations = 0;

  for (let rowNum = 1; rowNum <= rowCount; rowNum++) {
    iterations++;
    const row = worksheet.getRow(rowNum);
    const rowAsArray = [];
    for (let cellNum = 1; cellNum <= colCount; cellNum++) {
      const cell = row.getCell(cellNum);
      if (cell.value === null || cell.value === undefined) {
        break;
      } else if (
        typeof cell.value === "string" && cell.value.toString().split(" ").length === 4 &&
        isValidMonth(cell.value.toString().split(" ")[2])
      ) {
        currentDate = cell.value.toString();
        lastDate = currentDate;
        break;
      } else if (typeof cell.value === "string" && cell.value.toString().toLowerCase().includes("session")) {
        currentSession = cell.value.toString();
        lastSession = currentSession;
        break;
      } else if (typeof cell.value === "string" && cell.value.toString().trim().toLowerCase() === "code") {
        break;
      } else {
        if (cellNum === 7) {
          continue;
        }
        rowAsArray.push(cell.value ? cell.value.toString() : "");
      }
    }
    if (rowAsArray.length > 0) {
      let allocation = 0;
      if (rowAsArray[5] && rowAsArray[5].toString().toLowerCase() === "computer based") {
        allocation = rowAsArray[4];
      } else if (
        rowAsArray[5] && rowAsArray[5].toString() !== undefined &&
        rowAsArray[rowAsArray.length - 1] === undefined
      ) {
        allocation = rowAsArray[4];
        console.log('rowAsArray', rowAsArray);
      } else {
        allocation = rowAsArray[rowAsArray.length - 1];
      }

      rowAsArray[6] = lastDate;
      rowAsArray[7] = lastSession;
      rowAsArray.push(allocation);
      allPapers.push(rowAsArray);
      paperCount++;
      currentDate = "";
      currentSession = "";
    }
  }
  console.log(`paper count: ${paperCount}`);
  console.log(`iteration count: ${iterations}`);
  return allPapers;
}

async function start(allPapers, destPath) {
  const newWorkbook = new Excel.Workbook();
  const newWorksheet = newWorkbook.addWorksheet("Sheet1");

  for (let i = 0; i < allPapers.length; i++) {
    newWorksheet.addRow([allPapers[i].join("%")]);
  }

  saveWorkbookToXlsxFile(newWorkbook, destPath);
}

const filename = "C:/Users/mrman/Desktop/exams/Midsem_Timetable_2024-25_Midsem-2-final.xlsx";
const output = "C:/Users/mrman/Desktop/exams/generated/Midsem_Timetable_2024-25_Midsem-cleaned.xlsx"

cleanTimetable(filename, "Sheet1", 1010, 8)
  .then((allPapers) => {
    start(allPapers, output)
      .then(() => {
        console.log("✔️ done");
      })
      .catch((err) => {
        console.log(`📛 ${err}`);
      });
  })
  .catch((err) => {
    console.log(`Clean Timetable Error\n${err}`);
  });

