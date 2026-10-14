import { readFile, writeFile } from 'node:fs/promises';
import {
  ChannelType,
  Client,
  GatewayIntentBits,
  GuildDefaultMessageNotifications,
  GuildExplicitContentFilter,
  GuildVerificationLevel,
  PermissionsBitField,
  Routes,
  VideoQualityMode,
} from 'discord.js';
import {
  AFK_TIMEOUT,
  CATEGORIES,
  MARKERS,
  COLORS,
  ROLES,
  SERVER_NAME,
  TAGLINE,
  TIMEZONES,
  allChannels,
  assertBlueprint,
  rulesEmbed,
  welcomeEmbed,
} from './brand.js';
import { buildOverwrites } from './permissions.js';
import {
  SETUP_REASON,
  emptyManifest,
  explain,
  fileExists,
  isDirectRun,
  loadEnv,
  log,
  paths,
  requireEnv,
  sameName,
} from './util.js';

const HELP = `usage
  npm run setup
  npm run setup -- --reset

--reset deletes the channels, categories, and roles this script manages, then builds them again.
`;

let problems = 0;

function soft(message) {
  problems += 1;
  log.warn(message);
}

function noted(action, name) {
  log.ok(`${action.padEnd(9, ' ')}${name}`);
}

/**
 * One-shot builder for Venera's Lounge.
 *
 * Identity is the name. A second run finds the role or channel and edits it
 * in place, so nothing is duplicated. Ids are also written to
 * .venera-manifest.json so --reset can still find something that was renamed.
 */
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(HELP);
    return;
  }

  const unknown = process.argv
    .slice(2)
    .filter((arg) => arg.startsWith('-') && !['--reset', '--help', '-h'].includes(arg));
  if (unknown.length) log.warn(`ignoring ${unknown.join(' ')}`);

  let client;
  let code = 0;
  try {
    loadEnv();
    const { token, guildId } = requireEnv();
    assertBlueprint();
    const reset = process.argv.includes('--reset');

    client = new Client({ intents: [GatewayIntentBits.Guilds] });
    client.on('error', (error) => log.error(explain(error)));
    await client.login(token);
    await configure(client, guildId, reset);
    if (problems > 0) code = 1;
  } catch (error) {
    if (!error.handled) log.error(explain(error));
    code = 1;
  } finally {
    client?.destroy();
  }
  process.exit(code);
}

async function configure(client, guildId, reset) {
  const guild = await client.guilds.fetch(guildId);
  await guild.channels.fetch();
  await guild.roles.fetch();

  log.banner(reset ? 'setup  ·  reset' : 'setup');
  console.log(`server  ${guild.name}`);
  console.log(`id      ${guild.id}`);

  const haystack = guild.name.toLowerCase();
  if (!haystack.includes('venera') && !haystack.includes('lounge')) {
    log.warn(`this server is named "${guild.name}". it will be renamed to ${SERVER_NAME}.`);
  }

  let manifest = await loadManifest(guild.id);
  if (reset) {
    await resetManaged(guild, manifest);
    manifest = emptyManifest(guild.id);
    await guild.channels.fetch();
    await guild.roles.fetch();
  }

  const built = emptyManifest(guild.id);
  let finished = false;
  try {
    const roles = await stage('roles', () => ensureRoles(guild, manifest, built));
    await orderRoles(guild, roles);
    await ensureTimezoneRoles(guild, manifest, built);

    const placed = await stage('channels', () => ensureChannels(guild, roles, manifest, built));
    await arrangeChannels(guild, placed);
    await applyVoiceNotes(client, placed);

    await stage('messages', () => ensureMessages(guild, manifest, built));
    await applySettings(guild, built);
    await applyAssets(guild);
    await houseMembers(guild, roles);

    log.step('manifest');
    await saveManifest(built);
    noted('saved', '.venera-manifest.json');
    finished = true;
  } finally {
    if (!finished && hasIds(built)) {
      await saveManifest(built).catch(() => {});
    }
  }

  if (!finished) return;

  if (problems === 0) {
    log.step('done');
    console.log('  new people only see arrivals until they have guest.');
    console.log('  leave `npm run bot` running and that role is handed out for you.\n');
  } else {
    log.error(
      `finished with ${problems} problem${problems === 1 ? '' : 's'}. fix them and run npm run setup again. running it again updates what is already there.`,
    );
  }
}

