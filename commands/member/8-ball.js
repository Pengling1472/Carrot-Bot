const { SlashCommandBuilder } = require( '@discordjs/builders' )

module.exports = {
	data: new SlashCommandBuilder()
		.setName( '8-ball' )
		.setDescription( 'Fortune-telling advice' )
		.addStringOption( option =>
			option.setName( 'message' )
			.setDescription( 'Give a message to get an answer.' )
			.setRequired( true ) ),
	async execute( client, interaction ) {

		const message = [
			'It is certain.',
			'It is decidedly so.',
			'Without a doubt.',
			'Yes definitely.',
			'You may rely on it.',
			'As I see it, yes.',
			'Most likely.',
			'Outlook good.',
			'Yes.',
			'Signs point to yes.',
			'Reply hazy, try again.',
			'Ask again later.',
			'Better not tell you now.',
			'Cannot predict now.',
			'Concentrate and ask again.',
			'Don\'t count on it.',
			'My reply is no.',
			'My sources say no.',
			'Outlook not so good.',
			'Very doubtful.',
		];

		( randNum => interaction.reply( {
			embeds: [ {
				color: randNum == 0 ? '65280' : randNum == 1 ? '16776960' : '16711680',
				title: '8-ball',
				description: `**Message**: ${ interaction.options.getString( 'message' ) }\n**Answer**: ${ message[ Math.floor( randNum == 0 ? Math.random() * 10 : randNum == 1 ? 10 + Math.random() * 5 : 15 + Math.random() * 5 ) ] }`,
			} ]
		} ) )( Math.floor( Math.random() * 3 ) )

	}
}