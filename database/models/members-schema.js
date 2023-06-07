const mongoose = require( 'mongoose' );

const reqString = {
    type: String,
    required: true
}
const reqDecimal = {
	type: mongoose.Types.Decimal128,
	required: true
}

const profileSchema = mongoose.Schema( {
    _id: reqString,
	user: {
		type: Object,
		default: {
			score: {
				type: Number,
				default: 0
			},
			coins: {
				type: Number,
				default: 0
			},
			level: {
				type: Number,
				default: 1
			},
			xp: {
				type: Number,
				default: 0
			},
			items: {
				type: Array
			}
		}
	},
	orientation: {
		type: Object,
		default: {
			asexuality: reqDecimal,
			straight:   reqDecimal,
			gay:        reqDecimal
		}
	},
	waifu: {
		type: Object,
		default: {
			attractive: reqDecimal,
			teasing:    reqDecimal,
			fashion:    reqDecimal,
			loving:     reqDecimal,
			horny:      reqDecimal,
			cute:       reqDecimal,
			text:       reqString
		}
	},
	games: {
		type: Object,
		default: {}
	}
} )

module.exports = mongoose.model( 'members', profileSchema, 'members' )