require( 'dotenv' ).config();

const { PermissionsBitField, InteractionType } = require( 'discord.js' )

module.exports = {
	name: 'interactionCreate',
	async execute( interaction, client ) {

		let command;

		switch ( true ) {

			case interaction.isCommand():

				command = client.commands.find( file => file.get( interaction.commandName ) ).get( interaction.commandName )

				switch ( true ) {
		
					case client.commands.get( 'admin' ).has( interaction.commandName ):
		
						if ( !interaction.guild.members.cache.get( interaction.user.id ).permissions.has( PermissionsBitField.Flags.Administrator ) ) return await interaction.reply( {
							content: 'You\'re not the administrator!', ephemeral: true
						} )

						break
		
					case client.commands.get( 'owner' ).has( interaction.commandName ):
		
						if ( interaction.user.id != process.env.OWNER ) return await interaction.reply( {
							content: 'You\'re not the owner!', ephemeral: true
						} )

						break
		
				}
		
				try { await command.execute( client, interaction ) } catch ( err ) {
					console.error( err );
					interaction.reply( { content: 'There was an error while executing this command!', ephemeral: true } )
				}

				break

			case interaction.type == InteractionType.ModalSubmit:

				const { customId } = interaction

				command = client.components.get( 'modals' ).get( customId )

				try { await command.execute( client, interaction ) } catch ( err ) { console.log( err ) }

				break

		}

	}
}