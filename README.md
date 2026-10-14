# Venera's Lounge

One-shot setup for the private Discord, plus a small door bot. The script builds the roles, categories, and channels for Venera Studio. Run it again and it updates what is already there.

Node 20 or newer. The token stays in `.env` and is never written into the code.

## 1. Create the bot

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**. Name it something like `Venera`.
2. Open **Bot**.
3. If you see **Add Bot**, click it. Newer apps already have a bot user.
4. Click **Reset Token**, confirm, and copy the token. This is `DISCORD_TOKEN`. You can only see it once. If it leaks, reset it again.
5. Turn **Public Bot** off so strangers cannot invite it.

## 2. Turn on the Server Members intent

Still on the **Bot** page, under **Privileged Gateway Intents**, enable **Server Members Intent**.

That intent is required. The setup script uses it to give `guest` to people already in the server. The door bot uses it to give `guest` to someone the moment they join. Leave it on.

Voice state is used by the bot. There is no switch for it. Message Content is not used.

## 3. Invite the bot

The bot user is `venera-lounge`. Open this URL, choose **Venera's Lounge**, and authorize:

```
https://discord.com/oauth2/authorize?client_id=1559775866555474002&permissions=8&scope=bot%20applications.commands
```

`permissions=8` is Administrator. The scopes are `bot` and `applications.commands`.

You can build the same URL in the portal under **OAuth2 → URL Generator**:

- Scopes: `bot`, `applications.commands`
- Bot permissions: Administrator

Administrator is what lets the script create roles, move channels, set the icon, and change moderation settings. After the invite, open **Server Settings → Roles** and drag the bot's role to the top, above every role it will edit.

## 4. Fill in `.env`

In Discord, turn on **Settings → Advanced → Developer Mode**. Right-click the server icon and choose **Copy Server ID**.

```bash
cp .env.example .env
```

```
DISCORD_TOKEN=the token from the Bot page
GUILD_ID=the server id you just copied
```

Optional art, before you run setup:

- `assets/icon.png` becomes the server icon
- `assets/banner.png` becomes the banner

If either file is missing, that step is skipped. A banner also needs server boost level 2 or Discord will refuse it.

## 5. Run it

From this folder:

```bash
npm install
npm run setup
```

Setup logs in, builds the server, and logs out. The bot looks offline until you start it:

```bash
npm run bot
```

Leave that process running. New people only see arrivals until it gives them `guest`.

A second `npm run setup` edits the existing roles and channels. The welcome and rules cards are updated in place.

To delete everything this script manages and build it again:

```bash
npm run setup -- --reset
```

The `--` is required so npm forwards the flag. Reset removes channels (and the messages in them), categories, and roles that use the blueprint names, plus anything recorded in `.venera-manifest.json` if you renamed it. Other channels are left alone. That manifest is local and gitignored.

## What you get

Roles, top to bottom:

| Role | Color | Who |
| --- | --- | --- |
| `venus` | `#FF4500` | Server owner. Administrator, hoisted. |
| `inner circle` | `#F5F0E8` | Close friends. Hoisted. Can move and mute in voice. |
| `guest` | `#8A8580` | Everyone else. Can talk and join voice. |
| `bots` | `#242424` | Bot accounts. |

`@everyone` can read **✦ arrivals** and nothing else. `guest` opens the rest of the server. `venus` can still write in the read-only channels, because Administrator bypasses channel overwrites. That is Discord, not a setting this script can turn off.

```
✦ arrivals
  #welcome          read-only house card
  #rules            read-only house rules
◐ the lounge
  #general
  #links-and-finds
  #clips-and-media
  #music
  #late-night       still sfw
▸ screens           camera and screen share on
  the lounge        no user limit, 96kbps
  rooftop           4 people, 64kbps
  screening room    96kbps
  focus             status: join muted — cowork / study
  afk               server afk channel, 15 min
◇ create
  #wip
  #inspo
✶ cursor              hidden from everyone else
  #cursor             only the server owner
```

Voice channels have no topic field. The focus note is the status line under the channel name. It asks people to join muted. It does not server-mute them.

An existing `#general` is moved under **◐ the lounge** instead of duplicated. Reset deletes that channel and its history.

Server settings:

- Name: `Venera's Lounge`
- Description: `Friends. Work, study, and chill.`
- System messages: `#welcome`
- Verification: low (verified email)
- Notifications: mentions only
- Explicit content filter: all members
- AFK: `afk`, 15 minutes

The server owner is given `venus`. People already in the server who have none of `venus`, `inner circle`, or `guest` are given `guest`, so the new permissions do not lock them out. Hand `inner circle` to close friends yourself.

Discord only shows the description on some servers (often once Community is on). If it refuses, setup says so and continues.

## The bot

`npm run bot` runs [discord-js-bot](https://github.com/saiteja-madha/discord-js-bot) (MIT). The Discord account is `venera-lounge`. Aphrodite is gone.

It is online from this machine, and it is not in the server until you open the invite in section 3 and authorize it. After that, restart `npm run bot` once so the slash commands land on the server.

It stays online and, on top of that bot's own slash commands:

- Gives `guest` to a person when they join. Bot accounts get `bots`.
- Keeps the timezone menu on the `#welcome` card. India is `ist`. `/time` shows the current clock for everyone who picked.

Music and image commands stay off. They need Lavalink and an image API this room does not have. The bot's data lives in `.mongo-data`, which is local and gitignored.

The commands are registered on this server only. Starting the bot again replaces the slash-command list. `/cursor`, `/lounge`, and `/timezone` were part of the old door process and are not on this bot.

Only one process can use the token. Stop the old one before `npm run bot`.

## Timezones

The welcome card in `#welcome` ends with “what time are you on? india is ist.” and a menu. Anyone who can see arrivals can pick, including someone who just joined. The menu starts with India, then gulf, Singapore, London, Europe, the US, and Sydney. Their confirmation is only visible to them, and the menu stays on the card for the next person.

Picking one gives them that role (`ist`, `gst`, `sgt`, `uk`, `cet`, `et`, `pt`, `aet`) and adds it to their nickname when the name is short enough, like `Venera · ist`. The server owner’s nickname cannot be changed. The role still shows on their profile. `/time` lists the current time in each zone.

## If something fails

- **Invalid token.** Reset the token on the Bot page and update `.env`.
- **Unknown guild.** `GUILD_ID` is wrong, or the bot was not invited into this server.
- **Disallowed intents.** Server Members Intent is off. Turn it on, then start the bot again.
- **Missing permissions.** Drag the bot role above `venus` and run `npm run setup` again.
- **Two-factor required.** The server requires 2FA for admin actions. Enable 2FA on the owner account.
- **Banner skipped.** The file is missing, or the server is below boost level 2.
- **`/time` never appears.** Re-invite with both `bot` and `applications.commands`, then restart `npm run bot`.
