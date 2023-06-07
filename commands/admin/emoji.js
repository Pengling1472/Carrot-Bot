const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { AttachmentBuilder } = require( 'discord.js' )

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'emoji' )
		.setDescription( 'List of all emojis in this server.' ),
	async execute( client, interaction ) {

        const emoji = interaction.guild.emojis.cache.map( emoji => `${emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`}` )
        const attachment = new AttachmentBuilder( Buffer.from( 'Unicode\n' + emoji.join( '\n' ) ), { name: 'emoji.txt' } )

        interaction.reply( { files: [ attachment ], ephemeral: true } )

	}
}