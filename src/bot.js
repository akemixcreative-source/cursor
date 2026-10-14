import {
  ActivityType,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} from 'discord.js';
import { COLORS, doorEmbed } from './brand.js';
import {
  DOOR_REASON,
  explain,
  isDirectRun,
  loadEnv,
  log,
  requireEnv,
  sameName,
} from './util.js';

const HELP = `usage
  npm run bot
`;

const missingRoles = new Set();
const recentArrivals = new Set();

/**
 * Always-on door for Venera's Lounge.
 *
 * Setup leaves arrivals readable by everyone and hides the rest until a
 * person has the guest role. This process hands that role out, posts a
 * short welcome, and answers /lounge with who is in voice.
 */
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(HELP);
    return;
  }

  loadEnv();
  const { token, guildId } = requireEnv();
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  client.on('error', (error) => log.error(explain(error)));
  client.once(Events.ClientReady, (ready) => onReady(ready, guildId));
  client.on(Events.GuildMemberAdd, (member) => {
    receive(member, guildId).catch((error) => log.error(explain(error)));
  });
  client.on(Events.GuildMemberUpdate, (before, after) => {
    if (before.pending && !after.pending) {
      receive(after, guildId).catch((error) => log.error(explain(error)));
    }
  });
  client.on(Events.InteractionCreate, (interaction) => {
    answer(interaction, guildId).catch((error) => log.error(explain(error)));
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

async function onReady(client, guildId) {
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
    await guild.commands.set([
      new SlashCommandBuilder().setName('lounge').setDescription('who is in voice right now'),
    ]);
    log.ok('registered  /lounge');
  } catch (error) {
    log.error(`could not register /lounge — ${explain(error)}`);
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

async function answer(interaction, guildId) {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'lounge') return;

  if (interaction.guildId !== guildId) {
    await interaction.reply({
      content: "this command lives in venera's lounge.",
      ephemeral: true,
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
    else await interaction.reply({ ...payload, ephemeral: true });
  }
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

function personLabel(member) {
  const name = plain(member.displayName || member.user?.username || 'someone');
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
