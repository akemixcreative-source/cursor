import {
  ActivityType,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { COLORS, CURSOR_CHANNEL, doorEmbed } from './brand.js';
import { CursorBridge, cursorSettings } from './cursor.js';
import { isTimezoneName, timezoneMenu, withTimezone, zoneByKey, zoneOf } from './time.js';
import {
  DOOR_REASON,
  explain,
  isDirectRun,
  loadEnv,
  log,
  paths,
  requireEnv,
  sameName,
} from './util.js';

const HELP = `usage
  npm run bot
`;

const missingRoles = new Set();
const recentArrivals = new Set();
let cursorBusy = false;

/**
 * Always-on door for Venera's Lounge.
 *
 * Setup leaves arrivals readable by everyone and hides the rest until a
 * person has the guest role. This process hands that role out, posts a
 * short welcome, asks which timezone they keep, answers /lounge with who
 * is in voice, and sends /cursor questions to a Cursor cloud agent.
 */
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(HELP);
    return;
  }

  loadEnv();
  const { token, guildId } = requireEnv();
  const cursor = cursorSettings();
  const bridge = new CursorBridge({ ...cursor, statePath: paths.bridge });
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  client.on('error', (error) => log.error(explain(error)));
  client.once(Events.ClientReady, (ready) => onReady(ready, guildId, Boolean(cursor.apiKey)));
  client.on(Events.GuildMemberAdd, (member) => {
    receive(member, guildId).catch((error) => log.error(explain(error)));
  });
  client.on(Events.GuildMemberUpdate, (before, after) => {
    if (before.pending && !after.pending) {
      receive(after, guildId).catch((error) => log.error(explain(error)));
    }
  });
  client.on(Events.InteractionCreate, (interaction) => {
    answer(interaction, guildId, bridge).catch((error) => log.error(explain(error)));
  });

  const shutdown = () => {
    log.ok('signing out');
    client.destroy();
    process.exit(0);
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  try {
    await client.login(token);
  } catch (error) {
    log.error(explain(error));
    client.destroy();
    process.exit(1);
  }
}

function commandList() {
  return [
    new SlashCommandBuilder().setName('lounge').setDescription('who is in voice right now'),
    new SlashCommandBuilder()
      .setName('cursor')
      .setDescription('send a question to cursor')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addStringOption((option) =>
        option.setName('query').setDescription('what to ask').setRequired(true).setMaxLength(4000),
      )
      .addBooleanOption((option) =>
        option.setName('build').setDescription('let cursor change the project and open a pull request'),
      )
      .addBooleanOption((option) =>
        option.setName('fresh').setDescription('start a new cursor chat'),
      ),
    new SlashCommandBuilder().setName('timezone').setDescription('set the time you are on'),
  ];
}

async function onReady(client, guildId, cursorReady) {
  log.banner('door');
  log.ok(`signed in as ${client.user.tag}`);
  try {
    client.user.setPresence({
      status: 'online',
      activities: [{ name: 'the lounge', type: ActivityType.Watching }],
    });
  } catch (error) {
    log.warn(`presence — ${explain(error)}`);
  }

  try {
    const guild = await client.guilds.fetch(guildId);
    // Guild commands show up immediately. This replaces the bot's command
    // list in this server with /lounge, so a second start does not duplicate it.
    await guild.commands.set(commandList());
    log.ok('registered  /lounge  /cursor  /timezone');
    if (!cursorReady) log.warn('/cursor needs CURSOR_API_KEY in .env');
  } catch (error) {
    log.error(`could not register commands — ${explain(error)}`);
    if (error.code === 50001) {
      log.warn('re-invite the bot with the bot and applications.commands scopes.');
    }
  }
}

async function receive(member, guildId) {
  if (member.guild.id !== guildId) return;
  if (member.pending) return;
  if (!claim(member.id)) return;

  if (member.user.bot) {
    await give(member, 'bots');
    return;
  }

  try {
    await give(member, 'guest');
  } catch (error) {
    log.error(`role — ${explain(error)}`);
  }

  try {
    await announce(member);
  } catch (error) {
    log.error(`welcome — ${explain(error)}`);
  }

}

function claim(id) {
  if (recentArrivals.has(id)) return false;
  recentArrivals.add(id);
  setTimeout(() => recentArrivals.delete(id), 5000).unref();
  return true;
}

async function give(member, name) {
  let role = member.guild.roles.cache.find((item) => sameName(item.name, name));
  if (!role) {
    const roles = await member.guild.roles.fetch();
    role = roles.find((item) => sameName(item.name, name));
  }
  if (!role) {
    if (!missingRoles.has(name)) {
      missingRoles.add(name);
      log.warn(`the ${name} role is missing. run npm run setup.`);
    }
    return;
  }
  if (member.roles.cache.has(role.id)) return;
  await member.roles.add(role, DOOR_REASON);
  log.ok(`${name.padEnd(9, ' ')}${member.displayName}`);
}

