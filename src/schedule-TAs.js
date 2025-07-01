const ExamsSchedule = require("./generated/rooms-ta.json");
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

  console.log(totalSessions);
  return totalSessions;
}

function getAverageSessionsPerTa(ExamsSchedule, TAsList) {
  const totalSessions = getTotalSessions(ExamsSchedule);
  const totalTAs = TAsList.length;

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

  return availableTAs[Math.floor(Math.random * availableTAs.length)];
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
            } else {
              const privTa = getPrivTa(tasSessionCount, tasAssignedForSession);
              if (privTa) {
                tasSchedule[day][session][room].push(privTa);
                tasSessionCount[privTa] += 1;
                tasAssignedForSession.push(privTa);
              }
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
            }
          }
        });
      });
    });
  });

  console.log(tasSchedule, tasSessionCount);

  return [tasSchedule, tasSessionCount];
}

function getPrivTa(tasSessionCount, tasAssignedForSession) {
  const privTas = require("./generated/tas.json");
  const availableTas = privTas.filter(
    (ta) => tasSessionCount[ta] < 7 && !tasAssignedForSession.includes(ta)
  );

  if (availableTas.length === 0) return null; // No available TA found

  return availableTas[Math.floor(Math.random() * availableTas.length)];
}

const sche = scheduleTas(ExamsSchedule, TAsList);
console.log(sche);
