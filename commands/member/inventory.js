const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { userData, guildData } = require( '../../events/functions' )

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'inventory' )
		.setDescription( 'Shows a list of items you have.' ),
	async execute( client, interaction ) {

        const data = await userData( interaction.user.id )
        const items = data.user.items.map( item => item.amount + addSpace( item.amount > 9 ? ( item.amount > 99 ? ' ' : '  ' ) : '   ' ) + item.name + addSpace( 13 - item.name.length ) + '| Sell: $' + item.price ).join( '\n' )

        await interaction.reply( {
            embeds: [ {
                color: ( await guildData( interaction.guild.id ) ).color,
                author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.displayAvatarURL( { size: 4096, dynamic: true } )
                },
                title: 'Inventory',
                description: `\`\`\`${items}\`\`\``
            } ]
        } )

        function addSpace( num ) { return Array( num ).fill('\xa0').join('') }

	}
}