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
      for (let i = 0; i < it.length; ++i) {
        startTime = performance.now();
        const result = it[i].cb();
        totalTime += performance.now() - startTime;

        if (result) {
          ++pass;
        }
        else {
          ++fail;
        }

        tests.push({ name: it[i].name, result })

        beforeEach && beforeEach();
      }

      let string = "";
      let style = [];

      string += `${fail > 0 ? "%c FAIL " : "%c PASS "}%c ${name}`
      style.push(fail > 0 ? "background-color:red;" : "background-color:green;", "")
      for (let i = 0; i < tests.length; ++i) {
        string += `\n%c${tests[i].result ? "✔️" : "❌"} ${tests[i].name}`
        style.push("");
      }
      string += `\n\nTests: %c${pass} passed, %c${fail} failed`
      style.push("color:green;", "color:red;")
      string += `\n%cTime: ${(totalTime / 1000).toFixed(6)}s`
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