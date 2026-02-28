const fs = require("fs");
const { execSync, spawn } = require("child_process");
const express = require("express");
const chalk = require("chalk");

// =====================
// Auto install modules
// =====================
const requiredModules = [
  "fs-extra",
  "axios",
  "moment-timezone",
  "gradient-string",
  "chalk",
  "express"
];

requiredModules.forEach((mod) => {
  try {
    require.resolve(mod);
  } catch {
    console.log(chalk.yellow(`[AUTO] Installing ${mod}...`));
    execSync(`npm install ${mod}`, { stdio: "inherit" });
  }
});

// =====================
// Keep Alive Server
// =====================
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (_, res) => res.send("🤖 Bot is alive"));
app.get("/ping", (_, res) => res.send("pong"));

app.listen(PORT, () => {
  console.log(chalk.green(`[SERVER] Keep-alive running on port ${PORT}`));
});

// =====================
// Anti-sleep heartbeat
// =====================
setInterval(() => {
  console.log(chalk.cyan(`[HEARTBEAT] ${new Date().toLocaleTimeString()}`));
}, 60 * 1000); // كل دقيقة

// =====================
// Restart-safe bot runner
// =====================
function startBot() {
  console.log(chalk.blue("[INFO] Starting Bot..."));

  const bot = spawn("node", ["main.js"], {
    stdio: "inherit",
    env: process.env
  });

  bot.on("exit", (code) => {
    console.log(
      chalk.red(`[BOT EXIT] Code ${code} — restarting in 5s...`)
    );
    setTimeout(startBot, 5000);
  });

  bot.on("error", (err) => {
    console.error(chalk.red("[BOT ERROR]"), err);
  });
}

// =====================
// Global crash protection
// =====================
process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION]", err);
});

// =====================
// Start
// =====================
startBot();