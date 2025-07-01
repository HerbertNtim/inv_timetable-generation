const Xlsx = require("xlsx");
const fs = require("fs");

const generateTAs = (filename) => {
  const workbook = Xlsx.readFile(filename);
  const sheetName = workbook.SheetNames[1]
  const sheet = workbook.Sheets[sheetName]

  const jsonData = Xlsx.utils.sheet_to_json(sheet, { header: 1 })
  let extractedData = jsonData.map(name => name[0])
  
  return extractedData;
}

const file = "C:/Users/mrman/Desktop/exams/TA_list-mid.xlsx"
const output = "C:/Users/mrman/Desktop/exams/ss-mid/tas.json";
const finalList = generateTAs(file)
fs.writeFileSync(output, JSON.stringify(finalList, null, 2))

console.log("Processing Complete, Data saved in: ", output)
