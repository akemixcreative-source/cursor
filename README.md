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

Voice state, which `/lounge` uses, is not a privileged intent. There is no switch for it. Message Content is not used.

## 3. Invite the bot

Application ID is on **General Information**. Replace `YOUR_CLIENT_ID` in this URL, open it, choose **Venera's Lounge**, and authorize:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
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

Setup logs in, builds the server, and logs out. The bot looks offline until you start the door:

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
```

Voice channels have no topic field. The focus note is the status line under the channel name. It asks people to join muted. It does not server-mute them.

An existing `#general` is moved under **◐ the lounge** instead of duplicated. Reset deletes that channel and its history.

Server settings:

- Name: `Venera's Lounge`
- Description: `Launch videos that make startups look inevitable.`
- System messages: `#welcome`
- Verification: low (verified email)
- Notifications: mentions only
- Explicit content filter: all members
- AFK: `afk`, 15 minutes

The server owner is given `venus`. People already in the server who have none of `venus`, `inner circle`, or `guest` are given `guest`, so the new permissions do not lock them out. Hand `inner circle` to close friends yourself.

Discord only shows the description on some servers (often once Community is on). If it refuses, setup says so and continues.

## The door bot

`npm run bot` stays online and does three things:

- Gives `guest` to a person when they join. Bot accounts get `bots` instead, with no welcome card.
- Posts a welcome in `#welcome` that mentions them. The mention is in the message, so it actually notifies them.
- `/lounge` shows who is in voice right now. Empty rooms are left off the card. A muted person is marked.
- `/cursor` sends a question to Cursor and posts the reply in the channel. Only `venus` can use it.
- When someone joins, the bot asks what time they are on. India is `ist`. Their answer becomes a role and, when it fits, a `· ist` suffix on their name. `/lounge` shows that clock next to anyone in voice. `/timezone` asks again.

The commands are registered on this server only, so they appear as soon as the bot is online. Starting the bot again updates them instead of adding a second copy.

## Asking Cursor

`/cursor` needs a Cursor API key. In the Cursor dashboard, open **API Keys**, create one, and add it to `.env`:

```
CURSOR_API_KEY=the key from the dashboard
```

Restart `npm run bot`. In Discord, as venus:

```
/cursor query: what is the rooftop channel for?
```

The bot tells the channel it sent the question, then posts Cursor's reply when the run finishes. The next `/cursor` continues that same chat. Set `fresh` to start another one.

## Timezones

The bot DMs a new person: “what time are you on? india is ist.” If their DMs are closed, it asks in `#general` instead. The menu starts with India, then gulf, Singapore, London, Europe, the US, and Sydney.

Picking one gives them that role (`ist`, `gst`, `sgt`, `uk`, `cet`, `et`, `pt`, `aet`) and adds it to their nickname when the name is short enough, like `Venera · ist`. The server owner’s nickname cannot be changed. The role still shows on their profile. `/timezone` opens the same menu for anyone already in the server.

Leave `build` off for a question. Cursor answers and does not change the project. Turn `build` on only when you want Cursor to change this repo and open a pull request. That spends usage on the Cursor account that owns the key.

The repo defaults to `https://github.com/akemixcreative-source/cursor` on `main`. Override either with `CURSOR_REPOSITORY` and `CURSOR_REF` in `.env`.

## If something fails

- **Invalid token.** Reset the token on the Bot page and update `.env`.
- **Unknown guild.** `GUILD_ID` is wrong, or the bot was not invited into this server.
- **Disallowed intents.** Server Members Intent is off. Turn it on, then start the bot again.
- **Missing permissions.** Drag the bot role above `venus` and run `npm run setup` again.
- **Two-factor required.** The server requires 2FA for admin actions. Enable 2FA on the owner account.
- **Banner skipped.** The file is missing, or the server is below boost level 2.
- **`/lounge` never appears.** Re-invite with both `bot` and `applications.commands`.
