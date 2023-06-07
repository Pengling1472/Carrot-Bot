const mongo = require( '../database/mongo' );
const Chance = require( 'chance' );

const guildsSchema = require( '../database/models/guilds-schema' );
const membersSchema = require( '../database/models/members-schema' );

module.exports = client  => {}

module.exports.userData = async userId => {

    return await mongo().then( async () => {

		let data = await membersSchema.findById( userId );

		if ( !data ) {

			let straight = Math.floor( Math.random() * 101 );
			let gay = Math.floor( Math.random() * ( 100 - straight ) );
			let asexuality = 100 - ( straight + gay );
			let waifu = new Array();
			let waifuText = [ [
				'is a radiant',
				'is an S-tier',
				'is an A-grade',
				'is a jealousy-inducing',
				'is an underrated',
				'is a cultured',
				'is a perfect',
				'is a tasteful',
				'is an ABSOLUTE',
				'is an EXALTED'
			], [
				'for being cute online all day',
				'for being a fucking badass',
				'for bashing simps',
				'for being everyone\'s mom',
				'for loving anime',
				'for their sheer babie energy',
				'for being a violent tsundere',
				'for deserving all of the world\'s headpats',
				'for being DUMMY thicc',
				'for kissing their friends',
				'for posting lewds',
				'for being a cuddlebug',
				'for their "activities" on a private account'
			] ]

			for ( i = 0; i < 6; i++ ) waifu.push( Chance().weighted( [ 0, 1 ], [ 10, 90 ] ) == 0 ? 30 + ( Math.floor( Math.random() * 5 ) * 10 ) : ( Math.random() * 10 ).toFixed(1) )

			waifu = Chance().shuffle( waifu )

			data = await membersSchema.create( {

				_id: userId,
				user: {
					items: [],
					coins: 50,
					level: 1,
					score: 0,
					xp: 0
				},
				orientation: {
					asexuality: asexuality,
					straight: straight,
					gay: gay,
					text: straight > 85 ? 'Very Straight'
						: gay > 85 ? 'Very Gay'
						: asexuality > 70 ? 'Asexual'
						: straight > 75 ? 'Pretty Straight'
						: gay > 75 ? 'Pretty Gay'
						: straight > 55 ? 'Little Straight'
						: gay > 55 ? 'Little Gay'
						: straight > 45 && gay > 45 ? 'Bisexual'
						: straight > gay ? 'Bisexual but also a little straight'
						: 'Bisexual but also a little gay'
				},
				waifu: {
					attractive: waifu[0],
					teasing:    waifu[1],
					fashion:    waifu[2],
					loving:     waifu[3],
					horny:      waifu[4],
					cute:       waifu[5],
					text:       `${waifuText[0][ Math.floor( Math.random() * waifuText.length ) ]} waifu known ${waifuText[1][ Math.floor( Math.random() * waifuText[1].length ) ]}.`
				},
				games: {}

			} );

			data.save();
		
		}

		return data

    } )

}

module.exports.guildData = async guildId => {

	return await mongo().then ( async () => {

		let data = await guildsSchema.findById( guildId )

		if ( !data ) {

			data = await guildsSchema.create( {

				_id: guildId,
				channelsId: {
					welcome: '',
					goodbye: '',
					logs: '',
					vc: ''
				},
				administrator:  [],
				autorole: [],
				timezone: 'America/Los_Angeles',
				color: '16777215'
				
			} )

			data.save()

		}

		return data

	} )

}

module.exports.saveGuildData = async ( {
	guildId,
	channelsId,
	administrator,
	autorole,
	timezone,
	color
} ) => {

	return await mongo().then( async () => {

		switch ( true ) {

			case channelsId != undefined:

				await guildsSchema.findByIdAndUpdate( guildId, {
					channelsId: channelsId
				}, { upsert: true } )

				break

			default:

				await guildsSchema.findByIdAndUpdate( guildId, {
					administrator: administrator,
					autorole: autorole,
					timezone: timezone ?? 'America/Los_Angeles',
					color: color
				}, { upsert: true } )

		}
	
	} )

}

module.exports.saveUserData = async ( {
	userId,
	level,
	coins,
	xp
} ) => {

	return await mongo().then( async () => {

		switch ( true ) {

			case level != undefined: await membersSchema.findByIdAndUpdate( userId, {
					$inc: {
						"user.level": level
					},
					$set: {
						"user.xp": xp
					}
				}, { upsert: true } ); break
			case xp != undefined: await membersSchema.findByIdAndUpdate( userId, {
					$inc: {
						"user.xp": xp,
						"user.score": xp
					}
				}, { upsert: true } ); break
			case coins != undefined: await membersSchema.findByIdAndUpdate( userId, {
					$inc: {
						"user.coins": coins
					}
				}, { upsert: true } ); break

		}
	
	} )

}

module.exports.getUserRank = async ( userId ) => {

	return await mongo().then( async () => {

		return ( await membersSchema.aggregate( [
			{ '$sort': { 'user.score': -1 } },
		] ) ).map( ( user, rank ) => { return { _id: user._id, rank: rank } } ).filter( user => user._id == userId )[ 0 ].rank + 1
	
	} )

}