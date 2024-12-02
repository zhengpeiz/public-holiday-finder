// timerWorker.js

let interval = null;

self.onmessage = function (e) {
  const { command, intervalTime } = e.data;

  if (command === "start") {
    if (interval) return; // Prevent multiple intervals
    interval = setInterval(() => {
      self.postMessage("tick");
    }, intervalTime);
  } else if (command === "stop") {
    clearInterval(interval);
    interval = null;
  }
};
