const { ChannelType, PermissionsBitField } = require( 'discord.js' );
const { guildData } = require( './functions' );

module.exports = {
	name: 'voiceStateUpdate',
	async execute( oldMember, newMember, client ) {

		const oldChannel = oldMember.guild.channels.cache.find( channel => channel.id === oldMember.channelId )
		const newChannel = newMember.guild.channels.cache.find( channel => channel.id === newMember.channelId )
		const data = await guildData( newMember.guild.id )

		switch ( true ) {

			case !oldChannel:

				if ( data.channelsId.vc && newChannel.parent ) if ( 
					newChannel.id === data.channelsId.vc &&
					newChannel.guild.members.me.permissionsIn( newChannel.parent ).has( [
						PermissionsBitField.Flags.ManageChannels,
						PermissionsBitField.Flags.ViewChannel,
						PermissionsBitField.Flags.MoveMembers,
						PermissionsBitField.Flags.Connect
					] ) &&
					newChannel.parent.children.cache.size < 50
				) {

					const member = newMember.guild.members.cache.get( newMember.id )

					newMember.guild.channels.create( {
						name: member.user.username + '\'s Channel',
						type: ChannelType.GuildVoice,
						parent: newChannel.parentId
					} ).then( channel => {

						member.voice.setChannel( channel ).then( () => {

							client.vc.set( channel.id, member.id )

						} ).catch( () => channel.delete() )

					} )

				}

				break

			case !newChannel:

				if ( client.vc.get( oldChannel.id ) && oldChannel.guild.members.me.permissionsIn( oldChannel ).has( [
					PermissionsBitField.Flags.ManageChannels,
					PermissionsBitField.Flags.ViewChannel,
					PermissionsBitField.Flags.Connect
				] ) ) {

					switch ( oldChannel.members.size ) {

						case 0:

							client.vc.delete( oldChannel.id )
							oldChannel.delete()
							break

						default:

							client.vc.set( oldChannel.id, oldChannel.members.first() )

					}

				}

				break

			case oldChannel !== newChannel:

				if ( client.vc.get( oldChannel.id ) && oldChannel.guild.members.me.permissionsIn( newChannel ).has( [
					PermissionsBitField.Flags.ManageChannels,
					PermissionsBitField.Flags.ViewChannel,
					PermissionsBitField.Flags.Connect
				] ) ) {

					switch ( oldChannel.members.size ) {

						case 0:

							client.vc.delete( oldChannel.id )
							oldChannel.delete()
							break

						default:

							client.vc.set( oldChannel.id, oldChannel.members.first() )

					}

				}

				break

		}

	}
}