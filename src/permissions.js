import { PermissionFlagsBits, PermissionsBitField } from 'discord.js';

const {
  Administrator,
  ViewChannel,
  ReadMessageHistory,
  SendMessages,
  AddReactions,
  EmbedLinks,
  AttachFiles,
  UseExternalEmojis,
  Connect,
  Speak,
  Stream,
  UseVAD,
  MoveMembers,
  MuteMembers,
  CreatePublicThreads,
  CreatePrivateThreads,
  SendMessagesInThreads,
} = PermissionFlagsBits;

const read = [ViewChannel, ReadMessageHistory];

const conversation = [
  ...read,
  SendMessages,
  AddReactions,
  EmbedLinks,
  AttachFiles,
  UseExternalEmojis,
];

// Stream is Discord's "Video" permission: camera and screen share.
const hangout = [...conversation, Connect, Speak, Stream, UseVAD];

export const venusPermissions = [Administrator];
export const guestPermissions = hangout;
export const innerPermissions = [...hangout, MoveMembers, MuteMembers];
export const botPermissions = [...read, SendMessages, EmbedLinks, AttachFiles, Connect, Speak];

const readOnlyDeny = [
  SendMessages,
  AddReactions,
  CreatePublicThreads,
  CreatePrivateThreads,
  SendMessagesInThreads,
  AttachFiles,
  EmbedLinks,
  Connect,
  Speak,
];

/**
 * Channel overwrites are what actually gate the lounge.
 *
 * A deny on @everyone removes a permission for every member, including
 * people whose role grants it at the server level. The guest (or inner
 * circle) overwrite has to allow it again. That is the "view-only until
 * guest" door: arrivals stay readable, everything else stays hidden.
 *
 * Administrator (the venus role) bypasses overwrites. Discord does that
 * on its own; a channel cannot lock an admin out.
 */
export function buildOverwrites(area, ids) {
  const { everyone, guest, inner, bots } = ids;

  if (area === 'arrivals') {
    return [
      { id: everyone, allow: read, deny: readOnlyDeny },
      { id: guest, allow: read, deny: readOnlyDeny },
      { id: inner, allow: read, deny: readOnlyDeny },
      { id: bots, allow: [...read, SendMessages, EmbedLinks, AttachFiles] },
    ];
  }

  if (area === 'text') {
    return [
      { id: everyone, deny: [ViewChannel] },
      { id: guest, allow: conversation },
      { id: inner, allow: conversation },
      { id: bots, allow: [...read, SendMessages, EmbedLinks, AttachFiles, UseExternalEmojis] },
    ];
  }

  if (area === 'voice') {
    return [
      { id: everyone, deny: [ViewChannel, Connect] },
      { id: guest, allow: hangout },
      { id: inner, allow: [...hangout, MoveMembers, MuteMembers] },
      { id: bots, allow: [...read, Connect, Speak, SendMessages, EmbedLinks, AttachFiles] },
    ];
  }

  throw new Error(`Unknown channel area "${area}".`);
}

export function assertOverwrites() {
  const ids = { everyone: '1', guest: '2', inner: '3', bots: '4' };
  for (const area of ['arrivals', 'text', 'voice']) {
    for (const row of buildOverwrites(area, ids)) {
      const allow = new PermissionsBitField(row.allow ?? []).bitfield;
      const deny = new PermissionsBitField(row.deny ?? []).bitfield;
      if (allow & deny) {
        throw new Error(`A ${area} overwrite allows and denies the same permission.`);
      }
    }
  }

  const voiceRows = buildOverwrites('voice', ids);
  const guest = new PermissionsBitField(voiceRows.find((row) => row.id === ids.guest).allow);
  const inner = new PermissionsBitField(voiceRows.find((row) => row.id === ids.inner).allow);
  const hidden = new PermissionsBitField(voiceRows.find((row) => row.id === ids.everyone).deny);
  if (!guest.has(Stream) || !guest.has(Connect) || !guest.has(Speak)) {
    throw new Error('Guests should be able to join voice and share video.');
  }
  if (!inner.has(MoveMembers) || !inner.has(MuteMembers)) {
    throw new Error('Inner circle should be able to move and mute in voice.');
  }
  if (guest.has(MoveMembers) || guest.has(MuteMembers)) {
    throw new Error('Voice moderation stays on inner circle.');
  }
  if (!hidden.has(ViewChannel)) {
    throw new Error('@everyone should not see the voice rooms.');
  }

  const arrivalRows = buildOverwrites('arrivals', ids);
  const everyoneAllow = new PermissionsBitField(arrivalRows.find((row) => row.id === ids.everyone).allow);
  const everyoneDeny = new PermissionsBitField(arrivalRows.find((row) => row.id === ids.everyone).deny);
  if (!everyoneAllow.has(ViewChannel) || !everyoneDeny.has(SendMessages)) {
    throw new Error('Arrivals should be view-only for @everyone.');
  }
}
