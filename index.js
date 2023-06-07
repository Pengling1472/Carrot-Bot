require( 'dotenv' ).config();

const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

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

const commands = new Array()

client.commands = new Collection()
client.components = new Collection()
client.vc = new Collection()

for ( const collection of fs.readdirSync( './commands' ) ) { client.commands.set( collection, new Collection() ); for ( const file of fs.readdirSync( `./commands/${collection}` ) ) {

    const command = require( `./commands/${collection}/${file}` )
    client.commands.get( collection ).set( command.data.name, command )
    commands.push( command.data.toJSON() )

} }

for ( const collection of fs.readdirSync( './components' ) ) { client.components.set( collection, new Collection() ); for ( const file of fs.readdirSync( `./components/${collection}` ) ) {

    const component = require( `./components/${collection}/${file}` )
    client.components.get( collection ).set( component.data.name, component )

} }

for ( const file of fs.readdirSync( `./events` ) ) {
	
	const event = require( `./events/${file}` )
	event.once ? client.once( event.name, ( ...args ) => event.execute( ...args, client ) ) : client.on( event.name, ( ...args ) => event.execute( ...args, client ) )

}

const rest = new REST( { version: '9' } ).setToken( process.env.TOKEN );

( async () => {

	try {

		console.log( 'Refreshing slash commands!' )

		await rest.put( Routes.applicationCommands( process.env.CLIENT ), { body: commands } )

		console.log('Successfully reloaded.')

	} catch ( error ) { console.error( error ) }

} )()

client.login( process.env.TOKEN )