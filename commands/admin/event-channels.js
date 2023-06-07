const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildData } = require('../../events/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'event-channels' )
		.setDescription( 'When an event happens, it\'ll execute a command on channels set by their ID\'s. Leave empty if none.' ),
	async execute( client, interaction ) {

		const data = await guildData( interaction.guild.id )

		interaction.showModal( {
			title: 'Event channels (Leave empty if none)',
			custom_id: 'event-channels',
			components: [ {
				type: 1,
				components: [ {
					type: 4,
					custom_id: 'welcome-id',
					label: 'Welcome Card',
					style: 1,
					value: data.channelsId.welcome,
					placeholder: 'Channel ID',
					required: false,
					max_length: 20
				} ]
			}, {
				type: 1,
				components: [ {
					type: 4,
					custom_id: 'goodbye-id',
					label: 'Goodbye Card',
					style: 1,
					value: data.channelsId.goodbye,
					placeholder: 'Channel ID',
					required: false,
					max_length: 20
				} ]
			}, {
				type: 1,
				components: [ {
					type: 4,
					custom_id: 'logs-id',
					label: 'Logs ( VC, Roles, and Messages )',
					style: 1,
					value: data.channelsId.logs,
					placeholder: 'Channel ID',
					required: false,
					max_length: 20
				} ]
			}, {
				type: 1,
				components: [ {
					type: 4,
					custom_id: 'vc-id',
					label: 'VC',
					style: 1,
					value: data.channelsId.vc,
					placeholder: 'Channel ID',
					required: false,
					max_length: 20
				} ]
			} ]
		} )

	}
}