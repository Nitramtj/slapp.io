var request = require('request');

class Service {
  constructor(config) {
    this.masterServer = 'http://slapp.io';
    this.name = process.env.PROJECT_DOMAIN ? process.env.PROJECT_DOMAIN + '.glitch.me' : '';
    this.url = process.env.PROJECT_DOMAIN ? 'https://' + process.env.PROJECT_DOMAIN + '.glitch.me' : '';
    this.users = 0;
    this.serviceId = null;
    this.heartBeatActive = false;
    this.interval = null;

    Object.assign(this, config);

    request.post(
      this.masterServer + '/api/services',
      {
        json: {
          name: this.name,
          url: this.url,
          users: this.users
        }
      }, (error, response, body) => {
        this.serviceId = body;
      }
    );
  }

  startHeartbeat() {
    if (this.interval != null) {
      this.interval = setInterval(() => {
        this.ping(finalConfig);
      }, 1000 * 60);
    }
  }
  stopHeartbeat() {
    if (this.interval != null) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  increaseUserCount() {
    this.users++;
    this.ping();
  }
  decreaseUserCount() {
    this.users--;
    this.ping();
  }

  ping() {
    if (this.serviceId != null) {
      request.put(
        this.masterServer + '/api/services/' + this.serviceId,
        {
          json: {
            users: this.users
          }
        }, (error, response, body) => {
          // Nothing for now
        }
      );
    }
  }
}

module.exports = {
  // TODO: Hack around easyrtc's single listener per event
  easyrtc: function (easyrtc, config) {
    var service = new Service(config);

    easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
      service.users++;
      service.ping();
    });
    easyrtc.events.on("roomLeave", function(connectionObj, roomName, roomParameter, callback) {
      service.users--;
      service.ping();
    });

    service.startHeartbeat();
    return service;
  },

  simple: function (config) {
    var service = new Service(config);
    service.startHeartbeat();
    return service;
  }
};
