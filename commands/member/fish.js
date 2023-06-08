const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { ComponentType } = require( 'discord.js' )
const { userData, guildData, saveUserData } = require( '../../events/functions' )

const Chance = require( 'chance' )

module.exports = {
	data: new SlashCommandBuilder()
		.setName( 'fish' )
		.setDescription('Catch a fish!')
		.addStringOption( option =>
			option.setName( 'options' )
				.setDescription( 'Select a bait or check the leaderboard' )
                .addChoices(
                    { name: 'No Bait',     value: 'no_bait'     },
                    { name: 'Worm',        value: 'worm'        },
                    { name: 'Leech',       value: 'leech'       },
                    { name: 'Minnow',      value: 'minnow'      },
                    { name: 'Cricket',     value: 'cricket'     },
                    { name: 'Grasshopper', value: 'grasshopper' }
                )
				.setRequired(true) ),
	async execute( client, interaction, args ) {

        await interaction.deferReply()

        const game = { bait: 'no_bait', timeout: 0 }
        const color = ( await guildData( interaction.guild.id ) ).color

        const filter = i => { i.deferUpdate(); return i.user.id == interaction.user.id }
        const option = interaction.options.getString( 'options' )
        const emojis = interaction.guild.emojis.cache.filter( a => a.animated ).map( a => a.id )

        if ( option != 'no_bait' ) {
            const data = await userData( interaction.user.id )
            const items = Object.fromEntries( data.user.items.map( item => [ item.id, item.amount ] ) )
    
            if ( items[ option ] ) game.bait = option
        }

        await interaction.editReply( {
            embeds: [ {
                color: color,
                author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.displayAvatarURL( { size: 4096, dynamic: true } )
                },
                image: {
                    url: 'https://media.discordapp.net/attachments/746415967235604524/885042181432303646/Penguin.gif?width=700&height=700'
                }
            } ],
            components: [ {
                type: 1,
                components: [ {
                    type: 2,
                    style: 3,
                    custom_id: 'reel',
                    emoji: {
                        name: 'emoji',
                        id: emojis[ Math.floor( Math.random() * emojis.length ) ]
                    }
                } ]
            } ],
            fetchReply: true
        } ).then( res => {
            res.awaitMessageComponent( { filter, time: option == 'no_bait' ? 20000 + ( Math.floor( Math.random() * 15 ) * 1000 ) : 8000 + ( Math.floor( Math.random() * 10 ) * 1000 ), componentType: ComponentType.Button } )
            .then( buttonPressed => {
                interaction.editReply( {
					embeds: [ {
                        color: color,
                        author: {
                            name: interaction.user.username,
                            icon_url: interaction.user.displayAvatarURL( { size: 4096, dynamic: true } )
                        },
						title: 'You caught nothing'
					} ],
					components: []
				} ) 
            } )
            .catch( timeout => {
                interaction.editReply( {
                    embeds: [ {
                        color: color,
                        author: {
                            name: interaction.user.username,
                            icon_url: interaction.user.displayAvatarURL( { size: 4096, dynamic: true } )
                        },
                        image: {
                            url: 'https://media.discordapp.net/attachments/746415967235604524/885061457765617714/Penguin2.gif?width=701&height=701'
                        }
                    } ]
                } )
                game.timer = Date.now()
                res.awaitMessageComponent( { filter, time: option == 'no_bait' ? 1500 + ( Math.floor( Math.random() * 10 ) * 100 ) : 1000 + ( Math.floor( Math.random() * 10 ) * 100 ), componentType: ComponentType.Button } )
                .then( async buttonPressed => {
                    const fish = randomFish( game.bait )
                    const result = `QTE: ${Date.now() - game.timer}ms   EXP: ${fish.xp}   $${fish.price}`

                    await saveUserData( { userId: interaction.user.id, items: { id: fish.id, name: fish.name, price: fish.price, amount: 1 }, xp: fish.xp } )

                    interaction.editReply( {
                        embeds: [ {
                            color: color,
                            author: {
                                name: interaction.user.tag,
                                icon_url: interaction.user.displayAvatarURL( { size: 4096, dynamic: true } )
                            },
                            description: `\`\`\`${addSpace( Math.floor( ( result.length - `${fish.rarity} ${fish.name}`.length ) / 2 ) )}${fish.rarity} ${fish.name}\n${result}\`\`\``,
                            thumbnail: {
                                url: fish.url
                            }
                        } ],
                        components: []
                    } )
                } )
                .catch( timeout => {
                    interaction.editReply( {
                        embeds: [ {
                            color: color,
                            author: {
                                name: interaction.user.tag,
                                icon_url: interaction.user.displayAvatarURL( { size: 4096, dynamic: true } )
                            },
                            title: 'Damn fish swam away',
                            thumbnail: {
                                url: ( urls => urls[ Math.floor( Math.random() * urls.length ) ] )( [
                                    'https://media.discordapp.net/attachments/746415967235604524/839823173595955210/ezgif.com-gif-maker_6.gif',
                                    'https://media.discordapp.net/attachments/746415967235604524/839824688498212904/ezgif.com-gif-maker_8.gif',
                                    'https://media.discordapp.net/attachments/746415967235604524/839824698778583060/ezgif.com-gif-maker_7.gif'
                                ] )
                            }
                        } ],
                        components: []
                    } )
                } )
            } )
        } )

        function addSpace( num ) { return Array( num ).fill('\xa0').join('') }

		function randomFish( bait ) {

            switch ( bait ) {
                case 'no_bait':     bait = [ 82, 10, 5, 3, 0 ];   break
                case 'worm':        bait = [ 60, 25, 10, 5, 0 ];  break
                case 'leech':       bait = [ 50, 26, 15, 8, 1 ];  break
                case 'minnow':      bait = [ 33, 28, 23, 15, 1 ]; break
                case 'cricket':     bait = [ 20, 25, 35, 18, 2 ]; break
                case 'grasshopper': bait = [ 8, 30, 30, 29, 3 ];  break
            }

			const chance = new Chance().weighted( [ 'Common', 'Uncommon', 'Rare', 'Legendary', 'Mythic' ], bait )

			const fishes = [
				{ name: 'Pufferfish',  id: 'pufferfish',  price: 8,   rarity: 'Common',    xp: (5 + Math.floor(Math.random() * 10)),  url: 'https://media.discordapp.net/attachments/746415967235604524/839421366431514634/latest.png' },
				{ name: 'Anchovy',     id: 'anchovy',     price: 8,   rarity: 'Common',    xp: (5 + Math.floor(Math.random() * 10)),  url: 'https://media.discordapp.net/attachments/746415967235604524/839424369897242654/Anchovy.png' },
				{ name: 'Sardine',     id: 'sardine',     price: 8,   rarity: 'Common',    xp: (5 + Math.floor(Math.random() * 10)),  url: 'https://media.discordapp.net/attachments/746415967235604524/839643420229894174/Sardine.png' },
				{ name: 'Salmon',      id: 'salmon',      price: 10,  rarity: 'Common',    xp: (5 + Math.floor(Math.random() * 10)),  url: 'https://media.discordapp.net/attachments/746415967235604524/839681598991499284/Salmon.png' },
				{ name: 'Bass',        id: 'bass',        price: 10,  rarity: 'Common',    xp: (5 + Math.floor(Math.random() * 10)),  url: 'https://media.discordapp.net/attachments/746415967235604524/839647492004904960/Bass.png' },
				{ name: 'Tuna',        id: 'tuna',        price: 15,  rarity: 'Uncommon',  xp: (10 + Math.floor(Math.random() * 15)), url: 'https://media.discordapp.net/attachments/746415967235604524/839719735020486667/Tuna.png' },
				{ name: 'Octopus',     id: 'octopus',     price: 15,  rarity: 'Uncommon',  xp: (10 + Math.floor(Math.random() * 15)), url: 'https://media.discordapp.net/attachments/746415967235604524/839723103092736000/Octopus.png' },
				{ name: 'Eel',         id: 'eel',         price: 18,  rarity: 'Uncommon',  xp: (10 + Math.floor(Math.random() * 15)), url: 'https://media.discordapp.net/attachments/746415967235604524/839728986922024960/eEL.png' },
				{ name: 'Flounder',    id: 'flounder',    price: 18,  rarity: 'Uncommon',  xp: (10 + Math.floor(Math.random() * 15)), url: 'https://media.discordapp.net/attachments/746415967235604524/839731518329847808/Flounder.png' },
				{ name: 'Carp',        id: 'carp',        price: 20,  rarity: 'Uncommon',  xp: (10 + Math.floor(Math.random() * 15)), url: 'https://media.discordapp.net/attachments/746415967235604524/839735619545726976/Carp.png' },
				{ name: 'Squid',       id: 'squid',       price: 20,  rarity: 'Uncommon',  xp: (10 + Math.floor(Math.random() * 15)), url: 'https://media.discordapp.net/attachments/746415967235604524/839736360750284800/Squid.gif' },
				{ name: 'Lionfish',    id: 'lionfish',    price: 25,  rarity: 'Rare',      xp: (20 + Math.floor(Math.random() * 20)), url: 'https://media.discordapp.net/attachments/746415967235604524/839791786024108042/Lionfish.png' },
				{ name: 'Clownfish',   id: 'clownfish',   price: 25,  rarity: 'Rare',      xp: (20 + Math.floor(Math.random() * 20)), url: 'https://media.discordapp.net/attachments/746415967235604524/839737210252951572/Clownfish.png' },
				{ name: 'Catfish',     id: 'catfish',     price: 25,  rarity: 'Rare',      xp: (20 + Math.floor(Math.random() * 20)), url: 'https://media.discordapp.net/attachments/746415967235604524/839795055128346674/Catfish.png' },
				{ name: 'Red Snapper', id: 'red_snapper', price: 30,  rarity: 'Rare',      xp: (20 + Math.floor(Math.random() * 20)), url: 'https://media.discordapp.net/attachments/746415967235604524/839807563792252939/Red_Snapper.png' },
				{ name: 'Goldfish',    id: 'goldfish',    price: 50,  rarity: 'Legendary', xp: (30 + Math.floor(Math.random() * 25)), url: 'https://media.discordapp.net/attachments/746415967235604524/839796295073398804/Goldfish.png' },
				{ name: 'Piranha',     id: 'piranha',     price: 55,  rarity: 'Legendary', xp: (30 + Math.floor(Math.random() * 25)), url: 'https://media.discordapp.net/attachments/746415967235604524/839816446619025448/Piranha.png' },
				{ name: 'Sturgeon',    id: 'sturgeon',    price: 55,  rarity: 'Legendary', xp: (30 + Math.floor(Math.random() * 25)), url: 'https://media.discordapp.net/attachments/746415967235604524/839947805812195338/Sturgeon.png' },
				{ name: 'Angler',      id: 'angler',      price: 55,  rarity: 'Legendary', xp: (30 + Math.floor(Math.random() * 25)), url: 'https://media.discordapp.net/attachments/746415967235604524/839797724865364008/Angler.png' },
				{ name: 'Coelacanth',  id: 'coelacanth',  price: 60,  rarity: 'Legendary', xp: (30 + Math.floor(Math.random() * 25)), url: 'https://media.discordapp.net/attachments/746415967235604524/839949721476268063/Coelacanth.png-' },
				{ name: 'Magikarp',    id: 'magikarp',    price: 100, rarity: 'Mythic',    xp: (50 + Math.floor(Math.random() * 30)), url: 'https://media.discordapp.net/attachments/746415967235604524/839682383149006888/tumblr_msu2d6x4WM1scncwdo1_500.gif?width=494&height=650' },
				{ name: 'Tiny Diana',  id: 'tiny_diana',  price: 100, rarity: 'Mythic',    xp: (50 + Math.floor(Math.random() * 30)), url: interaction.guild.members.cache.get('797298568595243029') ? interaction.guild.members.cache.get('797298568595243029').user.displayAvatarURL( { size: 4096, dynamic: true } ) : 'https://media.discordapp.net/attachments/746415967235604524/885472079447732235/Background.png' }
			]
            
			return ( filteredFish => filteredFish[ Math.floor( Math.random() * filteredFish.length ) ] )( fishes.filter( fish => fish.rarity == chance ) )

		}

	}
}