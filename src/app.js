/**
 * This main Class requires the modules {@link express} and
 * {@link module:request} and {@link module:jsdom} and {@link module:restify}
 */
var request = require('request'),  
    jsdom = require('jsdom'),
	express = require('express'),
	restify = require('restify');
var deputadoController = require('./deputadoController.js');

/** Create a restfy server. */
var server = restify.createServer({
	name: 'myapp',
	version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.listen(3000, function () {
  console.log('%s listening at %s', server.name, server.url);
});

/** GET method of server. 
 * @param {string} url, method get of server.
 */
server.get("/", function (req, res, next) {
	deputadoController.list(function (resp){
		var title = '<h2>LISTA DE DEPUTADOS</h2>';
		var table = '<table style="width:100%;border:1px solid black;">';
		for (var i =0; i < resp.length; i++){
			/*jshint -W030*/
			table = table + '<tr style="border:1px solid black;">';
			table = table + '<td style="border:1px solid black;">' + resp[i]._doc.fullName; + '</td>';
			table = table + '<td style="border:1px solid black;">' + resp[i]._doc.birthday; + '</td>';
			table = table + '<td style="border:1px solid black;">' + resp[i]._doc.party; + '</td>';
			table = table + '<td style="border:1px solid black;">' + resp[i]._doc.state; + '</td>';
			table = table + '<td style="border:1px solid black;">' + resp[i]._doc.main; + '</td>';
			table = table + '<td style="border:1px solid black;">' + resp[i]._doc.phone; + '</td>';
			table = table + '</tr>';
			/*jshint +W030*/
		}
		table = table + '</table>';
		var body = '<html><head><meta charset="utf-8" /><head><body>'+ title + '<br>' + table+'</body></html>';
		res.writeHead(200, {
			'Content-Length': Buffer.byteLength(body),
			'Content-Type': 'text/html'
		});
		res.write(body);
		res.end();
	});
});

/** POST method of server. 
 * * @param {string} url, method post of server.
 */
server.post('/api', function (req, res, next) {
	deputadoController.save(req.params, function(resp) {
		res.json(resp);
	});
});

/** Create a client for call POST. */
var client = restify.createJsonClient({
  url: 'http://localhost:3000',
  version: '1.0.0'
});

/** 
 * This function make a parse of html content for json. 
 * @param {string} information of deputado.
 * @param {deputado} ref of deputado object .
 */	
function formatInformacoesDeputado(informacoes, deputado){
	informacoes = informacoes.replace(/\s{2,}/g, '');
	var infos = informacoes.split('-');
	var partidoEstado = infos[0].split(':')[1];
	deputado.party = partidoEstado.split('/')[0].replace(' ', '');
	deputado.state = partidoEstado.split('/')[1].replace(' ', '');
	var fone = infos[3].split(':')[1].replace(' ', '');
	deputado.phone = fone + '-' + infos[4];
}
	
/** 
 * This function make a parse of html content for json. 
 * @param {string} html
 */	
function parseHtmlToJson(html){
	var listDeputados = [];
	jsdom.env(
		html,
		["http://code.jquery.com/jquery.js"],
		function (err, window) {
			var $ = window.jQuery;
			var allElementsUl = $('#content').find('ul#demaisInformacoes');
			allElementsUl.each(function(i, val){
				var deputado = {};
				var ul = $(this);
				var allElementsLi = ul.find('li');
				allElementsLi.each(function (i, val){
					if (i === 0){
						deputado.fullName = $(this).find('a').first().text();
						var href = $(this).find('a:first').attr('href'); //Utilizar para pegar informações detalhadas do deputado;
					}else if (i == 1){
						var informacoesDeputado = $(this).text();
						formatInformacoesDeputado(informacoesDeputado, deputado);
					}
				});
				listDeputados.push(deputado);
			});
			client.post('/api', listDeputados, function (err, req, res, obj) {
				if(err) console.log("An error ocurred:", err);
				else console.log("New list of deputados is posted");
			});
		}
	);	
}

/**
 * Request for get the list of Deputados.
 */	
var options = {
	url: 'http://www.camara.leg.br/internet/deputado/Dep_Lista.asp?Legislatura=55&Partido=QQ&SX=QQ&Todos=None&UF=QQ&condic=QQ&forma=lista&nome=&ordem=nome&origem=None',
	headers: {
		'User-Agent': 'Mozilla/5.0'
	}
};

/**
 * This callback is displayed as part of the Requester class.
 * @callback Requester~requestCallback
 * @param {number} responseCode
 * @param {string} responseMessage
 * @param {string} body of html request
 */
function callback(error, response, body) {
	if (!error && response.statusCode == 200) {
		parseHtmlToJson(body);
	}
}

/**
 * Send a request.
 * @param {Requester~requestCallback} the request of list Deputaos.
 */
request(options, callback);

/** 
 * This function make a schedule request for refresh the list of Deputados. 
 */	
var minutes = 5, the_interval = minutes * 60 * 1000;
setInterval(function() {
  console.log("I am doing my 5 minutes check");
  request(options, callback);
}, the_interval);