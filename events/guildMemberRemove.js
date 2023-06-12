const { createCanvas, loadImage, GlobalFonts } = require( '@napi-rs/canvas' );
const { AttachmentBuilder, PermissionsBitField } = require( 'discord.js' );
const { guildData } = require( './functions' );

module.exports = {
	name: 'guildMemberRemove',
	async execute( member, client ) {

		const data = await guildData( member.guild.id )

		if ( !data.channelsId.goodbye ) return

		const channel = member.guild.channels.cache.get( data.channelsId.goodbye )

		if ( !member.guild.members.me.permissionsIn( channel ).has( [
			PermissionsBitField.Flags.SendMessages,
			PermissionsBitField.Flags.ViewChannel,
			PermissionsBitField.Flags.EmbedLinks,
			PermissionsBitField.Flags.AttachFiles
		] ) ) return

		const color = getHexadecimal( data.color )
        const members = member.guild.members.cache.filter( member => member.user.bot === false ).size
		const path = `./images/goodbye/`

		const canvas = createCanvas( 800, 250 )
		const ctx = canvas.getContext( '2d' )

		const background = await loadImage( path + `/${Math.floor( Math.random() * 5 )}.png` )
        const avatar = await loadImage( member.user.displayAvatarURL( { size: 256, format: 'png' } ) )

		GlobalFonts.registerFromPath( './fonts/PaytoneOne-Regular.ttf', 'default' )

		ctx.drawImage( background, 0, 0, canvas.width, canvas.height )
	
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

		drawStroke( member.user.username + ',', 40, 5, 250, canvas.height * 0.4 )

		drawStroke( 'just left the server.', 40, 5, 250, canvas.height * 0.6 )

		const attachment = new AttachmentBuilder( await canvas.encode( 'png' ), { name: 'welcome.png' } )

		channel.send( { embeds: [ {
            color: data.color,
            image: { url: 'attachment://welcome.png' },
            footer: { text: `ID: ${member.user.id} | ${members} member left` },
        } ], files: [ attachment ] } )

		function drawStroke ( text, fontSize, stroke, x, y ) {

			ctx.font = `${fontSize}px default`
			ctx.strokeStyle = 'black'
			ctx.fillStyle = 'white'
			ctx.textAlign = 'left'
			ctx.textBaseline = 'middle'
			ctx.lineWidth = stroke
			ctx.strokeText( text, x, y )
			ctx.fillText( text, x, y )

		}

		function getHexadecimal ( decimal ) {

			const int = { 10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F' }

			let hexCode = ''

			for ( let i = 0; i < 6; i++ ) {

				const remainder = ( decimal / 16 - Math.floor( decimal / 16 ) ) * 16

				hexCode += int[ remainder ] ?? remainder

				decimal = Math.floor( decimal / 16 )

			}

			return '#' + hexCode.split( '' ).reverse().join( '' )

		}

	}
}