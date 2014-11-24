
// Original code copyright Saleh Hamadeh: http://shamadeh.com/blog/web/nodejs/express/2014/07/20/ExpressMultipleSites.html
// Original commit is Saleh's code entirely, released under undeclared license
// Xenmen (Daniel Tadeuszow) assumes CC attribution is acceptable
// All code added since the initial commit is released under the AGPL3+
// A copy of the license is included in the repo, and the original can be found @ http://opensource.org/licenses/AGPL-3.0

// Module dependencies.
var application_root = __dirname;

	//
	express = require( 'express' );

	//
	var bodyParser = require( 'body-parser' );

	//Better static-site serving
	var serveStatic = require('serve-static');

	//
	var spawn = require("child_process").spawn;

	//
	//var methodOverride = require( 'method-override' );

	//
	var errorhandler = require( 'errorhandler' );

	//Enables multi-site hosting
	var vhost = require( 'vhost' );

function createVirtualHost(domainName, dirPath) {
	var newhost = express();

	//parses request body and populates request.body
	newhost.use( bodyParser.urlencoded({ extended: true }) );

	//checks request.body for HTTP method overrides
	//newhost.use( methodOverride() );

	//Where to serve static content
	/*
	newhost.use(
		express.static(__dirname + dirPath)
	);
	*/
	//TODO expose serveStatic's options
	newhost.use( serveStatic( dirPath, {"extensions": ['html', 'png', 'jpg', 'txt']}) );

	//var serve = serveStatic('public/ftp', {'index': ['index.html', 'index.htm']})

	//Show errors
	newhost.use( errorhandler({ dumpExceptions: true, showStack: true }));

	//Generate sitemap
	//Requires the python2 library 'Beautiful Soup 4'
	//
	//var process = spawn('python',["bdt_sitemap.py", domainName + " " + dirPath]);

	return vhost(domainName, newhost)
}

//Create server
var server = express();

//Create and use the virtual hosts
//TODO: Parse from a json file
var sites= [
	["tadeuszow.com", "Tadeuszow-site/main"],
	["daniel.tadeuszow.com", "Tadeuszow-site/daniel"],
	["anita.tadeuszow.com", "Tadeuszow-site/anita"],
	["edward.tadeuszow.com", "Tadeuszow-site/edward"]
];

for (var i=0;i<sites.length;i++) {
	console.log( 'Domain: %s ', sites[i][0] );
	console.log( '\tLoaded from: %s\n', sites[i][1] );
	server.use(createVirtualHost(sites[i][0], sites[i][1]));
}

console.log("Regular domains created just fine.");

//And now, DANCHAN
var danchan_domain="chan.tadeuszow.com";
var danchan_local="public";
var danchan = express();
danchan.use( bodyParser.urlencoded({ extended: true }) );
danchan.use( serveStatic( danchan_local, {"extensions": ['html', 'png', 'jpg', 'txt']}) );
//danchan.use( errorhandler({ dumpExceptions: true, showStack: true }));
server.use(createVirtualHost(danchan_domain, danchan));

var boards=['pone', 'v'];

for (var i=0;i<boards.length;i++) {
	console.log( 'Adding board: %s ', boards[i] );
	//console.log( '\tLoaded from: %s\n', sites[i][1] );
	//server.use(createVirtualHost(sites[i][0], sites[i][1]));
}
//End Danchan code

//test server creation
//server.use(vhost("chat.tadeuszow.com", chat));
//server.use(vhost("mbooru.tadeuszow.com", newhost));

//Start server
var port = 80;
server.listen(
	port, function() {
		console.log( 'Express server listening on port %d in %s mode', port, server.settings.env );
	};
);

/*
/////
var express = require('express');
var vhost = require('vhost');

var app = express();

app.use(vhost('mail.example.com', function(req, res){}));
app.use(vhost('*.example.com', express()));
app.use(express());
express.listen();

/////
var connect = require('connect')
var serveStatic = require('serve-static')
var vhost = require('vhost')

// create main app
var app = connect()

var mailapp = connect()

// add middlewares to mailapp for mail.example.com

// create app to serve static files on subdomain
var staticapp = connect()
staticapp.use(serveStatic('public'))

// add vhost routing to main app for mail
app.use(vhost('mail.example.com', mailapp))

// route static assets for "assets-*" subdomain to get
// around max host connections limit on browsers
app.use(vhost('assets-*.example.com', staticapp))

// add middlewares and main usage to app

app.listen(3000)

*/
