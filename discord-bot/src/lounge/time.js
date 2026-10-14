const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

const MARK = " · ";

const TIMEZONES = [
  { key: "ist", name: "ist", iana: "Asia/Kolkata", label: "ist · india", hint: "kolkata · utc+5:30" },
  { key: "gst", name: "gst", iana: "Asia/Dubai", label: "gst · gulf", hint: "dubai · utc+4" },
  { key: "sgt", name: "sgt", iana: "Asia/Singapore", label: "sgt · singapore", hint: "singapore · utc+8" },
  { key: "uk", name: "uk", iana: "Europe/London", label: "uk · london", hint: "london" },
  { key: "cet", name: "cet", iana: "Europe/Paris", label: "cet · europe", hint: "paris" },
  { key: "et", name: "et", iana: "America/New_York", label: "et · us east", hint: "new york" },
  { key: "pt", name: "pt", iana: "America/Los_Angeles", label: "pt · us west", hint: "los angeles" },
  { key: "aet", name: "aet", iana: "Australia/Sydney", label: "aet · sydney", hint: "sydney" },
];

function timezoneMenu(userId) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(userId ? `tz:${userId}` : "tz")
      .setPlaceholder("what time are you on?")
      .addOptions(
        TIMEZONES.map((zone) => ({
          label: zone.label,
          description: zone.hint,
          value: zone.key,
        }))
      )
  );
}

function zoneByKey(key) {
  return TIMEZONES.find((zone) => zone.key === key) ?? null;
}

function localTime(zone, date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone.iana,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toLowerCase();
}

function minutesOfDay(zone, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone.iana,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0) % 24;
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function isTimezoneName(name) {
  const folded = String(name ?? "")
    .trim()
    .toLowerCase();
  return TIMEZONES.some((zone) => zone.name === folded);
}

function zoneOf(member) {
  const roles = member?.roles?.cache;
  if (!roles) return null;
  for (const zone of TIMEZONES) {
    const match = roles.some((role) => role.name.trim().toLowerCase() === zone.name);
    if (match) return zone;
  }
  return null;
}

function withTimezone(name, zoneName) {
  const known = new Set(TIMEZONES.map((zone) => zone.name));
  let base = String(name ?? "").trim();
  const cut = base.lastIndexOf(MARK);
  if (cut !== -1 && known.has(base.slice(cut + MARK.length))) {
    base = base.slice(0, cut).trim();
  }
  if (!base) return null;
  const next = `${base}${MARK}${zoneName}`;
  if (next.length > 32) return null;
  return next;
}

module.exports = {
  TIMEZONES,
  timezoneMenu,
  zoneByKey,
  localTime,
  minutesOfDay,
  isTimezoneName,
  zoneOf,
  withTimezone,
};
