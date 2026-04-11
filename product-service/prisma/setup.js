require("dotenv").config();

const { spawnSync } = require("node:child_process");

function runPrismaCommand(args) {
  const result = spawnSync("npx.cmd", ["prisma", ...args], {
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

runPrismaCommand(["db", "push"]);
