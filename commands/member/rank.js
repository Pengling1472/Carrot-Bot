require( 'dotenv' ).config();

const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { guildData, userData, getUserRank } = require( '../../events/functions' )
const { createCanvas, loadImage, GlobalFonts } = require( '@napi-rs/canvas' )

const { AttachmentBuilder } = require( 'discord.js' )
const axios = require( 'axios' )

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'rank' )
		.setDescription( 'Get a user information.' )
		.addUserOption( option =>
			option.setName( 'target' )
			.setDescription( 'Select a user' ) ),
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

        const { banner, banner_color } = ( await axios.get( `https://discord.com/api/v8/users/${userId}`, {
            headers: {
                Authorization: `Bot ${process.env.TOKEN}`
            }
        } ) ).data

        const data = await userData( userId )
        const rank = await getUserRank( userId )
        const color = ( colors => colors.length == 0 ? '#FFFFFF' : `#${colors[ 0 ].toString( 16 )}` )( interaction.guild.members.cache.get( userId ).roles.cache.sort( ( a, b ) => b.rawPosition - a.rawPosition ).map( role => role.color ).filter( color => color != 0 ) )

        const canvas = createCanvas( 800, 250 )
        const ctx = canvas.getContext( '2d' )

		GlobalFonts.registerFromPath( './fonts/PaytoneOne-Regular.ttf', 'default' )

        const avatar = await loadImage( interaction.guild.members.cache.get( userId ).displayAvatarURL( { size: 256, format: 'png' } ) )

        ctx.fillStyle = banner_color
        ctx.fillRect( 0, 0, canvas.width, canvas.height )

        if ( banner ) ( background => {
            ctx.drawImage( background, 0, 0, canvas.width, canvas.height )
        } )( await loadImage( `https://cdn.discordapp.com/banners/${userId}/${banner}.png` ) )

        ctx.save()

		ctx.beginPath()
		ctx.arc( 125, 125, 95, 0, Math.PI * 2, true )
		ctx.closePath()
		ctx.clip()

		ctx.fillStyle = color
		ctx.fillRect( 30, 30, 190, 190 )

		ctx.restore()

		ctx.save()

		ctx.beginPath()
		ctx.arc( 125, 125, 85, 0, Math.PI * 2, true )
		ctx.closePath()
		ctx.clip()

		ctx.drawImage( avatar, 40, 40, 170, 170 )

		ctx.restore()

        drawStroke( interaction.guild.members.cache.get( userId ).user.username, 250, canvas.height * 0.3, { fontSize: 30, strokeWidth: 5, fill: color, strokeStyle: '#767676' } )
		drawStroke( `Lvl: ${data.user.level}   Rank: #${rank}   Exp: ${data.user.xp}/${data.user.level * data.user.level * 100}`, 250, canvas.height * 0.5, { fontSize: 30, strokeWidth: 5, fill: 'white', strokeStyle: '#767676' } )

        ctx.lineCap = 'round'
        ctx.lineWidth = 20
    
        ctx.beginPath()
        ctx.moveTo( 250, canvas.height * 0.8 )
        ctx.lineTo( 760, canvas.height * 0.8 )
        ctx.strokeStyle = '#767676'
        ctx.stroke()
    
        ctx.lineWidth = 10
    
        ctx.beginPath()
        ctx.moveTo( 250, canvas.height * 0.8 )
        ctx.lineTo( 250 + ( data.user.xp / ( data.user.level * data.user.level * 100 ) ) * 510, canvas.height * 0.8 )
        ctx.strokeStyle = color
        ctx.stroke()

        const attachment = new AttachmentBuilder( await canvas.encode( 'png' ), { name: 'rank.png' } );

        await interaction.editReply( {
            embeds: [ {
                color: ( await guildData( interaction.guild.id ) ).color,
                image: {
                    url: 'attachment://rank.png'
                }
            } ],
            files: [ attachment ]
        } )

        function drawStroke ( text, x, y, { fontSize, strokeWidth, fill, strokeStyle } ) {

			ctx.font = `${fontSize ?? 25}px default`
			ctx.strokeStyle = strokeStyle ?? 'black'
			ctx.fillStyle = fill ?? 'white'
			ctx.textAlign = 'left'
			ctx.textBaseline = 'middle'
			ctx.lineWidth = strokeWidth ?? 0
			ctx.strokeText( text, x, y )
			ctx.fillText( text, x, y )

		}

	}
}