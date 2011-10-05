var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

io.configure(function() {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

app.listen(8000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var news = [];

setInterval(function() {
  for(var i=news.length-1; i>=0; i--) {
    var time = parseInt(news[i]['howlong']);
    if (time <= 1) news.splice(i,1);
    else news[i]['howlong'] = time - 1;
  }
  }, 60000);

io.sockets.on('connection', function (client) {
  client.emit('news', { who:     'server',
                        what:    'serve you',
                        howlong: '999999999' });

  for (var i=0; i<news.length; i++) {
    client.emit('news', news[i]);
  }

  client.on('update', function (data) {
    news.push(data);
    client.broadcast.emit('news', data);
  });
});