async function stage(title, fn) {
  log.step(title);
  try {
    return await fn();
  } catch (error) {
    log.error(`${title} — ${explain(error)}`);
    const wrapped = new Error(`${title} failed`);
    wrapped.handled = true;
    throw wrapped;
  }
}

async function ensureRoles(guild, manifest, built) {
  const roles = {};
  for (const spec of ROLES) {
    const role = await ensureRole(guild, spec, manifest);
    roles[spec.key] = role;
    built.roles[spec.key] = role.id;
  }
  return roles;
}

async function ensureRole(guild, spec, manifest) {
  const named = [...guild.roles.cache.values()].filter(
    (role) => !role.managed && role.id !== guild.id && sameName(role.name, spec.name),
  );
  if (named.length > 1) {
    log.warn(`${named.length} roles named ${spec.name}. keeping one. --reset removes the extras.`);
  }

  let role = null;
  const saved = manifest.roles?.[spec.key];
  if (saved) {
    const existing = guild.roles.cache.get(saved);
    if (existing && !existing.managed && existing.id !== guild.id) role = existing;
  }
  if (!role) {
    role = named.sort((left, right) => right.position - left.position)[0] ?? null;
  }

  const desired = new PermissionsBitField(spec.permissions);
  if (!role) {
    role = await guild.roles.create({
      name: spec.name,
      colors: { primaryColor: spec.color },
      hoist: spec.hoist,
      mentionable: false,
      permissions: desired,
      reason: SETUP_REASON,
    });
    noted('created', spec.name);
    return role;
  }

  const drifted =
    role.name !== spec.name ||
    role.colors?.primaryColor !== spec.color ||
    role.colors?.secondaryColor != null ||
    role.colors?.tertiaryColor != null ||
    role.hoist !== spec.hoist ||
    role.mentionable ||
    !role.permissions.equals(desired);

  if (!drifted) {
    noted('kept', spec.name);
    return role;
  }

  await role.edit({
    name: spec.name,
    colors: { primaryColor: spec.color, secondaryColor: null, tertiaryColor: null },
    hoist: spec.hoist,
    mentionable: false,
    permissions: desired,
    reason: SETUP_REASON,
  });
  noted('updated', spec.name);
  return role;
}

async function ensureTimezoneRoles(guild, manifest, built) {
  log.step('time');
  built.timezones = {};
  for (const zone of TIMEZONES) {
    const role = await ensureRole(
      guild,
      {
        key: zone.key,
        name: zone.name,
        color: COLORS.guest,
        hoist: false,
        permissions: [],
      },
      { roles: manifest.timezones ?? {} },
    );
    built.timezones[zone.key] = role.id;
  }
}

async function orderRoles(guild, roles) {
  await guild.roles.fetch();
  const me = await guild.members.fetchMe();
  const topDown = [...ROLES].sort((left, right) => right.rank - left.rank);
  for (const spec of topDown) {
    roles[spec.key] = guild.roles.cache.get(roles[spec.key].id) ?? roles[spec.key];
  }

  const ceiling = me.roles.highest.position;
  if (ceiling - topDown.length < 1) {
    soft(
      `the bot role is too low to order ${topDown.length} roles under it. drag the bot role to the top, then run setup again.`,
    );
    return;
  }

  let position = ceiling - 1;
  const updates = [];
  let dirty = false;
  for (const spec of topDown) {
    const role = roles[spec.key];
    if (role.position !== position) dirty = true;
    updates.push({ role: role.id, position });
    position -= 1;
  }

  if (!dirty) {
    noted('kept', 'role order');
    return;
  }

  try {
    await guild.roles.setPositions(updates);
    noted('updated', 'role order · venus · inner circle · guest · bots');
  } catch (error) {
    soft(`could not reorder roles — ${explain(error)}`);
  }
}

