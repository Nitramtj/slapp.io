var request = require('request');

var defaultConfig = {
  masterServer: 'http://slapp.io',
  name: process.env.PROJECT_DOMAIN ? process.env.PROJECT_DOMAIN + '.glitch.me' : '',
  url: process.env.PROJECT_DOMAIN ? 'https://' + process.env.PROJECT_DOMAIN + '.glitch.me' : '',
  users: 0,
  serviceId: null
};

function postMasterServer(config) {
  request.post(
    config.masterServer + '/api/services',
    {
      json: {
        name: config.name,
        url: config.url,
        users: config.users
      }
    }, function(error, response, body) {
      config.serviceId = body;
    }
  );
}

function pingMasterServer(config) {
  if (config.serviceId != null) {
    request.put(
      config.masterServer + '/api/services/' + config.serviceId,
      {
        json: {
          users: config.users
        }
      }, function(error, response, body) {
        // Nothing for now
      }
    );
  }
}

module.exports = {
  easyrtc: function (easyrtc, config) {
    var finalConfig = Object.assign({}, defaultConfig, config);
    postMasterServer(finalConfig);

    easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
      console.log('increase users');
      finalConfig.users++;
      pingMasterServer(finalConfig);
    });
    easyrtc.events.on("roomLeave", function(connectionObj, roomName, roomParameter, callback) {
      finalConfig.users--;
      console.log('decrease');
      pingMasterServer(finalConfig);
    });

    setInterval(function () {
      pingMasterServer(finalConfig);
    }, 1000 * 60);
  },

  noservice: function (config) {
    var finalConfig = Object.assign({}, defaultConfig, config);
    postMasterServer(finalConfig);

    setInterval(function () {
      pingMasterServer(finalConfig);
    }, 1000 * 60);
  }
};
