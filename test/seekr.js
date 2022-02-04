class Seekr {
  constructor() {
    let it;
    let beforeEach;

    this.describe = function (name, cb) {
      it = [];
      beforeEach = undefined;

      let tests = [];
      let pass = 0;
      let fail = 0;

      cb();

      let totalTime = 0;
      let startTime = 0;
      let testTime = 0;
      for (let i = 0; i < it.length; ++i) {
        startTime = performance.now();
        const result = it[i].cb();
        testTime = performance.now() - startTime;
        totalTime += testTime;

        if (result) {
          ++pass;
        }
        else {
          ++fail;
        }

        tests.push({ name: it[i].name, result: result, time: testTime })

        beforeEach && beforeEach();
      }

      let string = "";
      let style = [];

      string += `${fail > 0 ? "%c FAIL " : "%c PASS "}%c ${name}`
      style.push(fail > 0 ? "background-color:red;" : "background-color:green;", "font-weight:bold;")
      for (let i = 0; i < tests.length; ++i) {
        string += `\n%c${tests[i].result ? "✔️" : "❌"} ${tests[i].name} - ${(tests[i].time).toFixed(3)}ms`
        style.push("");
      }
      string += `\n\nTests: %c${pass} passed, %c${fail} failed`
      style.push("color:green;", "color:red;")
      string += `\n%cTime: ${(totalTime).toFixed(3)}ms`
      style.push("");

      console.log(string, ...style);
    }

    this.it = function (name, cb) {
      it.push({ name, cb });
    }

    this.beforeEach = function (cb) {
      beforeEach = cb;
    }
  }
}

export const seekr = new Seekr();