async function ensureChannels(guild, roles, manifest, built) {
  const everyone = guild.roles.everyone;
  if (!everyone) throw new Error('Could not read @everyone.');

  const ids = {
    everyone: everyone.id,
    guest: roles.guest.id,
    inner: roles.inner.id,
    bots: roles.bots.id,
  };

  const placed = [];
  for (const spec of CATEGORIES) {
    const category = await ensureCategory(guild, spec, manifest, ids);
    built.categories[spec.key] = category.id;

    const children = [];
    for (const channelSpec of spec.channels) {
      const channel = await ensureChannel(guild, category, channelSpec, manifest);
      built.channels[channelSpec.key] = channel.id;
      children.push(channel);
    }
    placed.push({ spec, category, channels: children });
  }
  return placed;
}

async function ensureCategory(guild, spec, manifest, ids) {
  const overwrites = buildOverwrites(spec.area, ids);
  let category = findSaved(guild, manifest.categories?.[spec.key], ChannelType.GuildCategory);
  if (!category) {
    const named = [...guild.channels.cache.values()].filter(
      (channel) => channel.type === ChannelType.GuildCategory && sameName(channel.name, spec.name),
    );
    if (named.length > 1) log.warn(`${named.length} categories named ${spec.name}. keeping one.`);
    category = named[0] ?? null;
  }

  if (!category) {
    category = await guild.channels.create({
      name: spec.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites: overwrites,
      reason: SETUP_REASON,
    });
    noted('created', spec.name);
    return category;
  }

  const renamed = category.name !== spec.name;
  if (renamed) await category.edit({ name: spec.name, reason: SETUP_REASON });
  await category.permissionOverwrites.set(overwrites, SETUP_REASON);
  noted(renamed ? 'updated' : 'synced', spec.name);
  if (category.name !== spec.name) {
    log.warn(`discord stored this category as "${category.name}".`);
  }
  return category;
}

async function ensureChannel(guild, category, spec, manifest) {
  const type = spec.kind === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;
  let channel = findSaved(guild, manifest.channels?.[spec.key], type);
  if (!channel) {
    const named = [...guild.channels.cache.values()].filter(
      (item) => item.type === type && sameName(item.name, spec.name),
    );
    if (named.length > 1) {
      log.warn(`${named.length} channels named ${spec.name}. keeping one. --reset removes the extras.`);
    }
    channel =
      named.sort((left, right) => {
        const leftScore = left.parentId === category.id ? 1 : 0;
        const rightScore = right.parentId === category.id ? 1 : 0;
        return rightScore - leftScore;
      })[0] ?? null;
  }

  const label = spec.kind === 'voice' ? spec.name : `#${spec.name}`;
  if (!channel) {
    const options = {
      name: spec.name,
      type,
      parent: category.id,
      reason: SETUP_REASON,
    };
    if (spec.kind === 'text') {
      options.topic = spec.topic;
      options.nsfw = false;
    } else {
      options.bitrate = spec.bitrate;
      options.userLimit = spec.userLimit;
      options.videoQualityMode = VideoQualityMode.Auto;
    }
    channel = await guild.channels.create(options);
    noted('created', label);
    return channel;
  }

  const edit = { reason: SETUP_REASON };
  if (channel.name !== spec.name) edit.name = spec.name;
  if (spec.kind === 'text') {
    if (channel.topic !== spec.topic) edit.topic = spec.topic;
    if (channel.nsfw) edit.nsfw = false;
  } else if (channel.bitrate !== spec.bitrate) {
    edit.bitrate = spec.bitrate;
  }
  if (spec.kind === 'voice') {
    if (channel.userLimit !== spec.userLimit) edit.userLimit = spec.userLimit;
    if (channel.videoQualityMode !== VideoQualityMode.Auto) {
      edit.videoQualityMode = VideoQualityMode.Auto;
    }
  }

  if (Object.keys(edit).length > 1) {
    try {
      await channel.edit(edit);
    } catch (error) {
      // 96kbps is the unboosted ceiling. Drop to 64 if this server rejects it.
      if (edit.bitrate && edit.bitrate > 64_000 && error.code === 50035) {
        edit.bitrate = 64_000;
        await channel.edit(edit);
        log.warn(`${label} bitrate capped at 64kbps`);
      } else {
        throw error;
      }
    }
    noted('updated', label);
  } else {
    noted('kept', label);
  }
  return channel;
}

