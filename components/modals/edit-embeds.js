const Discord = require( 'discord.js' );

module.exports = {
	data: { name: 'edit-embed' },
	async execute( client, interaction ) {

		const channelId = interaction.fields.getTextInputValue( 'channel-id' )
		const messageId = interaction.fields.getTextInputValue( 'message-id' )
		const json = interaction.fields.getTextInputValue( 'json' )

		try {

			interaction.guild.channels.cache.get( channelId ).messages.fetch( messageId ).then( msg => {

				msg.edit( { embeds: JSON.parse( json ) } )

				interaction.reply( { content: 'Embed has successfully been edited!', ephemeral: true } )

			} ).catch( err => {

				const attachment = new Discord.AttachmentBuilder( Buffer.from( `Channel ID:\n${channelId}\nMessage ID:\n${messageId}\nJSON:\n${json}` ), { name: 'json.txt' } )
					
				interaction.reply( { content: 'There was an error while editing the embed!', files: [ attachment ], ephemeral: true } )

			} )

		} catch ( err ) {
			
			const attachment = new Discord.AttachmentBuilder( Buffer.from( `Channel ID:\n${channelId}\nMessage ID:\n${messageId}\nJSON:\n${json}` ), { name: 'json.txt' } )
			
			interaction.reply( { content: 'There was an error getting the channel from ID!', file: [ attachment ], ephemeral: true } )
		
		}

	}
}