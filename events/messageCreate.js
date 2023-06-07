const { userData, saveUserData } = require( './functions' )

module.exports = {
	name: 'messageCreate',
	async execute( message, client ) {

        if ( message.author.bot || message.content.split( ' ' ).length < 5 ) return

        const data = await userData( message.author.id )
        const xp = Math.floor( Math.random() * Math.min( Math.max( message.content.split( ' ' ).length, 5 ), 30 ) )

        if ( data.user.xp + xp >= data.user.level * data.user.level * 100 ) return await saveUserData( { userId: message.author.id, level: 1, xp: ( data.user.xp + xp ) - ( data.user.level * data.user.level * 100 ) } )

        await saveUserData( { userId: message.author.id, xp: xp } )

	}
}