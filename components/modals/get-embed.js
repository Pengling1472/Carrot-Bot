const Discord = require( 'discord.js' );

module.exports = {
	data: { name: 'get-embed' },
	async execute( client, interaction ) {

		const channelId = interaction.fields.getTextInputValue( 'channel-id' )
		const messageId = interaction.fields.getTextInputValue( 'message-id' )

		try {

			interaction.guild.channels.cache.get( channelId ).messages.fetch( messageId ).then( msg => {

				const attachment = new Discord.AttachmentBuilder( Buffer.from( JSON.stringify( msg.embeds, null, 2 ) + '\n\nSingle Line:\n' + JSON.stringify( msg.embeds ) ), { name: 'json.txt' } )

				interaction.reply( { content: 'Embed has successfully been found!', files: [ attachment ], ephemeral: true } )

			} ).catch( err => {

				const attachment = new Discord.AttachmentBuilder( Buffer.from( `Channel ID:\n${channelId}\nMessage ID:\n${messageId}` ), { name: 'json.txt' } )
				
				interaction.reply( { content: 'There was an error while getting the embed!', files: [ attachment ], ephemeral: true } )

			} )

		} catch ( err ) {

			interaction.reply( { content: 'There was an error getting the channel from ID!', ephemeral: true } )

		}

	}
}