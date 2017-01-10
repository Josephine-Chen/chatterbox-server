/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var fs = require('fs');
var messageData = require('./messageData.js');
//console.log('Messages are', messageData);


var requestHandler = function(request, response) {

  //console.log('HELLOOOOOOOOOOOOOOO!!!!!!');
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = 'application/json';

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);
  //console.log('before if statements');
  if(request.url === '/classes/messages') {
    //console.log('classes/messages triggered');
    if (request.method === 'GET') {

      fs.readFile('messages', 'utf8', function(err, data){
        if (err) {
          response.writeHead(404);
          response.end();
        }
        data = data.substring(0, data.length - 5);
        var arrayData1 = data.split('SPLIT');
        var arrayData = arrayData1.map(function(value){
          return JSON.parse(value);
        });

        response.writeHead(200, headers);

        var resultsObject = {results: arrayData};
        console.log('RESULTS OBJECT IS', resultsObject)
        var resultsString = JSON.stringify(resultsObject);
        var reParsed = JSON.parse(resultsString);
        console.log('REPARSED IN FUNCTION', reParsed);
        //var resultsString2 = `"${resultsString}"`;
        //console.log('PARSED STRING', JSON.parse(resultsString));
        response.end(resultsString);
      });
    }
    else if (request.method === 'POST') {
      request.on('data', function(text){
        var parsed = JSON.parse(text);
        console.log('POST BEFORE APPENDING FILE');
        fs.appendFile('messages', JSON.stringify(parsed) + 'SPLIT', 'utf8', function(err){
          if (err) {
            console.log('there was an error posting', err);
            response.writeHead(404);
          } else {
            console.log('POST POST POST POST');
            response.writeHead(201, headers);
          }
        });
      });

      request.on('end', function() {
        console.log('end of request');
        response.end('{"success" : "Post succeeded", "status" : 201}');
      });
    }
  } else if (request.method === 'OPTIONS') {
    headers['Content-Type'] = 'httpd/unix-directory';
    response.end();

  } else {
    response.writeHead(404, headers);
    response.end();
  }

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  response.end('Hello, World! End of file');
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

module.exports.requestHandler = requestHandler;
