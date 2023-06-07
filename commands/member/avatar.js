const { SlashCommandBuilder } = require( '@discordjs/builders' )
const Data = require( '../../events/functions' )

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'avatar' )
		.setDescription( 'Get a user profile picture.' )
		.addUserOption( option =>
			option.setName( 'target' )
			.setDescription( 'Select a user' ) ),
	async execute( client, interaction ) {

		const guildData = await Data.guildData( interaction.guild.id )
		const user = interaction.options.getUser( 'target' ) || interaction.user

		if ( user.bot ) return interaction.reply( {
			embeds: [ {
				color: guildData.color,
				title: 'Error :page_facing_up:',
				description: `${ user.tag } is a bot.`
			} ]
		} )

		let fetchUser = interaction.guild.members.cache.get( user.id )

		interaction.reply( {
			embeds: [ {
				color: guildData.color,
				title: `${ fetchUser.user.username }'s avatar`,
				image: {
					url: fetchUser.user.displayAvatarURL( { size: 4096, dynamic: true } )
				}
			} ]
		} )

	}
}