function findSaved(guild, id, type) {
  if (!id) return null;
  const channel = guild.channels.cache.get(id);
  if (!channel || channel.type !== type) return null;
  return channel;
}

async function arrangeChannels(guild, placed) {
  const positions = [];
  let position = 0;
  for (const group of placed) {
    positions.push({ channel: group.category.id, position: position++ });
    for (const channel of group.channels) {
      positions.push({
        channel: channel.id,
        parent: group.category.id,
        position: position++,
        lockPermissions: true,
      });
    }
  }

  try {
    await guild.channels.setPositions(positions);
    noted('synced', 'channel order');
    return;
  } catch {
    try {
      for (const group of placed) {
        for (const channel of group.channels) {
          await channel.setParent(group.category, { lockPermissions: true, reason: SETUP_REASON });
        }
      }
      noted('synced', 'channel order');
    } catch (fallbackError) {
      soft(`could not order channels — ${explain(fallbackError)}`);
    }
  }
}

async function applyVoiceNotes(client, placed) {
  for (const group of placed) {
    for (let index = 0; index < group.spec.channels.length; index += 1) {
      const spec = group.spec.channels[index];
      const channel = group.channels[index];
      if (!spec.status || !channel) continue;
      try {
        await client.rest.put(Routes.channelVoiceStatus(channel.id), {
          body: { status: spec.status },
          reason: SETUP_REASON,
        });
        noted('status', `${spec.name} · ${spec.status}`);
      } catch (error) {
        soft(`could not set the ${spec.name} note — ${explain(error)}`);
      }
    }
  }
}

async function ensureMessages(guild, manifest, built) {
  built.messages.welcome = await upsertEmbed(
    guild,
    built.channels.welcome,
    MARKERS.welcome,
    welcomeEmbed(),
    manifest.messages?.welcome,
  );
  built.messages.rules = await upsertEmbed(
    guild,
    built.channels.rules,
    MARKERS.rules,
    rulesEmbed(),
    manifest.messages?.rules,
  );
}

async function upsertEmbed(guild, channelId, marker, embed, knownId) {
  const channel = guild.channels.cache.get(channelId) ?? (await guild.channels.fetch(channelId));
  if (channel?.type !== ChannelType.GuildText) {
    throw new Error('Expected a text channel for the house message.');
  }

  const existing = await findMarked(channel, marker, knownId);
  if (existing) {
    await existing.edit({ embeds: [embed] });
    await pinQuietly(existing);
    noted('refreshed', `#${channel.name}`);
    return existing.id;
  }

  const sent = await channel.send({ embeds: [embed] });
  await pinQuietly(sent);
  noted('posted', `#${channel.name}`);
  return sent.id;
}

async function findMarked(channel, marker, knownId) {
  if (knownId) {
    try {
      const message = await channel.messages.fetch(knownId);
      if (message.author.id === channel.client.user.id) return message;
    } catch {
      // The old card was deleted. Fall through and look again.
    }
  }

  try {
    const pins = await channel.messages.fetchPins();
    const pinned = pins.items
      .map((item) => item.message)
      .find(
        (message) =>
          message.author.id === channel.client.user.id && message.embeds[0]?.footer?.text === marker,
      );
    if (pinned) return pinned;
  } catch {
    // Pins are a convenience. The manifest and recent history still work.
  }

  const recent = await channel.messages.fetch({ limit: 100 });
  return (
    recent.find(
      (message) =>
        message.author.id === channel.client.user.id && message.embeds[0]?.footer?.text === marker,
    ) ?? null
  );
}

