const examsSchedule = require("./generated/rooms-ta.json");
const tasList = require("./generated/tas.json");
const roomsWith2Tas = ["NEB-SF", "NEB-TF", "VSLA", "NAF1"];
const bezaleel = ["A110"];
const najwa = [
  "Wednesday, 3rd September 2025",
  "Thursday, 4th September 2025",
  "Friday, 5th September 2025",
];

function getTotalNumOfSessions(examsSchedule) {
  let totalNumOfSessions = 0;

  const days = Object.keys(examsSchedule);
  days.forEach((day) => {
    const sessions = Object.keys(examsSchedule[day]);
    sessions.forEach((session) => {
      const rooms = Object.keys(examsSchedule[day][session]);

      rooms.forEach((room) => {
        if (roomsWith2Tas.includes(room)) {
          totalNumOfSessions += 2;
        } else {
          totalNumOfSessions += 1;
        }
      });
    });
  });

  console.log(totalNumOfSessions);

  return totalNumOfSessions;
}

function getAverageSessionsPerTa(examsSchedule, tasList) {
  const totalNumOfSessions = getTotalNumOfSessions(examsSchedule);
  const numOfTas = tasList.length;

  console.log(totalNumOfSessions / numOfTas);

  return Math.floor(totalNumOfSessions / numOfTas);
}

function getAvailableTa(
  tasList,
  tasSessionCount,
  maxSessionsPerTa,
  tasAssignedForSession
) {
  const availableTas = tasList.filter(
    (ta) =>
      tasSessionCount[ta] < maxSessionsPerTa &&
      !tasAssignedForSession.includes(ta)
  );

  if (availableTas.length === 0) return null; // No available TA found

  return availableTas[Math.floor(Math.random() * availableTas.length)];
}

function getRandomTa(tasList) {
  if (!tasList.length) return null; // Return null if the list is empty
  return tasList[Math.floor(Math.random() * tasList.length)];
}

function scheduleTas(examsSchedule, tasList) {
  const MaxSessionsPerTa = getAverageSessionsPerTa(examsSchedule, tasList);
  const tasSchedule = {};
  const tasSessionCount = {};

  // initialize tasSessionCount object
  tasList.forEach((ta) => {
    tasSessionCount[ta] = 0;
  });

  const days = Object.keys(examsSchedule);
  days.forEach((day) => {
    tasSchedule[day] = {};
    const sessions = Object.keys(examsSchedule[day]);

    sessions.forEach((session) => {
      tasSchedule[day][session] = {};
      const rooms = Object.keys(examsSchedule[day][session]);

      const tasAssignedForSession = [];

      rooms.forEach((room) => {
        tasSchedule[day][session][room] = [];

        const numRequiredTas = roomsWith2Tas.includes(room) ? 2 : 1;

        for (let i = 0; i < numRequiredTas; i++) {
          let ta =
            getAvailableTa(
              tasList,
              tasSessionCount,
              MaxSessionsPerTa,
              tasAssignedForSession
            ) ||
            getPrivTa(tasSessionCount, tasAssignedForSession) ||
            getRandomTa(
              tasList.filter((ta) => !tasAssignedForSession.includes(ta))
            );

          if (ta) {
            if (bezaleel.includes(room)) {
              ta = "Bezaleel Nana Akrasi Gyedu-Ware";
            } else if (ta === "Bezaleel Nana Akrasi Gyedu-Ware") {
              ta =
                getAvailableTa(
                  tasList,
                  tasSessionCount,
                  MaxSessionsPerTa,
                  tasAssignedForSession
                ) ||
                getPrivTa(tasSessionCount, tasAssignedForSession) ||
                getRandomTa(
                  tasList.filter((ta) => !tasAssignedForSession.includes(ta))
                );
            }

            // ✅ Najwa condition
            if (najwa.includes(day) && ta === "Eliasu Najwah Maltiti") {
              ta =
                getAvailableTa(
                  tasList,
                  tasSessionCount,
                  MaxSessionsPerTa,
                  tasAssignedForSession
                ) ||
                getPrivTa(tasSessionCount, tasAssignedForSession) ||
                getRandomTa(
                  tasList.filter((ta) => !tasAssignedForSession.includes(ta))
                );
            }

            tasSchedule[day][session][room].push(ta);
            tasSessionCount[ta] += 1;
            tasAssignedForSession.push(ta);
          } else {
            console.warn(
              `[-] Could not assign TA for ${day} ${session} ${room}`
            );
          }
        }
      });
    });
  });

  return [tasSchedule, tasSessionCount];
}


function getPrivTa(tasSessionCount, tasAssignedForSession) {
  const privTas = require("./generated/spec.json");
  const availableTas = privTas.filter(
    (ta) => tasSessionCount[ta] < 7 && !tasAssignedForSession.includes(ta)
  );

  if (availableTas.length === 0) return null; // No available TA found

  return availableTas[Math.floor(Math.random() * availableTas.length)];
}

const [tasSchedule, tasSessionCount] = scheduleTas(examsSchedule, tasList);

function saveTaScheduleToXLSX() {
  const tasSchedule = require("./outputs/tas_schedule-draft.json");
  const tasSessionCount = require("./outputs/tas_sessions-draft.json");
  const ExcelJS = require("exceljs");
  const fs = require("fs");

  const tasScheduleList = [];
  const tasSessionCountList = [];

  const days = Object.keys(tasSchedule);
  days.forEach((day) => {
    const sessions = Object.keys(tasSchedule[day]);
    sessions.forEach((session) => {
      const rooms = Object.keys(tasSchedule[day][session]);

      rooms.forEach((room) => {
        const roomSchedule = {
          room,
          teachingAssistant: tasSchedule[day][session][room].join(" / "),
          date: day,
          session,
        };

        tasScheduleList.push(roomSchedule);
      });
      tasScheduleList.push([]);
    });
  });

  // console.log(tasScheduleList);

  const names = Object.keys(tasSessionCount);
  names.forEach((name) => {
    const sessionCount = { name, count: tasSessionCount[name] };

    tasSessionCountList.push(sessionCount);
  });

  const wb = new ExcelJS.Workbook();
  const sheet1 = wb.addWorksheet("Sheet1");
  const sheet2 = wb.addWorksheet("Sessions");
  sheet1.columns = [
    { header: "Room", key: "room", width: 12 },
    { header: "Teaching Assistant", key: "teachingAssistant", width: 72 },
    { header: "Date", key: "date", width: 50 },
    { header: "Session", key: "session", width: 50 },
  ];
  sheet1.addRows(tasScheduleList);

  sheet2.columns = [
    { header: "Teaching Assistant", key: "name", width: 72 },
    { header: "Session", key: "count", width: 25 },
  ];
  sheet2.addRows(tasSessionCountList);

  wb.xlsx
    .writeFile("./src/outputs/ta_schedule-final.xlsx")
    .then(() => {
      console.log("[+] Finished saving ta schedule");
    })
    .catch((err) => {
      "[-] Error saving ta schedule:\n", err;
    });

  // fs.writeFileSync(
  //   "./src/outputs/ta_schedule.json",
  //   JSON.stringify(tasScheduleList)
  // );
}

const fs = require("fs");

fs.writeFileSync(
  "./src/outputs/tas_schedule-draft.json",
  JSON.stringify(tasSchedule)
);
fs.writeFileSync(
  "./src/outputs/tas_sessions-draft.json",
  JSON.stringify(tasSessionCount)
);

saveTaScheduleToXLSX();
