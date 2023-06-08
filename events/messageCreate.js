const { userData, saveUserData } = require( './functions' )

module.exports = {
	name: 'messageCreate',
	async execute( message, client ) {

        if ( message.author.bot || message.content.split( ' ' ).length < 5 ) return

        const xp = Math.floor( Math.random() * Math.min( Math.max( message.content.split( ' ' ).length, 5 ), 30 ) )

        await saveUserData( { userId: message.author.id, xp: xp } )

	}
}