const examsSchedule = require("./generated/rooms-ta.json");
const fs = require("fs");
const tasList = require("./generated/tas.json");
const roomsWith2Tas = ["NEB-SF", "NEB-TF", "NAF1", "VSLA"];

function totalSessions(examsSchedule) {
  let totalSessions = 0;

  const days = Object.keys(examsSchedule);
  days.forEach((day) => {
    const sessions = Object.keys(examsSchedule[day]);
    sessions.forEach((session) => {
      const rooms = Object.keys(examsSchedule[day][session]);

      rooms.forEach((room) => {
        if (roomsWith2Tas.includes(room)) {
          totalSessions += 2;
        } else {
          totalSessions += 1;
        }
      });
    });
  });

  console.log(totalSessions);
  return totalSessions;
}

function getAverageSessionsPerTa(examsSchedule, tasList) {
  const totalNumOfSessions = totalSessions(examsSchedule);
  const numOfTas = tasList.length;

  console.log("total-sessions", totalNumOfSessions);
  console.log("num-of-tas", numOfTas);
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

  if (availableTas.length === 0) return null;

  return availableTas[Math.floor(Math.random() * availableTas.length)];
}

function getRandomTa(tasList) {
  if (!tasList.length) return null;
  return tasList[Math.floor(Math.random() * tasList.length)];
}

function getPrivTa(tasSessionCount, tasAssignedForSession, maxSessionsPerTa) {
  const privTas = require("./generated/spec.json");
  // Use the same max sessions as regular TAs, or allow slightly more flexibility
  const maxForPrivTas = maxSessionsPerTa + 1; // Allow 2 extra sessions for privileged TAs

  const availableTas = privTas.filter(
    (ta) =>
      tasSessionCount[ta] < maxForPrivTas && !tasAssignedForSession.includes(ta)
  );

  if (availableTas.length === 0) return null;

  return availableTas[Math.floor(Math.random() * availableTas.length)];
}

function scheduleTas(examsSchedule, tasList) {
  const MaxSessionsPerTa = getAverageSessionsPerTa(examsSchedule, tasList);
  const tasSchedule = {};
  const tasSessionCount = {};

  // Shuffle the TA list to ensure fair distribution
  const shuffledTasList = [...tasList].sort(() => Math.random() - 0.5);
  console.log("TAs shuffled for fair distribution");

  // Initialize tasSessionCount for regular TAs
  shuffledTasList.forEach((ta) => {
    tasSessionCount[ta] = 0;
  });

  // Initialize tasSessionCount for privileged TAs
  const privTas = require("./generated/spec.json");
  privTas.forEach((ta) => {
    if (!(ta in tasSessionCount)) {
      tasSessionCount[ta] = 0;
    }
  });

  const days = Object.keys(examsSchedule);
  days.forEach((day) => {
    tasSchedule[day] = {};
    const sessions = Object.keys(examsSchedule[day]);

    sessions.forEach((session) => {
      // Reset tasAssignedForSession for each session, not each day
      const tasAssignedForSession = [];

      tasSchedule[day][session] = {};
      const rooms = Object.keys(examsSchedule[day][session]);

      rooms.forEach((room) => {
        tasSchedule[day][session][room] = [];

        if (roomsWith2Tas.includes(room)) {
          // Assign first TA
          const ta1 = getAvailableTa(
            shuffledTasList,
            tasSessionCount,
            MaxSessionsPerTa,
            tasAssignedForSession
          );

          if (ta1) {
            tasSchedule[day][session][room].push(ta1);
            tasSessionCount[ta1] += 1;
            tasAssignedForSession.push(ta1);
          } else {
            const privTa = getPrivTa(
              tasSessionCount,
              tasAssignedForSession,
              MaxSessionsPerTa
            );
            if (privTa) {
              tasSchedule[day][session][room].push(privTa);
              tasSessionCount[privTa] += 1;
              tasAssignedForSession.push(privTa);
            } else {
              const randomTa = getRandomTa(
                shuffledTasList.filter(
                  (ta) => !tasAssignedForSession.includes(ta)
                )
              );
              if (randomTa) {
                tasSchedule[day][session][room].push(randomTa);
                tasSessionCount[randomTa] += 1;
                tasAssignedForSession.push(randomTa);
              }
            }
          }

          // Assign second TA
          const ta2 = getAvailableTa(
            shuffledTasList,
            tasSessionCount,
            MaxSessionsPerTa,
            tasAssignedForSession
          );

          if (ta2) {
            tasSchedule[day][session][room].push(ta2);
            tasSessionCount[ta2] += 1;
            tasAssignedForSession.push(ta2);
          } else {
            const privTa = getPrivTa(
              tasSessionCount,
              tasAssignedForSession,
              MaxSessionsPerTa
            );
            if (privTa) {
              tasSchedule[day][session][room].push(privTa);
              tasSessionCount[privTa] += 1;
              tasAssignedForSession.push(privTa);
            } else {
              const randomTa = getRandomTa(
                shuffledTasList.filter(
                  (ta) => !tasAssignedForSession.includes(ta)
                )
              );
              if (randomTa) {
                tasSchedule[day][session][room].push(randomTa);
                tasSessionCount[randomTa] += 1;
                tasAssignedForSession.push(randomTa);
              }
            }
          }
        } else {
          // Single TA room
          const ta = getAvailableTa(
            shuffledTasList,
            tasSessionCount,
            MaxSessionsPerTa,
            tasAssignedForSession
          );

          if (ta) {
            tasSchedule[day][session][room].push(ta);
            tasSessionCount[ta] += 1;
            tasAssignedForSession.push(ta);
          } else {
            const privTa = getPrivTa(
              tasSessionCount,
              tasAssignedForSession,
              MaxSessionsPerTa
            );
            if (privTa) {
              tasSchedule[day][session][room].push(privTa);
              tasSessionCount[privTa] += 1;
              tasAssignedForSession.push(privTa);
            } else {
              const randomTa = getRandomTa(
                shuffledTasList.filter(
                  (ta) => !tasAssignedForSession.includes(ta)
                )
              );
              if (randomTa) {
                tasSchedule[day][session][room].push(randomTa);
                tasSessionCount[randomTa] += 1;
                tasAssignedForSession.push(randomTa);
              }
            }
          }
        }
      });
    });
  });

  return [tasSchedule, tasSessionCount];
}

