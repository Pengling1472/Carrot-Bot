const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildData } = require('../../events/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'utilities' )
		.setDescription( 'A command to set some utilities for your server.' ),
	async execute( client, interaction ) {

		const data = await guildData( interaction.guild.id )

		interaction.showModal( {
			title: 'Utilities (Leave empty if none)',
			custom_id: 'utilities',
			components: [ {
				type: 1,
				components: [ {
					type: 4,
					custom_id: 'color',
					label: 'Color',
					style: 1,
					value: data.color,
					placeholder: 'Decimal color Ex. "16777215"',
					required: false,
					max_length: 20
				} ]
			}, {
				type: 1,
				components: [ {
					type: 4,
					custom_id: 'timezone',
					label: 'Timezone',
					style: 1,
					value: data.timezone,
					placeholder: 'Timezone Ex. "America/Los_Angeles"',
					required: false,
					max_length: 20
				} ]
			}, {
				type: 1,
				components: [ {
					type: 4,
					custom_id: 'administrator',
					label: 'Administrator Roles',
					style: 2,
					value: data.administrator.map( id => `<${id}>` ).join( ' ' ),
					placeholder: 'Role ID Ex. "<697263100037955594> <716809633955840091>"',
					required: false
				} ]
			}, {
				type: 1,
				components: [ {
					type: 4,
					custom_id: 'autorole',
					label: 'Autorole Roles',
					style: 2,
					value: data.autorole.map( id => `<${id}>` ).join( ' ' ),
					placeholder: 'Role ID Ex. "<697263100037955594> <716809633955840091>"',
					required: false
				} ]
			} ]
		} )

	}
}