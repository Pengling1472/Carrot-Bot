const fs = require( 'fs' )

module.exports = {
	name: 'ready',
	once: true,
	async execute( client ) {
		
		console.log( `Ready! Logged in as ${client.user.tag}` )

		const json = JSON.parse( fs.readFileSync( 'data.json' ) )

		client.user.setPresence( {
			status: json[ 'status' ],
			activities: [ json[ 'activities' ] ]
		} )

	}
}