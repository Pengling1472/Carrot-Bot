const { createCanvas, loadImage, GlobalFonts } = require( '@napi-rs/canvas' );
const { AttachmentBuilder, PermissionsBitField } = require( 'discord.js' );
const { guildData } = require( './functions' );
const GIFEncoder = require( 'gif-encoder-2' );
const moment = require( 'moment-timezone' );
const gifFrames = require('gif-frames');
const fs = require( 'fs' );

module.exports = {
	name: 'guildMemberAdd',
	async execute( member, client ) {

		const data = await guildData( member.guild.id )

		if ( !data.channelsId.welcome ) return

		if (
			data.autorole.length > 0 &&
			member.guild.members.me.permissions.has( PermissionsBitField.Flags.ManageRoles )
		) for ( i = 0; i < data.autorole.length; i++ ) if ( member.guild.roles.cache.get( data.autorole[ i ] ) ) if (
			member.guild.members.me.roles.cache.find( role => role.permissions.has( PermissionsBitField.Flags.ManageRoles ) ).position > member.guild.roles.cache.get( data.autorole[ i ] ).position
		) await member.roles.add( data.autorole[ i ] )

		const channel = member.guild.channels.cache.get( data.channelsId.welcome )

		if ( !member.guild.members.me.permissionsIn( channel ).has( [
			PermissionsBitField.Flags.ViewChannel,
			PermissionsBitField.Flags.SendMessages,
			PermissionsBitField.Flags.EmbedLinks,
			PermissionsBitField.Flags.AttachFiles
		] ) ) return

		const message = [
			`A wild ${member.user} appeared!`,
			`${member.user} just showed up!`,
			`${member.user} just landed!`,
			`${member.user} joined the party!`,
			`${member.user} is here!`,
			`${member.user} hopped into the server!`,
			`Welcome ${member.user}, say hi!`,
			`Yay you made it, ${member.user}!`,
			`Good to see you, ${member.user}!`,
			`Welcome ${member.user}. We hope you brought pizza!`,
			`${member.user} just slid into the server!`,
			`Everyone welcome ${member.user}!`,
		]

		const color = getHexadecimal( data.color )
		const month = moment.tz( data.timezone ).month()
		const members = member.guild.members.cache.filter( member => member.user.bot === false ).size
		const path = `./images/welcome/${month >= 11 || month <= 1 ? 'winter' : month >= 8 && month <= 10 ? 'autumn' : 'default'}`

		const canvas = createCanvas( 800, 250 )
		const ctx = canvas.getContext( '2d' )

		const background = await loadImage( path + `/${Math.floor( Math.random() * 5 )}.png` )

		GlobalFonts.registerFromPath( './fonts/PaytoneOne-Regular.ttf', 'default' )

		if ( fs.existsSync( path + '/animated' ) && /\.(gif)/.test( member.user.displayAvatarURL( { size: 256, dynamic: true } ) ) ) return avatarAnimated()
		if ( fs.existsSync( path + '/animated' ) ) return animated()

		const avatar = await loadImage( member.user.displayAvatarURL( { size: 256, format: 'png' } ) )

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

		drawStroke( `Welcome to the server,`, 40, 5, 250, canvas.height * 0.4 )

		drawStroke( member.user.username + '!', 40, 5, 250, canvas.height * 0.6 )

		const attachment = new AttachmentBuilder( await canvas.encode( 'png' ), { name: 'welcome.png' } )

		channel.send( { embeds: [ {
			color: data.color,
			description: message[ Math.floor( Math.random() * message.length ) ],
			image: { url: 'attachment://welcome.png' },
			footer: { text: `ID: ${member.user.id} | ${members}${( x => x === 1 ? 'st' : x === 2 ? 'nd' : x === 3 ? 'rd' : 'th' )( members % 10 )} member` },
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

		async function avatarAnimated() {

			const animatedGif = member.user.displayAvatarURL( { size: 256, format: 'gif' } )

			gifFrames( { url: animatedGif, frames: 'all', outputType: 'jpg' } ).then( async frameData => {

				if ( frameData.length < 4 || 1000 / Math.floor( frameData.length / 4 ) < 100 ) return animated()

				const encoder = new GIFEncoder( canvas.width, canvas.height )
				encoder.setDelay( 1000 / Math.floor( frameData.length / 4 ) )
				encoder.start()

				for ( let i = 0; i < frameData.length; i++ ) {

					const avatar = await loadImage( frameData[ i ].getImage()._obj )
					const snowFrame = await loadImage( path + `/animated/${Math.floor( i / Math.floor( frameData.length / 4 ) )}.png` )
	
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
		
					drawStroke( `Welcome to the server,`, 40, 5, 250, canvas.height * 0.4 )
		
					drawStroke( member.user.username + '!', 40, 5, 250, canvas.height * 0.6 )
		
					ctx.drawImage( snowFrame, 0, 0, canvas.width, canvas.height )
		
					encoder.addFrame( ctx )

				}

				encoder.finish()

				const attachment = new AttachmentBuilder( encoder.out.getData(), { name: 'welcome.gif' } )
	
				channel.send( { embeds: [ {
					color: data.color,
					description: message[ Math.floor( Math.random() * message.length ) ],
					image: { url: 'attachment://welcome.gif' },
					footer: { text: `ID: ${member.user.id} | ${members}${( x => x === 1 ? 'st' : x === 2 ? 'nd' : x === 3 ? 'rd' : 'th' )( members % 10 )} member` },
				} ], files: [ attachment ] } )

			} )

		}

		async function animated() {

			const encoder = new GIFEncoder( canvas.width, canvas.height )
			encoder.setDelay( 1000 )
			encoder.start()

			const avatar = await loadImage( member.user.displayAvatarURL( { size: 256, format: 'png' } ) )

			for ( let i = 0; i < 5; i++ ) {

				const snowFrame = await loadImage( path + `/animated/${i}.png` )
	
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
	
				drawStroke( `Welcome to the server,`, 40, 5, 250, canvas.height * 0.4 )
	
				drawStroke( member.user.username + '!', 40, 5, 250, canvas.height * 0.6 )
	
				ctx.drawImage( snowFrame, 0, 0, canvas.width, canvas.height )
	
				encoder.addFrame( ctx )
		
			}

			encoder.finish()

			const attachment = new AttachmentBuilder( encoder.out.getData(), { name: 'welcome.gif' } )

			channel.send( { embeds: [ {
				color: data.color,
				description: message[ Math.floor( Math.random() * message.length ) ],
				image: { url: 'attachment://welcome.gif' },
				footer: { text: `ID: ${member.user.id} | ${members}${( x => x === 1 ? 'st' : x === 2 ? 'nd' : x === 3 ? 'rd' : 'th' )( members % 10 )} member` },
			} ], files: [ attachment ] } )

		}

	}
}