FRAMEWORKS = [
  { name: "Backbone", version: "1.4.0", time: 0 },
  { name: "Inferno", version: "7.1.11", time: 0 },
  { name: "Knockout", version: "3.5.0", time: 0 },
  { name: "LitHTML", version: "1.0.0", time: 0 },
  { name: "Preact", version: "10.0.1", time: 0 },
  { name: "React", version: "16.8.6", time: 0 },
  { name: "Solid", version: "0.20.1", time: 0 },
  { name: "SolidState", version: "0.20.1", time: 0 },
  { name: "Svelte", version: "3.28.0", time: 0 },
  { name: "Surplus", version: "0.5.3", time: 0 },
  { name: "Lucid", version: "1.0.0", time: 0 },
  { name: "Soda", version: "1.0.2", time: 0 },
  { name: "Vanilla", version: "", time: 0 }
];

Benchmark = {
  number: 300,
  Framework: {}
};

(function () {
  const buttons = document.getElementById("buttons");
  const timing = document.getElementById("timing");
  const running = document.getElementById("running");
  let grid = document.getElementById("grid");

  let timer, loopTime, loopCount, totalTime, currentLoop, currentImpl, auto;
  function benchLoop() {
    let lastLoopTime = loopTime || performance.now();
    loopTime = performance.now();
    loopCount++;
    currentLoop();
    totalTime = totalTime + loopTime - lastLoopTime;
    if (loopCount % 30 === 0)
      timing.textContent = `Performed ${loopCount} iterations in ${totalTime.toFixed(
        2
      )} ms (average ${(totalTime / loopCount).toFixed(2)} ms per loop).`;
    if (auto !== undefined && loopCount === 1500) {
      FRAMEWORKS[auto].time = (totalTime / loopCount).toFixed(2) + "ms";
      if (++auto === FRAMEWORKS.length) {
        stop();
        loopTime = loopCount = totalTime = 0;
        auto = undefined;

        let out = [];
        for (let i = 0; i < FRAMEWORKS.length; ++i) {
          out[i] = { name: FRAMEWORKS[i].name, time: FRAMEWORKS[i].time }
        }
        console.table(out)

        return;
      }
      buttons.children[auto].click();
      return;
    }
    timer = setTimeout(benchLoop, 0);
  }

  function stop() {
    timer && clearTimeout(timer);
    currentImpl && currentImpl.cleanup && currentImpl.cleanup();
    running.textContent = "None";
    let newGrid = document.createElement("div");
    newGrid.id = "grid";
    document.body.replaceChild(newGrid, grid);
    grid = newGrid;
  }

  FRAMEWORKS.forEach(framework => {
    const script = document.createElement("script");
    script.src = `dist/${framework.name.toLowerCase()}.js`;
    script.type = "text/javascript";
    document.head.appendChild(script);

    const button = document.createElement("button");
    button.textContent = `${framework.name} ${framework.version}`;
    button.onclick = () => {
      stop();
      loopTime = loopCount = totalTime = 0;
      let impl;
      if ((impl = Benchmark.Framework[framework.name])) {
        currentImpl = impl;
        running.textContent = framework.name;
        impl.start();
        currentLoop = impl.loop;
        benchLoop();
      }
    };
    buttons.appendChild(button);
  });

  const button = document.createElement("button");
  button.textContent = "Stop Benchmark";
  button.onclick = () => stop();
  buttons.appendChild(button);

  function benchmark() {
    auto = 0;
    buttons.children[auto].click();
  }

  const buttonBenchmark = document.createElement("button");
  buttonBenchmark.textContent = "Auto Benchmark";
  buttonBenchmark.onclick = () => benchmark();
  buttons.appendChild(buttonBenchmark);
})();
