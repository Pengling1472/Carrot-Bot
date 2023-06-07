const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'embed' )
		.setDescription( 'A command to create, edit, or get an embed.' )
		.addStringOption( option =>
			option.setName( 'option' )
			.setDescription( 'Option 2 and 3 will only work on an embed sent by the bot.' )
			.setRequired( true )
			.addChoices(
				{ name: 'Create', value: 'create' },
				{ name: 'Edit', value: 'edit' },
				{ name: 'Get', value: 'get' }
			) )
		.addChannelOption( option =>
			option.setName( 'channel' )
			.setDescription( 'Select a channel to get the embed.' )
			.setRequired( true ) ),
	async execute( client, interaction ) {

		switch ( interaction.options.getString( 'option' ) ) {

			case 'create':

				await interaction.showModal( {
					title: 'Creating an embed',
					custom_id: 'create-embed',
					components: [ {
						type: 1,
						components: [ {
							type: 4,
							custom_id: 'channel-id',
							label: 'Channel ID',
							style: 1,
							value: interaction.options.getChannel( 'channel' ).id,
							max_length: 20,
							required: true
						} ]
					}, {
						type: 1,
						components: [ {
							type: 4,
							custom_id: 'json',
							label: 'JSON',
							style: 2,
							placeholder: '[{"content":"hi" "title":"This is a Title!","description":"This is a description!"},{ ... }]',
							required: true
						} ]
					} ]
				} )

				break

			case 'edit':

				interaction.showModal( {
					title: 'Editing an embed',
					custom_id: 'edit-embed',
					components: [ {
						type: 1,
						components: [ {
							type: 4,
							custom_id: 'channel-id',
							label: 'Channel ID',
							style: 1,
							value: interaction.options.getChannel( 'channel' ).id,
							max_length: 20,
							required: true
						} ]
					}, {
						type: 1,
						components: [ {
							type: 4,
							custom_id: 'message-id',
							label: 'Message ID',
							style: 1,
							max_length: 20,
							required: true
						} ]
					}, {
						type: 1,
						components: [ {
							type: 4,
							custom_id: 'json',
							label: 'JSON',
							style: 2,
							placeholder: '[{"content":"hi" "title":"This is a Title!","description":"This is a description!"},{ ... }]',
							required: true
						} ]
					} ]
				} )

				break

			default:

				interaction.showModal( {
					title: 'Getting an embed',
					custom_id: 'get-embed',
					components: [ {
						type: 1,
						components: [ {
							type: 4,
							custom_id: 'channel-id',
							label: 'Channel ID',
							style: 1,
							value: interaction.options.getChannel( 'channel' ).id,
							max_length: 20,
							required: true
						} ]
					}, {
						type: 1,
						components: [ {
							type: 4,
							custom_id: 'message-id',
							label: 'Message ID',
							style: 1,
							max_length: 20,
							required: true
						} ]
					} ]
				} )

				break

		}

	}
}