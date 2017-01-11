var utils = require('./utils');
var fs = require('fs');

var idCounter = 0;
  var actions = {
    'GET': function(request, response) {
      fs.readFile('messages', 'utf8', function(err, data) {
        if (err) {
          utils.sendResponse(response, null, 404);
        }
        utils.sendResponse(response, prepareData(data), 200);
      });
    },
    'POST': function(request, response) {
      request.on('data', function(text) {
        console.log('TEXT IS ', typeof text);
        var currentNum = JSON.stringify(text).match(/(\d+)(?!.*\d)/);
        console.log('CURRENT NUM IS ' + currentNum);
        if (currentNum.length > 0) {
          currentNum = parseInt(currentNum[0]);
        } else {
          currentNum = 0;
        }
        var parsed = JSON.parse(text);
        parsed.objectId = currentNum + 1;
        console.log('PARSED IS', parsed);

        fs.appendFile('messages', JSON.stringify(parsed) + 'SPLIT', 'utf8', function(err) {

        if (err) {
          utils.sendResponse(response, null, 404);
        }
        });
      });

      request.on('end', function() {
        var ended = {
          success: 'Post succeeded',
          status: 201
        }
        utils.sendResponse(response, ended, 201);
      });
    },
    'OPTIONS': function(request, response) {
      utils.sendResponse(response, null);
    }
  }

  var prepareData = function(data) {
    data = data.substring(0, data.length - 5);
    var arrayData1 = data.trim().split('SPLIT');
    //console.log('ARRAY DATA1 IS', arrayData1);
    var arrayData = arrayData1.map(function(value) {
      return JSON.parse(value);
    });
    //console.log('ARRAY DATA IS', arrayData);
    var resultsObject = {results: arrayData};
    return resultsObject;
  }


  // console.log('Serving request type ' + request.method + ' for url ' + request.url);
  // // .writeHead() writes to the request line and headers of the response,
  // // which includes the status and all headers.
  // response.writeHead(statusCode, headers);

  // if (request.url === '/classes/messages') {

  //   if (request.method === 'GET') {
  //     //console.log('GOT IT');
  //     fs.readFile('messages', 'utf8', function(err, data) {
  //       if (err) {
  //         console.log(err);
  //         response.writeHead(404);
  //         response.end();
  //       }
  //       console.log(data);
  //       data = data.substring(0, data.length - 5);
  //       var arrayData1 = data.split('SPLIT');
  //       var arrayData = arrayData1.map(function(value) {
  //         return JSON.parse(value);
  //       });
  //       var resultsObject = {results: arrayData};
  //       var resultsString = JSON.stringify(resultsObject);
  //       response.writeHead(200, headers);
  //       response.end(resultsString);
  //     });
  //   } else if (request.method === 'POST') {

  //     request.on('data', function(text) {
  //       var parsed = JSON.parse(text);
  //       fs.appendFile('messages', JSON.stringify(parsed) + 'SPLIT', 'utf8', function(err) {
  //         if (err) {
  //           response.writeHead(404);
  //         } else {
  //           response.writeHead(201, headers);
  //         }
  //       });
  //     });

  //     request.on('end', function() {
  //       response.writeHead(201, headers);
  //       response.end('{"success" : "Post succeeded", "status" : 201}');
  //     });
  //   }

  // } else if (request.method === 'OPTIONS') {
  //   console.log(request.headers);
  //   headers['Content-Type'] = 'httpd/unix-directory';
  //   response.writeHead(200, headers);
  //   response.end();
  // } else {
  //   response.writeHead(404, headers);
  //   response.end();
  // }

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  //response.end('Hello, World! End of file');
exports.requestHandler = utils.makeActionHandler(actions);
