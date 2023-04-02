# Discord Invite Tracker Bot
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![GitHub stars](https://img.shields.io/github/stars/enes-th/discord-invite-tracker?label=Stars)
![GitHub last commit](https://img.shields.io/github/last-commit/enes-th/discord-invite-tracker?label=Last%20Update)
![GitHub open issues](https://img.shields.io/github/issues/enes-th/discord-invite-tracker?label=Issues)

This is a Discord bot that tracks invitations for your server. You can view the leaderboard to see which members have invited the most people, reset a member's invitation count, and more. 

*Currently only supports one guild per bot and requires a MySQL database, Discord.js v14.8.0*
## Requirements
* Node.js +16.x.x
* MySQL Server
* Discord bot token


## Getting Started

 1. Clone the repository:

```
$ git clone https://github.com/enes-th/discord-invite-tracker.git
```
 2. Install the dependencies: 
```
$ cd discord-invite-tracker
$ npm install
```
 3. Configure the `'.env'` file with these informations:
```
# Discord Bot Info
TOKEN=

# MySQL Server Info
HOST=
PORT= # default 3306
USER=
PASSWORD=
DATABASE=
```
 4. Configure the `'config.ts'` file with these informations:
```js
export default {
    message: {
        footer: "Powered by Enes"
    },
    activity: {
        name: "Sene Bot",
        type: 3 // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching, 4 = Custom, 5 = Competing
    },
    handleError: false // If there an error, display it in the message
}
```
 5. Start the bot:
```
$ tsc
$ cd dist
$ node index
```
_Make sure to manually import the .env file into the dist folder_

Run the `/setup` command on discord
## Features
* Track invites of each server member
* View the invite leaderboard
* Add or remove invites from members
* Reset a member's invites to 0

## Commands
* `/invites [@member]` - View invitations
* `/add-invites <@member> <amount>` - Add invitations
* `/remove-invites <@member> <amount>` - Remove invitations
* `/leaderboard` - View the invite leaderboard
* `/reset-invites <@member>` - Reset a member's invites to 0
* `/setup <#welcome-channel> <#leave-channel> <#log-channel>` - Setup the invitation system

## Contributing
Contributions are always welcome! If you have any suggestions or find any bugs, feel free to open an issue or create a pull request.

_Please make sure that your changes pass the ESLint and Prettier checks._

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.
