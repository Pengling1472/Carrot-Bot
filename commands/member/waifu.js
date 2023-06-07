const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { AttachmentBuilder } = require( 'discord.js' )

const { guildData, userData } = require( '../../events/functions' )
const Canvas = require( '@napi-rs/canvas' )

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'waifu' )
		.setDescription( 'Your waifu stats.' )
        .addUserOption( option =>
            option.setName( 'target' )
            .setDescription( 'Select a user' )),
	async execute( client, interaction ) {

        await interaction.deferReply()

        let userId = interaction.user.id
        if ( interaction.options.getUser( 'target' ) ) {
            const target = interaction.options.getUser( 'target' )
            if ( target.bot ) return interaction.reply( {
                embeds: [ {
                    color: ( await guildData( interaction.guild.id ) ).color,
                    title: 'Error :page_facing_up:',
                    description: `${target.tag} is a bot.`
                } ]
            } )
            userId = target.id
        }

        const data = await userData( userId )

        const canvas = Canvas.createCanvas( 1200, 1200 )
        const ctx = canvas.getContext( '2d' )

		Canvas.GlobalFonts.registerFromPath( './fonts/PaytoneOne-Regular.ttf', 'default' )

        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3
        ctx.translate( canvas.width / 2, canvas.height / 2 )

        const angle = ( Math.PI * 2 ) / 6
        const radius = 500 / 5

        ctx.beginPath()

        for ( i = 1; i < 6; i++ ) for ( j = 1; j < 8; j++ ) {

            ctx.lineTo( ( radius * i ) * Math.sin( angle * j ), ( radius * i ) * Math.cos( angle * j ) )
            ctx.lineTo( 0, 0 )
            ctx.lineTo( ( radius * i ) * Math.sin( angle * j ), ( radius * i ) * Math.cos( angle * j ) )

        }

        ctx.closePath()
        ctx.stroke()

        ctx.strokeStyle = '#b30e84'
        ctx.fillStyle = '#ff4fcd'
        ctx.lineWidth = 10
        ctx.globalAlpha = 0.4

        ctx.beginPath()

        for ( i = 0; i < 6; i++ ) ctx.lineTo( ( 50 * Object.values( data.waifu )[ i ] ) * Math.sin( angle * i ), ( 50 * Object.values( data.waifu )[ i ] ) * Math.cos( angle * i ) )

        ctx.closePath()
        ctx.stroke()
        ctx.fill()

        ctx.globalAlpha = 1
		ctx.font = '35px default';
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'

        for ( i = 0; i < 6; i++ ) {

            ctx.textAlign = i == 1 || i == 2 ? 'left' : i == 4 || i == 5 ? 'right' : 'center'
            ctx.fillText( Object.keys( data.waifu )[ i ], 530 * Math.sin( angle * i ), 530 * Math.cos( angle * i ) )
        
        }
        
        const attachment = new AttachmentBuilder( await canvas.encode( 'png' ), { name: 'waifu.png' } );

        await interaction.editReply( {
            embeds: [ {
                color: ( await guildData( interaction.guild.id ) ).color,
                author: {
                    name: `${interaction.user.tag}`,
                    icon_url: interaction.user.displayAvatarURL( { size: 4096, dynamic: true } )
                },
                title: interaction.user.username + ' ' + data.waifu.text,
                image: {
                    url: 'attachment://waifu.png'
                }
            } ],
            files: [ attachment ]
        } )

	}
}