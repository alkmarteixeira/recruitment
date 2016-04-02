/** Config the conection with mongodb
 * This class requires the modules {@link mongoose} and
 * {@link module:mongoose}.
 */
/** connection string. */
var db_string= 'mongodb://localhost:27017/recruitmentdb2';
var mongoose = require('mongoose').connect(db_string);
var db = mongoose.connection;

/** opens connection */
db.on('error', console.error.bind(console, 'Erro ao conectar no banco'));

/** Create schema of Deputados*/
db.once('open', function() {
	var depJsonSchema = mongoose.Schema({
		fullname: String,
		birthday: String,
		party: String,
		state: String,
		main: Boolean,
		phone: String
	});
	exports.Deputado = mongoose.model('Deputado', depJsonSchema);
});