async function announce(member) {
  const channel = member.guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildText && item.name === 'welcome',
  );
  if (!channel) {
    log.warn('missing #welcome. run npm run setup.');
    return;
  }

  const name = member.displayName || member.user.username;
  await channel.send({
    content: `${member}`,
    embeds: [doorEmbed(name)],
    allowedMentions: { parse: [], users: [member.id] },
  });
  log.ok(`${'welcome'.padEnd(9, ' ')}${name}`);
}

async function answer(interaction, guildId, bridge) {
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('tz:')) {
    await chooseTimezone(interaction, guildId);
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'timezone') {
    await offerTimezone(interaction, guildId);
    return;
  }
  if (interaction.commandName === 'cursor') {
    await askCursor(interaction, guildId, bridge);
    return;
  }
  if (interaction.commandName !== 'lounge') return;

  if (interaction.guildId !== guildId) {
    await interaction.reply({
      content: "this command lives in venera's lounge.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply();
  try {
    const guild = interaction.guild ?? (await interaction.client.guilds.fetch(guildId));
    await guild.channels.fetch();
    await guild.members.fetch().catch(() => {});
    await interaction.editReply({
      embeds: [loungeEmbed(guild)],
      allowedMentions: { parse: [] },
    });
  } catch (error) {
    log.error(explain(error));
    const payload = { content: 'could not look at the rooms just now.' };
    if (interaction.deferred || interaction.replied) await interaction.editReply(payload);
    else await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral });
  }
}

