const { showClocks } = require("@src/handlers/lounge");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "time",
  description: "show the current clock for each timezone",
  category: "UTILITY",
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
  },

  async interactionRun(interaction) {
    await showClocks(interaction);
  },
};
