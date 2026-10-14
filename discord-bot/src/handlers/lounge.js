const { EmbedBuilder, MessageFlags } = require("discord.js");
const { isTimezoneName, localTime, minutesOfDay, timezoneMenu, withTimezone, zoneByKey, zoneOf } = require("../lounge/time");

const DOOR_REASON = "venera lounge";

function quiet(content) {
  return { content, flags: MessageFlags.Ephemeral };
}

async function chooseTimezone(interaction) {
  const shared = interaction.customId === "tz";
  const ownerId = shared ? interaction.user.id : interaction.customId.slice(3);
  if (interaction.user.id !== ownerId) {
    await interaction.reply({ content: "that one is for someone else.", flags: MessageFlags.Ephemeral });
    return;
  }

  const zone = zoneByKey(interaction.values?.[0]);
  if (!zone) {
    await interaction.reply(quiet("that timezone is not on the list."));
    return;
  }

  if (shared) await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  else await interaction.deferUpdate();

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    await applyTimezone(member, zone);
    await stampTimezone(member, zone);
    const content = `you're on ${zone.name}. it's ${localTime(zone)}.`;
    if (shared) {
      await interaction.editReply({ content });
      await interaction.message.edit({ components: [timezoneMenu()] });
    } else {
      await interaction.editReply({ content, components: [] });
    }
  } catch (error) {
    interaction.client.logger.error("timezone", error);
    const payload = quiet("the timezone roles are missing. run npm run setup, then try again.");
    if (shared) await interaction.editReply(payload);
    else if (interaction.deferred || interaction.replied) await interaction.followUp(payload);
    else await interaction.reply(payload);
  }
}

async function applyTimezone(member, zone) {
  const roles = await member.guild.roles.fetch();
  const wanted = roles.find((role) => role.name.trim().toLowerCase() === zone.name);
  if (!wanted) {
    const error = new Error(`missing ${zone.name} role`);
    error.handled = true;
    throw error;
  }

  const extras = roles.filter(
    (role) => role.id !== wanted.id && isTimezoneName(role.name) && member.roles.cache.has(role.id)
  );
  if (extras.size) await member.roles.remove([...extras.values()], DOOR_REASON);
  if (!member.roles.cache.has(wanted.id)) await member.roles.add(wanted, DOOR_REASON);
}

async function stampTimezone(member, zone) {
  if (member.user.bot || member.id === member.guild.ownerId) return;
  const current = member.nickname || member.user.username;
  const next = withTimezone(current, zone.name);
  if (!next || next === member.nickname) return;
  await member.setNickname(next, DOOR_REASON).catch((error) => {
    member.client.logger.warn(`nickname — ${error.message}`);
  });
}

function clocksEmbed(guild) {
  const now = new Date();
  const groups = new Map();
  for (const member of guild.members.cache.values()) {
    if (member.user.bot) continue;
    const zone = zoneOf(member);
    if (!zone) continue;
    if (!groups.has(zone.key)) groups.set(zone.key, { zone, people: [] });
    groups.get(zone.key).people.push(member.displayName || member.user.username);
  }

  const lines = [...groups.values()]
    .sort((left, right) => minutesOfDay(left.zone, now) - minutesOfDay(right.zone, now))
    .map((group) => {
      const names = group.people
        .sort((left, right) => left.localeCompare(right))
        .map((name) => String(name).replace(/[*_`~|\\]/g, "\\$&"))
        .join(" · ");
      return `**${localTime(group.zone, now)}** · ${group.zone.name}\n${names}`;
    });

  return new EmbedBuilder()
    .setColor("#FF4500")
    .setTitle("the clocks")
    .setDescription(
      lines.length > 0 ? lines.join("\n\n").slice(0, 4096) : "nobody has picked a time yet. the menu is in #welcome."
    )
    .setFooter({ text: "venera studio" });
}

async function showClocks(interaction) {
  await interaction.guild.members.fetch();
  await interaction.editReply({ embeds: [clocksEmbed(interaction.guild)], allowedMentions: { parse: [] } });
}

module.exports = { chooseTimezone, showClocks };
