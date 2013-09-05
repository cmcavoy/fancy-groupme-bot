# Fancy Groupme Bot

A simple bot that uses the [Groupme Bot API](https://dev.groupme.com/tutorials/bots) to connect to a Groupme room.

## Configuration

Config is read from environment variables,

```
export TOKEN=[API token from Groupme]
export GROUP=[The room ID the bot should attach to]
export NAME=[The name of the bot]
export URL=[The url the bot is hosted at, used to register a callback url with Groupme]
```
