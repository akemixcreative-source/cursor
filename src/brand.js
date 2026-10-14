import { EmbedBuilder } from 'discord.js';
import {
  assertOverwrites,
  botPermissions,
  guestPermissions,
  innerPermissions,
  venusPermissions,
} from './permissions.js';

// Tokens from venerastudio.com: --bg, --fg, --fg-muted, --flame, --surface-2.
export const COLORS = {
  black: 0x000000, // #000000
  offWhite: 0xf5f0e8, // #F5F0E8
  flame: 0xff4500, // #FF4500
  guest: 0x8a8580, // #8A8580
  bots: 0x242424, // #242424
};

export const SERVER_NAME = "Venera's Lounge";
export const TAGLINE = 'Friends. Work, study, and chill.';

/** 15 minutes. Discord only accepts 60, 300, 900, 1800, or 3600. */
export const AFK_TIMEOUT = 900;

export const MARKERS = {
  welcome: 'venera studio · arrivals',
  rules: 'venera studio · rules',
};

/**
 * Rank is the member-list order. Higher sits higher.
 * venus is Administrator on purpose: Discord will not let a channel
 * overwrite block that role.
 */
export const ROLES = [
  {
    key: 'venus',
    name: 'venus',
    color: COLORS.flame,
    hoist: true,
    rank: 4,
    permissions: venusPermissions,
  },
  {
    key: 'inner',
    name: 'inner circle',
    color: COLORS.offWhite,
    hoist: true,
    rank: 3,
    permissions: innerPermissions,
  },
  {
    key: 'guest',
    name: 'guest',
    color: COLORS.guest,
    hoist: false,
    rank: 2,
    permissions: guestPermissions,
  },
  {
    key: 'bots',
    name: 'bots',
    color: COLORS.bots,
    hoist: false,
    rank: 1,
    permissions: botPermissions,
  },
];

export const CURSOR_CHANNEL = 'cursor';

/**
 * Asked when someone joins. India is first because that is the house clock.
 * The role name is what shows on their profile and in /lounge.
 * Offsets that move with daylight saving stay on the city, not a fixed number.
 */
export const TIMEZONES = [
  { key: 'ist', name: 'ist', label: 'ist · india', hint: 'kolkata · utc+5:30' },
  { key: 'gst', name: 'gst', label: 'gst · gulf', hint: 'dubai · utc+4' },
  { key: 'sgt', name: 'sgt', label: 'sgt · singapore', hint: 'singapore · utc+8' },
  { key: 'uk', name: 'uk', label: 'uk · london', hint: 'london' },
  { key: 'cet', name: 'cet', label: 'cet · europe', hint: 'paris' },
  { key: 'et', name: 'et', label: 'et · us east', hint: 'new york' },
  { key: 'pt', name: 'pt', label: 'pt · us west', hint: 'los angeles' },
  { key: 'aet', name: 'aet', label: 'aet · sydney', hint: 'sydney' },
];

const KBPS_96 = 96_000;
const KBPS_64 = 64_000;

export const CATEGORIES = [
  {
    key: 'arrivals',
    name: '✦ arrivals',
    area: 'arrivals',
    channels: [
      { key: 'welcome', name: 'welcome', kind: 'text', topic: 'start here.' },
      { key: 'rules', name: 'rules', kind: 'text', topic: 'the few that matter.' },
    ],
  },
  {
    key: 'lounge',
    name: '◐ the lounge',
    area: 'text',
    channels: [
      { key: 'general', name: 'general', kind: 'text', topic: 'the room.' },
      { key: 'links', name: 'links-and-finds', kind: 'text', topic: 'references worth keeping.' },
      { key: 'clips', name: 'clips-and-media', kind: 'text', topic: 'films, stills, product motion.' },
      { key: 'music', name: 'music', kind: 'text', topic: 'what the room is playing.' },
      { key: 'late', name: 'late-night', kind: 'text', topic: 'no rules vibe. still sfw.' },
    ],
  },
  {
    key: 'screens',
    name: '▸ screens',
    area: 'voice',
    channels: [
      { key: 'lounge-voice', name: 'the lounge', kind: 'voice', bitrate: KBPS_96, userLimit: 0 },
      { key: 'rooftop', name: 'rooftop', kind: 'voice', bitrate: KBPS_64, userLimit: 4 },
      { key: 'screening', name: 'screening room', kind: 'voice', bitrate: KBPS_96, userLimit: 0 },
      {
        key: 'focus',
        name: 'focus',
        kind: 'voice',
        bitrate: KBPS_64,
        userLimit: 0,
        // Voice channels have no topic field. The status line under the
        // channel name is the note. It asks people to join muted; it does
        // not server-mute them.
        status: 'join muted — cowork / study',
      },
      { key: 'afk', name: 'afk', kind: 'voice', bitrate: KBPS_64, userLimit: 0 },
    ],
  },
  {
    key: 'create',
    name: '◇ create',
    area: 'text',
    channels: [
      { key: 'wip', name: 'wip', kind: 'text', topic: 'works in progress.' },
      { key: 'inspo', name: 'inspo', kind: 'text', topic: 'craft, type, stills.' },
    ],
  },
  {
    key: 'cursor',
    name: '✶ cursor',
    area: 'private',
    channels: [
      { key: 'cursor', name: CURSOR_CHANNEL, kind: 'text', topic: 'only you. questions for cursor.' },
    ],
  },
];

