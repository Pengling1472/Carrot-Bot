require( 'dotenv' ).config();

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client( {

	intents: [
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds,
	],
	partials: [ 'MESSAGE', 'CHANNEL', 'REACTION' ],
	allowedMentions: { repliedUser: false }

} )

client.on( 'messageCreate', message => {
    console.log( message )
    if ( message.content == '!ping' ) message.channel.send( 'pong!' )
} )

client.login( process.env.TOKEN )