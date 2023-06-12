require( 'dotenv' ).config();

const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { userData } = require( '../../events/functions' )
const { ComponentType } = require( 'discord.js' )

const moment = require( 'moment-timezone' )
const axios = require( 'axios' )

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'shop' )
		.setDescription( 'Buy or sell an item from a merchant.' )
		.addStringOption(option =>
			option.setName( 'options' )
				.setDescription( 'Select either you want to buy or sell an item' )
				.addChoices(
					{ name: 'Buy',  value: 'buy'  },
					{ name: 'Sell', value: 'sell' }
				)
				.setRequired( true )),
	async execute(client, interaction, args) {

		return

		await interaction.deferReply()

		const shop = {
			amount: 1,
			item: false
		}

		const filter = i => { i.deferUpdate(); return i.user.id == interaction.user.id }
		const time = parseInt( moment.tz('America/Los_Angeles').format( 'H HH' ) )
		const option = interaction.options.getString( 'options' )
		const data = await userData( interaction.user.id )
		const merchant = await getMerchant( time )

		data.user[ 'username' ] = interaction.user.username
		data.user[ 'avatarUrl' ] = interaction.user.displayAvatarURL( { size: 4096, dynamic: true } )

		if ( interaction.options.getString( 'options' ) == 'buy' ) {

			await interaction.editReply( buildEmbed( data.user, merchant, option, shop ) ).then( i => {

				const buttonEvent = i.createMessageComponentCollector( { filter, time: 1000 * 60, componentType: ComponentType.Button } )
				const dropdownEvent = i.createMessageComponentCollector( { filter, time: 1000 * 60, componentType: ComponentType.SelectMenu } )

				//BUTTON
				buttonEvent.on( 'collect', async i => {

					buttonEvent.resetTimer()
					dropdownEvent.resetTimer()

					switch ( i.customId ) {
						case 'leave': return buttonEvent.stop()
						case 'add': shop.amount++; break
						case 'remove' && shop.amount > 1: amount--; break
						// case 'button' && shop.item:
							
						// 	if ( shop.item.price * shop.amount > data.user.coins )
					}
					
					// if ( i.customId == 'button_4' ) return collector.stop()
					// if ( i.customId == 'button_1' ) amount++
					// if ( i.customId == 'button_2' && amount > 1 ) amount--
					// if ( i.customId == 'button_3' && item ) {
						
					// 	if ( item.price * amount > userData.user.coins ) return interaction.editReply( message( 0, 'You don\'t have enough pingu coins!' ) )
						
					// 	await Data.addItems( interaction.guild.id, interaction.user.id, item.id, item.name, amount, Math.floor( item.price * .8 ) )
					// 	await Data.coins( interaction.guild.id, interaction.user.id, -( item.price * amount ) )
						
					// 	userData = await Data.userData( interaction.guild.id, interaction.user.id )
					// 	return interaction.editReply( message( 0, `You bought ${amount} ${item.name}!` ) )
						
					// }
					// interaction.editReply( message( 0, item ? item.name + ' $' + item.price * amount : 'None' ) )

				} )

				//SELECT MENU
				dropdownEvent.on( 'collect', i => {

					buttonEvent.resetTimer()
					dropdownEvent.resetTimer()
					
					shop.item = option == 'buy' ? merchant.items[ i.values ] : data.user.items.filter( item => item.name == i.values )[ 0 ]
					interaction.editReply( buildEmbed( data.user, merchant, option, shop ) )

				} )

				buttonEvent.on( 'end', collected => {
					interaction.editReply( buildEmbed( data.user, merchant, option, shop, true ) )
					dropdownEvent.stop()
				} )

			} )

		}

		function buildEmbed( user, merchant, option, shop, left = false ) {
			if ( left ) return {
				embeds: [ {
					author: {
						name: user.username,
						icon_url: user.avatarUrl
					},
					thumbnail: {
						url: merchant.user.avatarUrl
					},
					title: merchant.id == 'nancy' ? 'You left Nancy\'s Shop.' : 'You left Diana\'s Shop.'
				} ],
				components: []
			}

			const { item, amount } = shop
			const items = option == 'buy' ?
			Object.entries( merchant.items ).map( ( [ id, item ] ) => { return {
				label: item.name,
				value: id
			} } ) :
			user.items.map( item => { return {
				label: item.name,
				value: item.id
			} } )

			return {
				embeds: [ {
					author: {
						name: user.username,
						icon_url: user.avatarUrl
					},
					thumbnail: {
						url: merchant.user.avatarUrl
					},
					title: `Welcome to ${merchant.user.username}'s Shop!`,
					description: merchant.dialogue[ Math.floor( Math.random() * merchant.dialogue.length ) ],
					fields: [ {
						name: item ? item.name + ' $' + item.price * amount : 'None',
						value: `${amount}`
					} ],
					footer: {
						text: `$${user.coins} Pingu Coins`
					}
				} ],
				components: [ {
					type: 1,
					components: [ {
						type: 3,
						custom_id: 'item',
						options: items,
						placeholder: option == 'buy' ? 'Choose and item to buy' : 'Choose an item to sell',
						min_value: 1,
						max_value: items.length
					} ]
				}, {
					type: 1,
					components: [ {
						type: 2,
						style: 3,
						custom_id: 'remove',
						label: 'Add'
					}, {
						type: 2,
						style: 4,
						custom_id: 'add',
						label: 'Remove'
					}, {
						type: 2,
						style: 1,
						custom_id: 'button',
						label: option == 'buy' ? 'Buy' : 'Sell'
					}, {
						type: 2,
						style: 2,
						custom_id: 'leave',
						label: 'Leave'
					} ]
				} ],
				fetchReply: true
			}
		}
		
		async function getMerchant( time ) {

			const merchantAccount = ( await axios.get( `https://discord.com/api/v8/users/${time <= 6 || time >= 21 ? '197003324380282880' : '797298568595243029'}`, {
				headers: {
					Authorization: `Bot ${process.env.TOKEN}`
				}
			} ) ).data

			if ( time <= 6 || time >= 21 ) return {
				id: 'nancy',
				user: {
					username: merchantAccount.username,
					avatarUrl: `https://cdn.discordapp.com/avatars/${merchantAccount.id}/${merchantAccount.avatar}.webp`
				},
				items: {
					'cricket':       { price: 40,  name: 'Cricket'       },
					'grasshopper':   { price: 80,  name: 'Grasshopper'   }
				},
				dialogue: [
					'Hi',
					'Hello',
					hours >= 5 && hours <= 11 ? 'Good Morning' : 'Good Evening',
					'Want some drugs?',
					':triumph:'
				]
			}

			if ( time >= 7 || time <=20 ) return {
				id: 'diana',
				user: {
					username: merchantAccount.username,
					avatarUrl: `https://cdn.discordapp.com/avatars/${merchantAccount.id}/${merchantAccount.avatar}.webp`
				},
				items: {
					'worm' :         { price: 5,   name: 'Worm'          },
					'leech':         { price: 10,  name: 'Leech'         },
					'minnow':        { price: 20,  name: 'Minnow'        },
					'cat_loaf':      { price: 50,  name: 'Cat Loaf'      },
					'cat_sandwhich': { price: 80,  name: 'Cat Sandwhich' },
					'cat_smoothie':  { price: 100, name: 'Cat Smoothie'  }
				},
				dialogue: [
					'Yahooooo !!!',
					'*Le Fishe* .',
					'Oui oui .',
					'Mi Perdonas .',
					'Eli is my drug dealer .',
					'DRUGS !!',
					'I had a threesome with eli and justin .',
					'poyo poyo !',
					'I\'m no weeb .',
					'I\'m smol brain .',
					'I\'ll kidnap your cats !',
					'stab stab stab',
					'Cats are very tasty .',
					'Squish the hamther, then throw them into acid !!',
					'I do mi drogas .',
					'You should try playing bandori !',
					'Cats are very yummy, we got a whole menu ! nom nom',
					'Ahegao hoodie are cursed !',
					'God damn zhongli got ass :weary:',
					'I\'m 4\'11 .',
					'Marthin look 9 and sound 9 .',
					'I want chicken fries .',
					'mmmmm nuggies so yummy .',
					'Hu tao my beloved .',
					'<a:Mario:884272894392279101>',
					'<a:CatFish:884355640796008468>'
				]
			}

		}

		// if ( hours <= 6 || hours >= 21 ) {
		// 	console.log
		// }
		// const data = await userData( interaction.user.id )

		// let itemObject = {
		// 	'worm' : { price: 5, name: 'Worm', id: 'worm' },
		// 	'leech': { price: 10, name: 'Leech', id: 'leech' },
		// 	'minnow': { price: 20, name: 'Minnow', id: 'minnow' },
		// 	'cricket': { price: 40, name: 'Cricket', id: 'cricket' },
		// 	'grasshopper': { price: 80, name: 'Grasshopper', id: 'grasshopper' },
		// 	'cat_loaf': { price: 50, name: 'Cat Loaf', id: 'cat_loaf' },
		// 	'cat_sandwhich': { price: 80, name: 'Cat Sandwhich', id: 'cat_sandwhich' },
		// 	'cat_smoothie': { price: 100, name: 'Cat Smoothie', id: 'cat_smoothie' },
		// 	'diana': { price: 0, name: 'Diana', id: 'diana' }
		// }

		// let item;
		// let componentItems;
		// let amount = 1
		// let filter = i => {
		// 	i.deferUpdate();
		// 	return i.user.id == interaction.user.id;
		// }
		// let bloooDialogue = 
		// [
		// 	'Yahooooo !!!',
		// 	'*Le Fishe* .',
		// 	'Oui oui .',
		// 	'Mi Perdonas .',
		// 	'Eli is my drug dealer .',
		// 	'DRUGS !!',
		// 	'I had a threesome with eli and justin .',
		// 	'poyo poyo !',
		// 	'I\'m no weeb .',
		// 	'I\'m smol brain .',
		// 	'I\'ll kidnap your cats !',
		// 	'stab stab stab',
		// 	'Cats are very tasty .',
		// 	'Squish the hamther, then throw them into acid !!',
		// 	'I do mi drogas .',
		// 	'You should try playing bandori !',
		// 	'Cats are very yummy, we got a whole menu ! nom nom',
		// 	'Ahegao hoodie are cursed !',
		// 	'God damn zhongli got ass :weary:',
		// 	'I\'m 4\'11 .',
		// 	'Marthin look 9 and sound 9 .',
		// 	'I want chicken fries .',
		// 	'mmmmm nuggies so yummy .',
		// 	'Hu tao my beloved .',
		// 	'<a:Mario:884272894392279101>',
		// 	'<a:CatFish:884355640796008468>'
		// ]
		// bloooDialogue = bloooDialogue[ Math.floor( Math.random() * bloooDialogue.length ) ]

		// let nancyDialogue =
		// [
		// 	'Hi',
		// 	'Hello',
		// 	hours >= 5 && hours <= 11 ? 'Good Morning' : 'Good Evening',
		// 	'Want some drugs?',
		// 	':triumph:'
		// ]
		// nancyDialogue = nancyDialogue[ Math.floor( Math.random() * nancyDialogue.length ) ]

		// if ( hours <= 6 || hours >= 21 ) {
		// 	componentItems =
		// 	[ {
		// 		label: 'Cricket $40',
		// 		value: 'cricket'
		// 	}, {
		// 		label: 'Grasshopper $80',
		// 		value: 'grasshopper'
		// 	}, {
		// 		label: 'Diana FREEEEEEEEEEEE',
		// 		value: 'diana'
		// 	} ]
		// } else {
		// 	componentItems =
		// 	[ {
		// 		label: 'Worm $5',
		// 		value: 'worm'
		// 	}, {
		// 		label: 'Leech $10',
		// 		value: 'leech'
		// 	}, {
		// 		label: 'Minnow $20',
		// 		value: 'minnow'
		// 	}, {
		// 		label: 'Cat Loaf $50',
		// 		value: 'cat_loaf'
		// 	}, {
		// 		label: 'Cat Sandwhich $80',
		// 		value: 'cat_sandwhich'
		// 	}, {
		// 		label: 'Cat Smoothie $100',
		// 		value: 'cat_smoothie'
		// 	} ]
		// }

		// //buy
		// if ( args[0].value == '0' ) {

		// 	interaction.reply( message( 0, 'None' ) ).then( i => {

		// 		let collector = i.createMessageComponentCollector( { filter, time: 1000 * 60, componentType: 'BUTTON' } )
		// 		let collector_2 = i.createMessageComponentCollector( { filter, time: 1000 * 60, componentType: 'SELECT_MENU' } )

		// 		//BUTTON
		// 		collector.on( 'collect', async i => {

		// 			collector.resetTimer()
		// 			collector_2.resetTimer()
					
		// 			if ( i.customId == 'button_4' ) return collector.stop()
		// 			if ( i.customId == 'button_1' ) amount++
		// 			if ( i.customId == 'button_2' && amount > 1 ) amount--
		// 			if ( i.customId == 'button_3' && item ) {
						
		// 				if ( item.price * amount > userData.user.coins ) return interaction.editReply( message( 0, 'You don\'t have enough pingu coins!' ) )
						
		// 				await Data.addItems( interaction.guild.id, interaction.user.id, item.id, item.name, amount, Math.floor( item.price * .8 ) )
		// 				await Data.coins( interaction.guild.id, interaction.user.id, -( item.price * amount ) )
						
		// 				userData = await Data.userData( interaction.guild.id, interaction.user.id )
		// 				return interaction.editReply( message( 0, `You bought ${amount} ${item.name}!` ) )
						
		// 			}
		// 			interaction.editReply( message( 0, item ? item.name + ' $' + item.price * amount : 'None' ) )

		// 		} )

		// 		//SELECT MENU
		// 		collector_2.on( 'collect', i => {

		// 			collector.resetTimer()
		// 			collector_2.resetTimer()
					
		// 			item = itemObject[i.values]
		// 			interaction.editReply( message( 0, item ? item.name + ' $' + item.price * amount : 'None' ) )

		// 		} )

		// 		collector.on( 'end', collected => {
		// 			interaction.editReply( message( 2, 'Goodbye' ) )
		// 			collector_2.stop()
		// 		} )

		// 	} )
		// }

		// //sell
		// if ( args[0].value == '1' ) {

		// 	if ( userData.user.items.length == 0 ) return interaction.reply( message( 2, 'You don\'t have any items to sell!' ) )

		// 	componentItems = []
		// 	userData.user.items.forEach( a => componentItems.push( { label: a.name + ' $' + a.price, value: a.id } ) )

		// 	interaction.reply( message( 1, 'None' ) ).then( i => {

		// 		let collector = i.createMessageComponentCollector( { filter, time: 1000 * 60, componentType: 'BUTTON' } )
		// 		let collector_2 = i.createMessageComponentCollector( { filter, time: 1000 * 60, componentType: 'SELECT_MENU' } )

		// 		//BUTTON
		// 		collector.on( 'collect', async i => {

		// 			collector.resetTimer()
		// 			collector_2.resetTimer()

		// 			if ( i.customId == 'button_4' ) return collector.stop()
		// 			if ( i.customId == 'button_1' ) amount++
		// 			if ( i.customId == 'button_2' && amount > 1 ) amount--
		// 			if ( i.customId == 'button_3' && item ) {
						
		// 				if ( amount > item.amount ) return interaction.editReply( message( 0, `You don\'t have ${amount} ${item.name}!` ) )
						
		// 				interaction.editReply( message( 1, `You earned ${item.price * amount} Pingu Coins` ) )

		// 				await Data.removeItems( interaction.guild.id, interaction.user.id, item.id, amount )
		// 				await Data.coins( interaction.guild.id, interaction.user.id, item.price * amount )
						
		// 				userData = await Data.userData( interaction.guild.id, interaction.user.id )

		// 				if ( userData.user.items.length == 0 ) return collector.stop()

		// 				if ( userData.user.items.filter( a => a.id == item.id ).length > 0 ) {
		// 					item = { price: item.price, name: item.name, id: item.id, amount: userData.user.items.filter( a => item.id == a.id )[0].amount }
		// 				} else { item = null }
		// 				componentItems = []
		// 	            return userData.user.items.forEach( a => componentItems.push( { label: a.name + ' $' + a.price, value: a.id } ) )
						
		// 			}
		// 			interaction.editReply( message( 1, item ? item.name + ' $' + item.price * amount : 'None' ) )

		// 		} )

		// 		//SELECT MENU
		// 		collector_2.on( 'collect', i => {

		// 			collector.resetTimer()
		// 			collector_2.resetTimer()
					
		// 			let filteredItem = userData.user.items.filter( a => i.values == a.id )[0]
		// 			item = { price: filteredItem.price, name: filteredItem.name, id: filteredItem.id, amount: filteredItem.amount }
		// 			interaction.editReply( message( 1, item ? item.name + ' $' + item.price * amount : 'None' ) )

		// 		} )

		// 		//End event
		// 		collector.on( 'end', collected => {
		// 			interaction.editReply( message( 2, 'Goodbye' ) )
		// 			collector_2.stop()
		// 		} )

		// 	} )

		// }

		// //functions
		// function message( a, b ) {
		// 	if ( a == 2 ) return {
		// 		embeds: [ {
		// 			author: {
		// 				name: interaction.user.tag,
		// 				icon_url: interaction.user.displayAvatarURL( { size: 4096, dynamic: true } )
		// 			},
		// 			thumbnail: {
		// 				url: hours <= 6 || hours >= 21 ? ( interaction.guild.members.cache.get('197003324380282880') ? interaction.guild.members.cache.get('197003324380282880').user.displayAvatarURL( { size: 4096, dynamic: true } ) : '' ) : interaction.guild.members.cache.get('797298568595243029') ? interaction.guild.members.cache.get('797298568595243029').user.displayAvatarURL( { size: 4096, dynamic: true } ) : ''
		// 			},
		// 			title: hours <= 6 || hours >= 21 ? 'You left Nancy\'s Shop.' : 'You left Diana\'s Shop.',
		// 			description: hours <= 6 || hours >= 21 ? `${interaction.guild.members.cache.get('197003324380282880').user.username}: ` + b : `${interaction.guild.members.cache.get( '797298568595243029' ).user.username}: ` + b,
		// 		} ],
		// 		components: []
		// 	}
		// 	return {
		// 		embeds: [ {
		// 			author: {
		// 				name: interaction.user.tag,
		// 				icon_url: interaction.user.displayAvatarURL( { size: 4096, dynamic: true } )
		// 			},
		// 			thumbnail: {
		// 				url: hours <= 6 || hours >= 21 ? ( interaction.guild.members.cache.get('197003324380282880') ? interaction.guild.members.cache.get('197003324380282880').user.displayAvatarURL( { size: 4096, dynamic: true } ) : '' ) : interaction.guild.members.cache.get('797298568595243029') ? interaction.guild.members.cache.get('797298568595243029').user.displayAvatarURL( { size: 4096, dynamic: true } ) : ''
		// 			},
		// 			title: hours <= 6 || hours >= 21 ? 'Welcome to Nancy\'s Shop.' : 'Welcome to Diana\'s Shop.',
		// 			description: hours <= 6 || hours >= 21 ? `${interaction.guild.members.cache.get('197003324380282880').user.username}: ` + nancyDialogue : `${interaction.guild.members.cache.get( '797298568595243029' ).user.username}: ` + bloooDialogue,
		// 			fields: [ {
		// 				name: b,
		// 				value: amount.toString()
		// 			} ],
		// 			footer: {
		// 				text: '$' + userData.user.coins + ' Pingu Coins'
		// 			}
		// 		} ],
		// 		components: [ {
		// 			type: 1,
		// 			components: [ {
		// 				type: 3,
		// 				custom_id: 'select_2',
		// 				options: componentItems,
		// 				placeholder: a == 0 ? 'Choose and item to buy' : 'Choose an item to sell',
		// 				min_value: 1,
		// 				max_value: componentItems.length
		// 			} ]
		// 		}, {
		// 			type: 1,
		// 			components: [ {
		// 				type: 2,
		// 				style: 3,
		// 				custom_id: 'button_1',
		// 				label: 'Add'
		// 			}, {
		// 				type: 2,
		// 				style: 4,
		// 				custom_id: 'button_2',
		// 				label: 'Remove'
		// 			}, {
		// 				type: 2,
		// 				style: 1,
		// 				custom_id: 'button_3',
		// 				label: a == 0 ? 'Buy' : 'Sell'
		// 			}, {
		// 				type: 2,
		// 				style: 2,
		// 				custom_id: 'button_4',
		// 				label: 'Leave'
		// 			} ]
		// 		} ],
		// 		fetchReply: true
		// 	}
		// }

	}
}