export function allChannels() {
  return CATEGORIES.flatMap((category) =>
    category.channels.map((channel) => ({ ...channel, categoryKey: category.key })),
  );
}

export function welcomeEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.flame)
    .setTitle('venera')
    .setDescription(
      [
        'A room for friends.',
        '',
        'Work, study, and chill.',
        '',
        '— be cool',
        '— no spam',
        '— have fun',
        '',
        'what time are you on? india is ist.',
      ].join('\n'),
    )
    .setFooter({ text: MARKERS.welcome });
}

export function rulesEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.flame)
    .setTitle('house rules')
    .setDescription(
      [
        'Friends only. Work, study, and chill. This room stays quiet.',
        '',
        '— be cool. talk like you are in the room.',
        '— no spam. no ads, no floods, no noise for its own sake.',
        '— have fun. the night is the point.',
        '',
        'sfw. what is said here stays here.',
      ].join('\n'),
    )
    .setFooter({ text: MARKERS.rules });
}

export function doorEmbed(name) {
  return new EmbedBuilder()
    .setColor(COLORS.flame)
    .setTitle(name)
    .setDescription('the door is open.')
    .setFooter({ text: 'venera studio' });
}

export function assertBlueprint() {
  const areas = new Set(['arrivals', 'text', 'voice', 'private']);
  const roleNames = new Set();
  const roleKeys = new Set();
  for (const role of ROLES) {
    if (roleKeys.has(role.key) || roleNames.has(role.name)) {
      throw new Error(`Duplicate role in the blueprint: ${role.name}`);
    }
    roleKeys.add(role.key);
    roleNames.add(role.name);
  }

  const categoryNames = new Set();
  const channelNames = new Set();
  const channelKeys = new Set();
  for (const category of CATEGORIES) {
    if (!areas.has(category.area)) throw new Error(`Unknown area on ${category.name}`);
    if (categoryNames.has(category.name.toLowerCase())) {
      throw new Error(`Duplicate category: ${category.name}`);
    }
    categoryNames.add(category.name.toLowerCase());
    for (const channel of category.channels) {
      if (channelKeys.has(channel.key) || channelNames.has(channel.name.toLowerCase())) {
        throw new Error(`Duplicate channel: ${channel.name}`);
      }
      channelKeys.add(channel.key);
      channelNames.add(channel.name.toLowerCase());
      if (channel.kind === 'text' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(channel.name)) {
        throw new Error(`Text channel names have to be lowercase slugs: ${channel.name}`);
      }
      if (channel.kind === 'voice' && channel.name !== channel.name.toLowerCase()) {
        throw new Error(`Voice channel names stay lowercase: ${channel.name}`);
      }
    }
  }

  const channels = Object.fromEntries(allChannels().map((channel) => [channel.key, channel]));
  if (channels['lounge-voice'].bitrate !== 96_000) throw new Error('the lounge should be 96kbps');
  if (channels.screening.bitrate !== 96_000) throw new Error('screening room should be 96kbps');
  if (channels.rooftop.userLimit !== 4) throw new Error('rooftop should seat 4');
  if (!channels.focus.status) throw new Error('focus needs a join-muted note');
  if (ROLES.find((role) => role.key === 'venus').color !== COLORS.flame) {
    throw new Error('venus should be flame orange');
  }
  if (TIMEZONES[0]?.name !== 'ist') throw new Error('india should be the first timezone');
  const zoneNames = new Set();
  for (const zone of TIMEZONES) {
    if (zoneNames.has(zone.name) || roleNames.has(zone.name)) {
      throw new Error(`Timezone collides with another name: ${zone.name}`);
    }
    zoneNames.add(zone.name);
  }

  assertOverwrites();
}
