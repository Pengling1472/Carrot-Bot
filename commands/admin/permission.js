const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require( 'discord.js' );
const { guildData } = require('../../events/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'permission' )
		.setDescription( 'Checks if bot has permission on channels!' ),
	async execute( client, interaction ) {

		const data = await guildData( interaction.guild.id )
		const channels = interaction.guild.channels.cache

		const channelsBitFields = {
			'SendMessages': PermissionsBitField.Flags.SendMessages,
			'ViewChannel': PermissionsBitField.Flags.ViewChannel,
			'EmbedLinks': PermissionsBitField.Flags.EmbedLinks,
			'AttachFiles': PermissionsBitField.Flags.AttachFiles
		}

		const vcBitFields = {
			'ManageChannels': PermissionsBitField.Flags.ManageChannels,
			'MoveMembers': PermissionsBitField.Flags.MoveMembers,
			'ViewChannel': PermissionsBitField.Flags.ViewChannel,
			'Connect': PermissionsBitField.Flags.Connect
		}

		interaction.reply( { embeds: [ {
			color: data.color,
			fields: [
				{ name: 'Welcome Channel', value: perms( channelsBitFields, channels.get( data.channelsId.welcome ) ) },
				{ name: 'Goodbye Channel', value: perms( channelsBitFields, channels.get( data.channelsId.goodbye ) ) },
				{ name: 'Logs Channel', value: perms( channelsBitFields, channels.get( data.channelsId.logs ) ) },
				{ name: 'VC Channel ( Category Permissions )', value: perms( vcBitFields, channels.get( data.channelsId.vc ) ) }
			]
		} ], ephemeral: true } )

		function perms( bit, channel ) {

			if ( !channel ) return 'None'

			let content = `:white_small_square: : <#${channel.id}>`

			if ( channel.type === 2 ) channel = channel.parent

			for ( const [ key, value ] of Object.entries( bit ) ) content += `\n\t${interaction.guild.members.me.permissionsIn( channel ).has( value ) ? ':green_circle:' : ':red_circle:'} : ${key}`

			return content

		}

	}
}