const moment = require( 'moment-timezone' );
const { saveGuildData } = require( '../../events/functions' )

module.exports = {
	data: { name: 'utilities' },
	async execute( client, interaction ) {

        const timezones = moment.tz.names()

		const utilities = {
            guildId: interaction.guild.id,
            color: interaction.fields.getTextInputValue( 'color' ).length === 0 ? '16777215' : interaction.fields.getTextInputValue( 'color' ),
            timezone: interaction.fields.getTextInputValue( 'timezone' ).length === 0 ? 'America/Los_Angeles' : timezones[ timezones.findIndex( tz => tz.toLowerCase() == interaction.fields.getTextInputValue( 'timezone' ).toLowerCase() ) ] ?? null,
            autorole: [],
            administrator: []
        }

        await interaction.fields.getTextInputValue( 'autorole' ).replace( /<(\d+)>/g, ( text, id ) => {

            const role = interaction.guild.roles.cache.get( id )

            if ( role != null && !utilities.autorole.includes( id ) ) utilities.autorole.push( id )

        } )

        await interaction.fields.getTextInputValue( 'administrator' ).replace( /<(\d+)>/g, ( text, id ) => {

            const role = interaction.guild.roles.cache.get( id )

            if ( role != null && !utilities.administrator.includes( id ) ) utilities.administrator.push( id )

        } )

        await interaction.reply( {
            embeds: [ {
                color: utilities.color,
                title: 'Utilities Saved',
                description: `${utilities.timezone ? `\`\`\`${utilities.timezone}` : 'Unknown timezone [link](https://gist.github.com/diogocapela/12c6617fc87607d11fd62d2a4f42b02a)\`\`\`America/Los Angeles'}\n${moment.tz( utilities.timezone ).format('MMMM Do YYYY[\n]dddd[\n]hh:mm A')}\`\`\``,
                fields: [ {
                    name: 'Administrator Roles',
                    value: utilities.administrator.length ? utilities.administrator.map( id => `<@&${id}>` ).join( '\n' ) : 'None',
                    inline: true
                }, {
                    name: 'Autorole Roles',
                    value: utilities.autorole.length ? utilities.autorole.map( id => `<@&${id}>` ).join( '\n' ) : 'None',
                    inline: true
                } ]
            } ],
            ephemeral: true
        } ).then( () => {

            saveGuildData( utilities )

        } ).catch( err => { return interaction.reply( { content: 'Invalid color!', ephemeral: true } ) } )

	}
}