async function pinQuietly(message) {
  if (message.pinned) return;
  try {
    await message.pin(SETUP_REASON);
  } catch (error) {
    log.warn(`could not pin in #${message.channel?.name ?? 'channel'} — ${explain(error)}`);
  }
}

async function applySettings(guild, built) {
  log.step('settings');
  const welcome = guild.channels.cache.get(built.channels.welcome);
  const afk = guild.channels.cache.get(built.channels.afk);
  if (!welcome || !afk) throw new Error('Welcome or afk channel is missing.');

  await guild.edit({
    name: SERVER_NAME,
    verificationLevel: GuildVerificationLevel.Low,
    defaultMessageNotifications: GuildDefaultMessageNotifications.OnlyMentions,
    explicitContentFilter: GuildExplicitContentFilter.AllMembers,
    systemChannel: welcome.id,
    afkChannel: afk.id,
    afkTimeout: AFK_TIMEOUT,
    reason: SETUP_REASON,
  });
  noted('set', `name · ${SERVER_NAME}`);
  noted('set', 'verification · low');
  noted('set', 'notifications · mentions only');
  noted('set', 'explicit filter · all members');
  noted('set', 'system messages · #welcome');
  noted('set', 'afk · 15 min · afk');

  try {
    await guild.edit({ description: TAGLINE, reason: SETUP_REASON });
    noted('set', `description · ${TAGLINE}`);
  } catch (error) {
    // Some servers only accept a description once Community is enabled.
    // The rest of the lounge is already in place, so this stays a warning.
    log.warn(`description left unchanged — ${explain(error)}`);
  }
}

async function applyAssets(guild) {
  if (await fileExists(paths.icon)) {
    try {
      await guild.setIcon(await readFile(paths.icon), SETUP_REASON);
      noted('set', 'icon');
    } catch (error) {
      soft(`icon — ${explain(error)}`);
    }
  } else {
    log.skip('icon — assets/icon.png not in the project');
  }

  if (!(await fileExists(paths.banner))) {
    log.skip('banner — assets/banner.png not in the project');
    return;
  }
  if (!guild.features.includes('BANNER')) {
    log.skip('banner — discord only accepts one on a server with boost level 2');
    return;
  }
  try {
    await guild.setBanner(await readFile(paths.banner), SETUP_REASON);
    noted('set', 'banner');
  } catch (error) {
    soft(`banner — ${explain(error)}`);
  }
}

async function houseMembers(guild, roles) {
  log.step('members');
  try {
    const owner = await guild.members.fetch(guild.ownerId);
    if (!owner.user.bot && !owner.roles.cache.has(roles.venus.id)) {
      await owner.roles.add(roles.venus, SETUP_REASON);
      noted('venus', owner.displayName);
    }
  } catch (error) {
    soft(`could not give the owner venus — ${explain(error)}`);
  }

  let members;
  try {
    members = await listMembers(guild);
  } catch (error) {
    soft(`could not list members — ${explain(error)}`);
    log.warn('enable Server Members Intent, then run setup again. npm run bot still greets new people.');
    return;
  }

  let changes = 0;
  for (const member of members.values()) {
    try {
      if (member.user.bot) {
        if (!member.roles.cache.has(roles.bots.id)) {
          await member.roles.add(roles.bots, SETUP_REASON);
          noted('bots', member.displayName);
          changes += 1;
        }
        continue;
      }
      if (member.id === guild.ownerId) continue;
      const housed = [roles.venus, roles.inner, roles.guest].some((role) => member.roles.cache.has(role.id));
      if (!housed) {
        await member.roles.add(roles.guest, SETUP_REASON);
        noted('guest', member.displayName);
        changes += 1;
      }
    } catch (error) {
      soft(`could not update ${member.displayName} — ${explain(error)}`);
    }
  }
  if (changes === 0) noted('kept', 'house roles');
}

