const Discord = require( 'discord.js' );
const { saveGuildData } = require( '../../events/functions' )

module.exports = {
	data: { name: 'event-channels' },
	async execute( client, interaction ) {

        const channelsId = {
            welcome: interaction.fields.getTextInputValue( 'welcome-id' ),
            goodbye: interaction.fields.getTextInputValue( 'goodbye-id' ),
            logs: interaction.fields.getTextInputValue( 'logs-id' ),
            vc: interaction.fields.getTextInputValue( 'vc-id' )
        }

        for ( const [ key, channelId ] of Object.entries( channelsId ) ) if ( channelId.length != 0 && !interaction.guild.channels.cache.get( channelId ) ) {

            const attachment = new Discord.AttachmentBuilder( Buffer.from( `Welcome ID:\n${channelsId.welcome}\nGoodbye ID:\n${channelsId.goodbye}\nLogs ID:\n${channelsId.logs}\nVC ID:\n${channelsId.vc}` ), { name: 'json.txt' } )
    
            return interaction.reply( { content: 'There was an unknown ID!', files: [ attachment ], ephemeral: true } )

        }

        if ( channelsId.vc ) if ( interaction.guild.channels.cache.get( channelsId.vc ).type !== 2 ) {

            const attachment = new Discord.AttachmentBuilder( Buffer.from( `Welcome ID:\n${channelsId.welcome}\nGoodbye ID:\n${channelsId.goodbye}\nLogs ID:\n${channelsId.logs}\nVC ID:\n${channelsId.vc}` ), { name: 'json.txt' } )
    
            return interaction.reply( { content: 'The VC ID is not a Voice Channel!', files: [ attachment ], ephemeral: true } )

        }

        saveGuildData( { guildId: interaction.guild.id, channelsId: channelsId } )

        interaction.reply( { content: 'The channels ID has successfully been saved!', ephemeral: true } )

	}
}