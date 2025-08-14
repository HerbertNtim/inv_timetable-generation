const ExamsSchedule = require("./generated/rooms-ta.json");
const fs = require("fs");
const TAsList = require("./generated/tas.json");
const roomsWith2TAs = ["NEB-SF", "NEB-TF", "NEB-GF", "NAF1"];

function getTotalSessions(ExamsSchedule) {
  let totalSessions = 0;

  const days = Object.keys(ExamsSchedule);
  days.forEach((day) => {
    const sessions = Object.keys(ExamsSchedule[day]);
    sessions.forEach((session) => {
      const rooms = Object.keys(ExamsSchedule[day][session]);

      rooms.forEach((room) => {
        if (roomsWith2TAs.includes(room)) {
          totalSessions += 2;
        } else {
          totalSessions += 1;
        }
      });
    });
  });

  console.log("Total Sessions: ", totalSessions)
  return totalSessions;
}

function getAverageSessionsPerTa(ExamsSchedule, TAsList) {
  const totalSessions = getTotalSessions(ExamsSchedule);
  const totalTAs = TAsList.length;

  console.log(Math.floor(totalSessions / totalTAs))
  return Math.floor(totalSessions / totalTAs);
}

function getAvailableTA(
  tasList,
  tasSessionCount,
  maxSessionsPerTa,
  tasAssignedForSession
) {
  const availableTAs = tasList.filter(
    (ta) =>
      tasSessionCount[ta] < maxSessionsPerTa &&
      !tasAssignedForSession.includes(ta)
  );

  if (availableTAs.length === 0) return null;

  return availableTAs[Math.floor(Math.random() * availableTAs.length)];
}

function getRandomTa(tasList) {
  if (!tasList.length) return null; // Return null if the list is empty
  return tasList[Math.floor(Math.random() * tasList.length)];
}

function scheduleTas(ExamsSchedule, TAsList) {
  const maxSessionPerTa = getAverageSessionsPerTa(ExamsSchedule, TAsList);
  const tasSchedule = {};
  const tasSessionCount = {};

  TAsList.forEach((ta) => {
    tasSessionCount[ta] = 0;
    const days = Object.keys(ExamsSchedule);
    days.forEach((day) => {
      tasSchedule[day] = {};
      const sessions = Object.keys(ExamsSchedule[day]);
      const tasAssignedForSession = [];
      const availableTas = TAsList.filter(
        (ta) => tasSessionCount[ta] < maxSessionPerTa
      );

      sessions.forEach((session) => {
        tasSchedule[day][session] = {};
        const rooms = Object.keys(ExamsSchedule[day][session]);

        rooms.forEach((room) => {
          tasSchedule[day][session][room] = [];
          if (roomsWith2TAs.includes(room)) {
            const ta1 = getAvailableTA(
              availableTas,
              tasAssignedForSession,
              maxSessionPerTa,
              tasAssignedForSession
            );
            if (ta1) {
              tasSchedule[day][session][room].push(ta1);
              tasSessionCount += 1;
              tasAssignedForSession.push(ta1);
              // console.log(tasAssignedForSession);
            } else {
              const privTa = getPrivTa(tasSessionCount, tasAssignedForSession);
              if (privTa) {
                tasSchedule[day][session][room].push(privTa);
                tasSessionCount[privTa] += 1;
                tasAssignedForSession.push(privTa);
              }
              // else {
              //   const randomTa = getRandomTa(
              //     TAsList.filter((ta) => !tasAssignedForSession.includes(ta))
              //   );
              //   tasSchedule[day][session][room].push(randomTa);
              //   tasSessionCount[randomTa] += 1;
              //   tasAssignedForSession.push(randomTa);
              // }
            }

            const ta2 = getAvailableTA(
              availableTas,
              tasAssignedForSession,
              maxSessionPerTa,
              tasAssignedForSession
            );
            if (ta2) {
              tasSchedule[day][session][room].push(ta2);

              // update sessions for ta
              tasSessionCount[ta2] += 1;
              // add tas to tasAssignedForSession
              tasAssignedForSession.push(ta2);
            } else {
              const privTa = getPrivTa(tasSessionCount, tasAssignedForSession);
              if (privTa) {
                tasSchedule[day][session][room].push(privTa);
                tasSessionCount[privTa] += 1;
                tasAssignedForSession.push(privTa);
              }
              // else {
              //   const randomTa = getRandomTa(
              //     TAsList.filter((ta) => !tasAssignedForSession.includes(ta))
              //   );
              //   tasSchedule[day][session][room].push(randomTa);
              //   tasSessionCount[randomTa] += 1;
              //   tasAssignedForSession.push(randomTa);
              // }
            }
          } else {
            const ta = getAvailableTA(
              availableTas,
              tasSessionCount,
              maxSessionPerTa,
              tasAssignedForSession
            );

            if (ta) {
              tasSchedule[day][session][room].push(ta);
              tasSessionCount[ta] += 1;
              tasAssignedForSession.push(ta);
            } else {
              const privTa = getPrivTa(tasSessionCount, tasAssignedForSession);
              if (privTa) {
                tasSchedule[day][session][room].push(privTa);
                tasSessionCount[privTa] += 1;
                tasAssignedForSession.push(privTa);
              }
              // else {
              //   const randomTa = getRandomTa(
              //     TAsList.filter((ta) => !tasAssignedForSession.includes(ta))
              //   );
              //   tasSchedule[day][session][room].push(randomTa);
              //   tasSessionCount[randomTa] += 1;
              //   tasAssignedForSession.push(randomTa);
              // }
            }
          }
        });
      });
    });
  });

  // console.log(tasSchedule, tasSessionCount);

  return [tasSchedule, tasSessionCount];
}

