# slapp.io
JavaScript plugin for updating slapp.io with service status.

This plugin works by posting your app's name, url, and user count to slapp.io. Ideally it should run on your easyrtc server, that way you can hook into easyrtc's roomJoin and roomLeave events.

If your app is on Glitch, you do not need to provide setup configuration, and your app will appear as "Glitch: project-name". Otherwise, you provide your own app name and url in setup configuration.

Projects active in the past two minutes are shown at the top of the site. Glitch are shown under the active projects, regardless of last active time.

## Usage
For a quick start, just remix the glitch starter project [slapp-networked-aframe](https://glitch.com/~slapp-networked-aframe).

Otherwise, include the plugin in your app:

```JavaScript
var slapp = require('slapp.io');
```

Then alongside your easyrtc setup, create an instance that will immediately post your app to slapp.io:

```JavaScript
var slappService = slapp.simple({
  name: 'My NAF App',
  url: 'https://example.com'
});
```
> If your project is hosted on Glitch, you don't need to provide any options!

At this point your service will be posted to slapp.io, and periodically send a heartbeat. To get a user count you must call the `increaseUserCount` and `decreaseUserCount` instance methods. In the default networked-aframe starter project, you would replace the room join code in `server.js` with the following:

```JavaScript
easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
    slappService.increaseUserCount();
});
easyrtc.events.on("roomLeave", function(connectionObj, roomName, roomParameter, callback) {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
    slappService.decreaseUserCount();
});
```
