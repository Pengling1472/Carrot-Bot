const { SlashCommandBuilder } = require( '@discordjs/builders' )

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'test' )
		.setDescription( 'This is a test' ),
	async execute( client, interaction ) {

        interaction.reply( {
            embeds: [ {
                description: 'halo'
            } ]
        } )
	
    }
}