function getPrivTa(tasSessionCount, tasAssignedForSession) {
  const privTas = require("./generated/spec.json");
  const availableTas = privTas.filter(
    (ta) =>
      (tasSessionCount[ta] < 6) &&
      !tasAssignedForSession.includes(ta)
  );

  if (availableTas.length === 0) return null; // No available TA found

  return availableTas[Math.floor(Math.random() * availableTas.length)];
}

const [tasSchedule, tasSessionCount] = scheduleTas(ExamsSchedule, TAsList);
// console.log(tasSchedule)
// console.log(tasSessionCount)

function saveTaScheduleToXLSX() {
  const tasSchedule = scheduleTas(ExamsSchedule, TAsList)
  // console.log(tasSchedule)
  const ExcelJS = require("exceljs");

  const tasScheduleList = [];

  const days = Object.keys(tasSchedule);
  days.forEach((day) => {
    const sessions = Object.keys(tasSchedule[day]);
    // console.log(ExamsSchedule[day])
    sessions.forEach((session) => {
      const rooms = Object.keys(ExamsSchedule[day][session]);

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


  const wb = new ExcelJS.Workbook();
  const sheet1 = wb.addWorksheet("Sheet1");
  sheet1.columns = [
    { header: "Room", key: "room", width: 32 },
    { header: "Teaching Assistant", key: "teachingAssistant", width: 72 },
    { header: "Date", key: "date", width: 50 },
    { header: "Session", key: "session", width: 50 },
  ];
  sheet1.addRows(tasScheduleList);

  wb.xlsx
    .writeFile("./output/ta_schedule.xlsx")
    .then(() => {
      console.log("[+] Finished saving ta schedule");
    })
    .catch((err) => {
      "[-] Error saving ta schedule:\n", err;
    });

  fs.writeFileSync(
    "./output/ta_schedule_list.json",
    JSON.stringify(tasScheduleList)
  );
}

// const tas_schedules =  "./outputs/tas_schedule.json"
// const sessionCount = "./outputs/tas_session_count.json"
// fs.writeFileSync(tas_schedules, JSON.stringify(tasSchedule));
// fs.writeFileSync(
//   sessionCount,
//   JSON.stringify(tasSessionCount)
// );

saveTaScheduleToXLSX();
