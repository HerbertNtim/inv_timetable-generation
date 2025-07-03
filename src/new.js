const examsSchedule = require("./generated/rooms-ta.json");
const tasList = require("./generated/tas.json");
const roomsWith2Tas = ["NEB-SF", "NEB-TF", "NEB-GF", "NAF1", "VSLA"];

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

  return totalNumOfSessions;
}

function getAverageSessionsPerTa(examsSchedule, tasList) {
  const totalNumOfSessions = getTotalNumOfSessions(examsSchedule);
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
    (ta) => tasSessionCount[ta] < maxForPrivTas && !tasAssignedForSession.includes(ta)
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
            const privTa = getPrivTa(tasSessionCount, tasAssignedForSession, MaxSessionsPerTa);
            if (privTa) {
              tasSchedule[day][session][room].push(privTa);
              tasSessionCount[privTa] += 1;
              tasAssignedForSession.push(privTa);
            } else {
              const randomTa = getRandomTa(
                shuffledTasList.filter((ta) => !tasAssignedForSession.includes(ta))
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
            const privTa = getPrivTa(tasSessionCount, tasAssignedForSession, MaxSessionsPerTa);
            if (privTa) {
              tasSchedule[day][session][room].push(privTa);
              tasSessionCount[privTa] += 1;
              tasAssignedForSession.push(privTa);
            } else {
              const randomTa = getRandomTa(
                shuffledTasList.filter((ta) => !tasAssignedForSession.includes(ta))
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
            const privTa = getPrivTa(tasSessionCount, tasAssignedForSession, MaxSessionsPerTa);
            if (privTa) {
              tasSchedule[day][session][room].push(privTa);
              tasSessionCount[privTa] += 1;
              tasAssignedForSession.push(privTa);
            } else {
              const randomTa = getRandomTa(
                shuffledTasList.filter((ta) => !tasAssignedForSession.includes(ta))
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

// Verification and logging
function verifyScheduling(tasSchedule, tasSessionCount, examsSchedule) {
  const totalSessions = getTotalNumOfSessions(examsSchedule);
  const averageSessionsPerTa = getAverageSessionsPerTa(examsSchedule, tasList);
  
  // Count total assignments
  let totalAssignments = 0;
  let unassignedSessions = 0;
  
  const days = Object.keys(tasSchedule);
  days.forEach((day) => {
    const sessions = Object.keys(tasSchedule[day]);
    sessions.forEach((session) => {
      const rooms = Object.keys(tasSchedule[day][session]);
      rooms.forEach((room) => {
        const assignments = tasSchedule[day][session][room];
        if (assignments.length === 0) {
          unassignedSessions++;
          console.log(`⚠️  Unassigned: ${day} - ${session} - ${room}`);
        } else {
          totalAssignments += assignments.length;
          // Check for null assignments
          assignments.forEach((ta, index) => {
            if (!ta) {
              console.log(`⚠️  Null assignment: ${day} - ${session} - ${room} - Position ${index + 1}`);
            }
          });
        }
      });
    });
  });
  
  console.log("\n=== SCHEDULING VERIFICATION ===");
  console.log(`Total sessions required: ${totalSessions}`);
  console.log(`Total assignments made: ${totalAssignments}`);
  console.log(`Unassigned sessions: ${unassignedSessions}`);
  console.log(`Missing assignments: ${totalSessions - totalAssignments}`);
  
  if (totalAssignments === totalSessions) {
    console.log("✅ All sessions have been assigned!");
  } else {
    console.log("❌ Some sessions are missing assignments!");
  }
  
  // Check TAs with less than average sessions
  console.log(`\n=== TA SESSION DISTRIBUTION ===`);
  console.log(`Average sessions per TA: ${averageSessionsPerTa}`);
  
  const belowAverage = [];
  const aboveAverage = [];
  const atAverage = [];
  
  Object.keys(tasSessionCount).forEach((ta) => {
    const sessions = tasSessionCount[ta];
    if (sessions < averageSessionsPerTa) {
      belowAverage.push({ ta, sessions });
    } else if (sessions > averageSessionsPerTa) {
      aboveAverage.push({ ta, sessions });
    } else {
      atAverage.push({ ta, sessions });
    }
  });
  
  console.log(`\nTAs with LESS than average (${averageSessionsPerTa}) sessions:`);
  belowAverage.sort((a, b) => a.sessions - b.sessions);
  belowAverage.forEach(({ ta, sessions }) => {
    console.log(`  ${ta}: ${sessions} sessions (${averageSessionsPerTa - sessions} below average)`);
  });
  
  console.log(`\nTAs with MORE than average (${averageSessionsPerTa}) sessions:`);
  aboveAverage.sort((a, b) => b.sessions - a.sessions);
  aboveAverage.forEach(({ ta, sessions }) => {
    console.log(`  ${ta}: ${sessions} sessions (+${sessions - averageSessionsPerTa} above average)`);
  });
  
  console.log(`\nTAs at exactly average (${averageSessionsPerTa}) sessions: ${atAverage.length}`);
  
  // Summary statistics
  const totalTAsAssigned = Object.keys(tasSessionCount).filter(ta => tasSessionCount[ta] > 0).length;
  const totalTAsAvailable = Object.keys(tasSessionCount).length;
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total TAs available: ${totalTAsAvailable}`);
  console.log(`Total TAs assigned: ${totalTAsAssigned}`);
  console.log(`TAs below average: ${belowAverage.length}`);
  console.log(`TAs at average: ${atAverage.length}`);
  console.log(`TAs above average: ${aboveAverage.length}`);
  console.log(`Unused TAs: ${totalTAsAvailable - totalTAsAssigned}`);
}

// verifyScheduling(tasSchedule, tasSessionCount, examsSchedule);

function saveTaScheduleToXLSX() {
  const tasSchedule = require("./src/new/tas_schedule.json");
  const ExcelJS = require("exceljs");
  const fs = require("fs");

  const tasScheduleList = [];

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
    .writeFile("./src/new/ta_schedule.xlsx")
    .then(() => {
      console.log("[+] Finished saving ta schedule");
    })
    .catch((err) => {
      console.log("[-] Error saving ta schedule:\n", err);
    });

  fs.writeFileSync(
    "./src/new/ta_schedule_list.json",
    JSON.stringify(tasScheduleList)
  );
}

const fs = require("fs");

fs.writeFileSync("./src/new/tas_schedule.json", JSON.stringify(tasSchedule));
fs.writeFileSync(
  "./src/new/tas_session_count.json",
  JSON.stringify(tasSessionCount)
);

saveTaScheduleToXLSX();
verifyScheduling()
