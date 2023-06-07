const { AttachmentBuilder } = require( 'discord.js' );

module.exports = {
    data: { name: 'create-embed' },
    async execute( client, interaction ) {

        const channelId = interaction.fields.getTextInputValue( 'channel-id' )
        const json = interaction.fields.getTextInputValue( 'json' )

        try {

            const [ { content = '' } ] = JSON.parse( json )

            await interaction.guild.channels.cache.get( channelId ).send( {
                content: content,
                embeds: JSON.parse( interaction.fields.getTextInputValue( 'json' ) )
            } )

            interaction.reply( { content: 'Embed has successfully been sent!', ephemeral: true } )

        } catch ( err ) {
            
            const attachment = new AttachmentBuilder( Buffer.from( `Channel ID:\n${channelId}\nJSON:\n${json}` ), { name: 'json.txt' } )
            
            await interaction.reply( { content: 'There was an error while creating the embed!', files: [ attachment ], ephemeral: true } )

        }

    }
}