async function askCursor(interaction, guildId, bridge) {
  if (interaction.guildId !== guildId) {
    await interaction.reply({
      content: "this command lives in venera's lounge.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const guild = interaction.guild ?? (await interaction.client.guilds.fetch(guildId));
  if (interaction.user.id !== guild.ownerId) {
    await interaction.reply({
      content: 'only you can send questions to cursor.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (interaction.channel?.name !== CURSOR_CHANNEL) {
    await interaction.reply({
      content: 'ask in #cursor.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const query = interaction.options.getString('query', true).trim();
  if (!query) {
    await interaction.reply({ content: 'write the question after the command.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!bridge.apiKey) {
    await interaction.reply({
      content: 'add CURSOR_API_KEY to .env and restart the bot. the key is on Cursor Dashboard → API Keys.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (cursorBusy) {
    await interaction.reply({ content: 'cursor is still on the last question.', flags: MessageFlags.Ephemeral });
    return;
  }

  const name = interaction.member?.displayName || interaction.user.username;
  const build = interaction.options.getBoolean('build') ?? false;
  const fresh = interaction.options.getBoolean('fresh') ?? false;
  cursorBusy = true;
  await interaction.deferReply();
  try {
    const sent = await bridge.send({ name, query, build, fresh });
    log.ok(`${'cursor'.padEnd(9, ' ')}${name}`);
    await interaction.editReply({
      embeds: [sentEmbed(sent, query)],
      allowedMentions: { parse: [] },
    });
    deliverCursor(interaction, bridge, sent).finally(() => {
      cursorBusy = false;
    });
  } catch (error) {
    cursorBusy = false;
    log.error(explain(error));
    const payload = { content: error.message || 'cursor could not take that question.' };
    if (interaction.deferred || interaction.replied) await interaction.editReply(payload);
    else await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral });
  }
}

async function deliverCursor(interaction, bridge, sent) {
  try {
    const run = await bridge.wait(sent.agentId, sent.runId);
    const embeds = [resultEmbed(run, sent)];
    const payload = {
      content: `${interaction.user}`,
      embeds,
      allowedMentions: { parse: [], users: [interaction.user.id] },
    };
    try {
      await interaction.followUp(payload);
    } catch {
      await interaction.channel?.send(payload);
    }
  } catch (error) {
    log.error(explain(error));
    const payload = {
      content: `${interaction.user} cursor could not finish that question. ${sent.url}`,
      allowedMentions: { parse: [], users: [interaction.user.id] },
    };
    await interaction.followUp(payload).catch(() => interaction.channel?.send(payload));
  }
}

function sentEmbed(sent, query) {
  return new EmbedBuilder()
    .setColor(COLORS.flame)
    .setTitle(sent.continued ? 'still with cursor' : 'sent to cursor')
    .setURL(sent.url)
    .setDescription(plain(query).slice(0, 500))
    .setFooter({ text: sent.build ? 'cursor will change the project' : 'cursor is answering' });
}

function resultEmbed(run, sent) {
  const finished = run?.status === 'FINISHED';
  const text =
    typeof run?.result === 'string' && run.result.trim()
      ? run.result.trim()
      : finished
        ? 'cursor finished. the chat has the rest.'
        : run
          ? 'cursor stopped before it could answer.'
          : 'cursor is still working. open the chat for the rest.';
  return new EmbedBuilder()
    .setColor(COLORS.flame)
    .setTitle('cursor')
    .setURL(sent.url)
    .setDescription(text.slice(0, 4000))
    .setFooter({ text: 'venera studio' });
}

function loungeEmbed(guild) {
  const channels = [...guild.channels.cache.values()]
    .filter((channel) => channel.type === ChannelType.GuildVoice)
    .sort((left, right) => left.rawPosition - right.rawPosition);

  const blocks = [];
  for (const channel of channels) {
    const people = [...channel.members.values()].sort((left, right) =>
      (left.displayName || '').localeCompare(right.displayName || ''),
    );
    if (people.length === 0) continue;
    blocks.push(`**${plain(channel.name)}**\n${people.map(personLabel).join(' · ')}`);
  }

  const description = blocks.length > 0 ? blocks.join('\n\n') : 'the rooms are empty.';
  return new EmbedBuilder()
    .setColor(COLORS.flame)
    .setTitle('the lounge')
    .setDescription(description.slice(0, 4096))
    .setFooter({ text: 'venera studio' });
}

async function offerTimezone(interaction, guildId) {
  if (interaction.guildId !== guildId) {
    await interaction.reply({
      content: "this command lives in venera's lounge.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.reply({
    content: 'what time are you on? india is ist.',
    components: [timezoneMenu(interaction.user.id)],
    flags: MessageFlags.Ephemeral,
  });
}

async function chooseTimezone(interaction, guildId) {
  const shared = interaction.customId === 'tz';
  const ownerId = shared ? interaction.user.id : interaction.customId.slice(3);
  if (interaction.user.id !== ownerId) {
    await interaction.reply({ content: 'that one is for someone else.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (interaction.guildId && interaction.guildId !== guildId) {
    await interaction.reply({
      content: "this menu lives in venera's lounge.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const zone = zoneByKey(interaction.values[0]);
  if (!zone) {
    await interaction.reply(quiet('that timezone is not on the list.'));
    return;
  }

  // Discord drops the click if it is not acknowledged within three seconds.
  // The role change can take longer than that, so answer first.
  if (shared) await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  else await interaction.deferUpdate();

  try {
    const guild = interaction.guild ?? (await interaction.client.guilds.fetch(guildId));
    const member = await guild.members.fetch(interaction.user.id);
    await applyTimezone(member, zone);
    await stampTimezone(member, zone);
    log.ok(`${zone.name.padEnd(9, ' ')}${member.displayName}`);
    if (shared) {
      await interaction.editReply({ content: `you're on ${zone.name}.` });
      await interaction.message.edit({ components: [timezoneMenu()] });
    } else {
      await interaction.editReply({
        content: `you're on ${zone.name}.`,
        components: [],
      });
    }
  } catch (error) {
    log.error(explain(error));
    const payload = quiet('the timezone roles are missing. run npm run setup, then try again.');
    if (shared) await interaction.editReply(payload);
    else if (interaction.deferred || interaction.replied) await interaction.followUp(payload);
    else await interaction.reply(payload);
  }
}

function quiet(content) {
  return { content, flags: MessageFlags.Ephemeral };
}

async function applyTimezone(member, zone) {
  const roles = await member.guild.roles.fetch();
  const wanted = roles.find((role) => sameName(role.name, zone.name));
  if (!wanted) {
    const error = new Error(`missing ${zone.name} role`);
    error.handled = true;
    throw error;
  }

  const extras = roles.filter(
    (role) => role.id !== wanted.id && isTimezoneName(role.name) && member.roles.cache.has(role.id),
  );
  if (extras.size) await member.roles.remove([...extras.values()], DOOR_REASON);
  if (!member.roles.cache.has(wanted.id)) await member.roles.add(wanted, DOOR_REASON);
}

async function stampTimezone(member, zone) {
  if (member.user.bot || member.id === member.guild.ownerId) return;
  const current = member.nickname || member.user.username;
  const next = withTimezone(current, zone.name);
  if (!next || next === member.nickname) return;
  try {
    await member.setNickname(next, DOOR_REASON);
  } catch (error) {
    log.warn(`nickname — ${explain(error)}`);
  }
}

function personLabel(member) {
  const zone = zoneOf(member);
  const shown = member.displayName || member.user?.username || 'someone';
  const base = zone ? shown.replace(new RegExp(` · ${zone.name}$`), '') : shown;
  const name = `${plain(base)}${zone ? ` · ${zone.name}` : ''}`;
  const muted = Boolean(member.voice?.selfMute || member.voice?.serverMute);
  return muted ? `${name} (muted)` : name;
}

function plain(value) {
  return String(value).replace(/[*_`~|\\]/g, '\\$&');
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    log.error(explain(error));
    process.exit(1);
  });
}