const [tasSchedule, tasSessionCount] = scheduleTas(examsSchedule, tasList);

function saveTaScheduleToXLSX() {
  const tasSchedule = require("./outputs/tas_schedule.json");
  const tasSessionCount = require("./outputs/tas_session_count.json");
  const ExcelJS = require("exceljs");
  const fs = require("fs");

  const tasScheduleList = [];
  const tasSessionCountList = []

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

  const names = Object.keys(tasSessionCount);
  names.forEach((name) => {
    const sessionCount = { name, count: tasSessionCount[name] };

    tasSessionCountList.push(sessionCount)
  });

  const wb = new ExcelJS.Workbook();
  const sheet1 = wb.addWorksheet("Sheet1");
  const sheet2 = wb.addWorksheet("Session Count");
  sheet1.columns = [
    { header: "Room", key: "room", width: 20 },
    { header: "Teaching Assistant", key: "teachingAssistant", width: 72 },
    { header: "Date", key: "date", width: 50 },
    { header: "Session", key: "session", width: 50 },
  ];
  sheet1.addRows(tasScheduleList);

  sheet2.columns = [
    { header: "Teaching Assistant", key: "name", width: 72 },
    { header: "Number of Sessions", key: "count", width: 20 },
  ];
  sheet2.addRows(tasSessionCountList);

  wb.xlsx
    .writeFile("./src/outputs/ta_schedule.xlsx")
    .then(() => {
      console.log("[+] Finished saving ta schedule");
    })
    .catch((err) => {
      console.log("[-] Error saving ta schedule:\n", err);
    });

  fs.writeFileSync(
    "./src/outputs/ta_schedule_list.json",
    JSON.stringify(tasScheduleList)
  );
}

// fs.writeFileSync("./src/outputs/tas_schedule.json", JSON.stringify(tasSchedule));
// fs.writeFileSync(
//   "./src/outputs/tas_session_count.json",
//   JSON.stringify(tasSessionCount)
// );

saveTaScheduleToXLSX();
