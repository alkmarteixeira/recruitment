/**
 * A controller that CRUD deputado!
 * @module hello/world
 */
var db = require('./db_config.js');


/** List all deputados. 
 * @param {function} the callback function.
 */
exports.list = function(callback){
	db.Deputado.find({}, function(error, deputados) {
		if(error) {
			console.log('An error ocurred' + error);
		} else {
			callback(deputados);
		}
	});
};

/** Save a new list deputados and remove the old. 
 * @param {array} list of Deputados.
 * @param {function} the callback function.
 */
exports.save = function(data, callback){
  db.Deputado.collection.remove(); 
  db.Deputado.collection.insertMany(data, function(error ,response) {
			if(error) console.log('An error ocurred:' + error);
			else console.log('Json save on DB');
  });
};