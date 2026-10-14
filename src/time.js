import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { TIMEZONES } from './brand.js';

const MARK = ' · ';

export function timezoneMenu(userId) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(userId ? `tz:${userId}` : 'tz')
      .setPlaceholder('what time are you on?')
      .addOptions(
        TIMEZONES.map((zone) => ({
          label: zone.label,
          description: zone.hint,
          value: zone.key,
        })),
      ),
  );
}

export function zoneByKey(key) {
  return TIMEZONES.find((zone) => zone.key === key) ?? null;
}

export function isTimezoneName(name) {
  const folded = String(name ?? '').trim().toLowerCase();
  return TIMEZONES.some((zone) => zone.name === folded);
}

export function zoneOf(member) {
  const roles = member?.roles?.cache;
  if (!roles) return null;
  for (const zone of TIMEZONES) {
    const match = roles.some((role) => role.name.trim().toLowerCase() === zone.name);
    if (match) return zone;
  }
  return null;
}

/**
 * Member-list names are 32 characters. The suffix is the visible clock.
 * A name that cannot hold it keeps the role and skips the nickname.
 */
export function withTimezone(name, zoneName) {
  const known = new Set(TIMEZONES.map((zone) => zone.name));
  let base = String(name ?? '').trim();
  const cut = base.lastIndexOf(MARK);
  if (cut !== -1 && known.has(base.slice(cut + MARK.length))) {
    base = base.slice(0, cut).trim();
  }
  if (!base) return null;
  const next = `${base}${MARK}${zoneName}`;
  if (next.length > 32) return null;
  return next;
}
