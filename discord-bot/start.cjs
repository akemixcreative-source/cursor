const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

async function ownerId() {
  if (process.env.OWNER_ID) return process.env.OWNER_ID;
  const response = await fetch(`https://discord.com/api/v10/guilds/${process.env.GUILD_ID}`, {
    headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
  });
  if (!response.ok) {
    console.warn(`owner id unavailable (${response.status}). invite the bot, then restart.`);
    return "";
  }
  const guild = await response.json();
  return guild.owner_id || "";
}

async function main() {
  if (!process.env.DISCORD_TOKEN) throw new Error("DISCORD_TOKEN is missing");
  if (!process.env.GUILD_ID) throw new Error("GUILD_ID is missing");

  const { MongoMemoryServer } = require("mongodb-memory-server");
  const dbPath = path.join(__dirname, "..", ".mongo-data");
  fs.mkdirSync(dbPath, { recursive: true });

  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: "venera",
      dbPath,
      storageEngine: "wiredTiger",
    },
  });

  const child = spawn(process.execPath, ["bot.js"], {
    cwd: __dirname,
    stdio: "inherit",
    env: {
      ...process.env,
      BOT_TOKEN: process.env.DISCORD_TOKEN,
      OWNER_ID: await ownerId(),
      GUILD_ID: process.env.GUILD_ID,
      MONGO_CONNECTION: mongod.getUri("venera"),
    },
  });

  const stop = async () => {
    if (child.exitCode === null && !child.killed) child.kill("SIGTERM");
    await mongod.stop().catch(() => {});
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  child.on("exit", async (code) => {
    await mongod.stop().catch(() => {});
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