async function listMembers(guild) {
  const members = new Map();
  let after;
  for (let page = 0; page < 20; page += 1) {
    const batch = await guild.members.list({ limit: 1000, after });
    for (const member of batch.values()) members.set(member.id, member);
    if (batch.size < 1000) break;
    after = batch.last()?.id;
    if (!after) break;
  }
  return members;
}

async function resetManaged(guild, manifest) {
  log.step('reset');
  log.warn('deleting managed channels, categories, and roles, then rebuilding.');

  const channelIds = new Set([
    ...Object.values(manifest.channels ?? {}),
    ...Object.values(manifest.categories ?? {}),
  ]);
  const roleIds = new Set([
    ...Object.values(manifest.roles ?? {}),
    ...Object.values(manifest.timezones ?? {}),
  ]);

  for (const spec of allChannels()) {
    const type = spec.kind === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;
    for (const channel of guild.channels.cache.values()) {
      if (channel.type === type && sameName(channel.name, spec.name)) channelIds.add(channel.id);
    }
  }
  for (const spec of CATEGORIES) {
    for (const channel of guild.channels.cache.values()) {
      if (channel.type === ChannelType.GuildCategory && sameName(channel.name, spec.name)) {
        channelIds.add(channel.id);
      }
    }
  }
  for (const spec of [...ROLES, ...TIMEZONES]) {
    for (const role of guild.roles.cache.values()) {
      if (!role.managed && role.id !== guild.id && sameName(role.name, spec.name)) roleIds.add(role.id);
    }
  }

  const edits = { reason: SETUP_REASON };
  let clearing = false;
  if (guild.afkChannelId && channelIds.has(guild.afkChannelId)) {
    edits.afkChannel = null;
    clearing = true;
  }
  if (guild.systemChannelId && channelIds.has(guild.systemChannelId)) {
    edits.systemChannel = null;
    clearing = true;
  }
  if (clearing) {
    try {
      await guild.edit(edits);
    } catch (error) {
      soft(`could not clear afk / system channel — ${explain(error)}`);
    }
  }

  const channels = [...channelIds]
    .map((id) => guild.channels.cache.get(id))
    .filter(Boolean)
    .sort((left, right) => Number(left.type === ChannelType.GuildCategory) - Number(right.type === ChannelType.GuildCategory));

  for (const channel of channels) {
    try {
      const label =
        channel.type === ChannelType.GuildText ? `#${channel.name}` : channel.name;
      await channel.delete(SETUP_REASON);
      noted('deleted', label);
    } catch (error) {
      soft(`could not delete ${channel.name} — ${explain(error)}`);
    }
  }

  for (const id of roleIds) {
    const role = guild.roles.cache.get(id);
    if (!role || role.managed || role.id === guild.id) continue;
    try {
      await role.delete(SETUP_REASON);
      noted('deleted', role.name);
    } catch (error) {
      soft(`could not delete role ${role.name} — ${explain(error)}`);
    }
  }
}

function hasIds(manifest) {
  return Object.keys(manifest.roles).length + Object.keys(manifest.channels).length > 0;
}

async function loadManifest(guildId) {
  try {
    const data = JSON.parse(await readFile(paths.manifest, 'utf8'));
    if (data.guildId !== guildId) {
      log.warn('ignoring .venera-manifest.json because it belongs to a different server.');
      return emptyManifest(guildId);
    }
    return {
      version: 1,
      guildId,
      roles: data.roles ?? {},
      timezones: data.timezones ?? {},
      categories: data.categories ?? {},
      channels: data.channels ?? {},
      messages: data.messages ?? {},
    };
  } catch (error) {
    if (error.code !== 'ENOENT') log.warn(`could not read the manifest — ${explain(error)}`);
    return emptyManifest(guildId);
  }
}

async function saveManifest(manifest) {
  await writeFile(paths.manifest, `${JSON.stringify(manifest, null, 2)}\n`);
}

if (isDirectRun(import.meta.url)) {
  main();
}
