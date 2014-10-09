var User = require('../models/UserModel'),
    Event = require('../models/EventModel'),
    eventUtils = require('./eventUtils'),
    _ = require('lodash');

var createEvent = function(data) {
	
    var hostId = data.hostId;

    /* Pour pouvoir push des events à l'host ultérieurement*/
    global.sockets[data.hostId].join(hostId);

    var beginsAt = new Date();
    beginsAt.setHours(parseInt(data.hour));
    beginsAt.setMinutes(parseInt(data.min));
    beginsAt.setSeconds(0);

    var newEvent = new Event(data);
    newEvent.createdAt = new Date();
    newEvent.beginsAt = beginsAt;

    User.findById(hostId, {}, function(err, user) {
        if (!err) {
            if (user.status === 'hosting') {
                global.sockets[hostId].emit('create event error', {
                    msg: "Can't host multiple events"
                });
                return;
            }
            newEvent.save(function(err, myEvent) {
                if (!err) {
                    global.io.emit('create event success', myEvent);

                    user.status = 'hosting';
                    user.socketRooms.push(hostId)
                    user.hostedEventId = myEvent._id;

                    user.save(function(err, user) {
                        if (!err) {
                            console.log(user.local.email + ' is hosting event with id : ' + user.hostedEventId);
                        }
                    });
                }
            });
        }
    });
};


var suspendEvent = function(data) {

};

var cancelEvent = function(data) {
    var eventId = data.eventId,
        hostId = data.hostId;

    Event.findById(eventId, {}, function(err, myEvent) {
        if (err) {
            console.log('Error finding event : ' + err);
            return;
        }
        myEvent.state = 'canceled';

        myEvent.save(function(err) {
            if (err) {
                console.log('Error canceling event');
                return;
            }
            global.io.emit('cancel event success', {
                eventId: eventId,
                hostId: hostId
            });
        });

        myEvent.askersList.forEach(function(asker) {
            User.findById(asker.id, {}, function(err, myUser) {
                User.update({
                    _id: myUser._id
                }, {
                    $pull: {
                        'eventsAskedList': eventId
                    }
                }, {}, function(err) {
                    if (err) {
                        console.log('Error updating user on cancelation ');
                    }
                })
            });
        });
    });

    User.findById(hostId, {}, function(err, myHost) {

        var hostId = myHost._id.toString();

        myHost.socketRooms.forEach(function(room) {
            global.sockets[hostId].leave(room);
        });

        myHost.hostedEventId = '';
        myHost.socketRooms = [];
        myHost.status = 'idle';

        myHost.save(function(err) {
            if (err) {
                console.log('Error canceling event (Host)');
            }
        });
    });
};

var fetchAskers = function(data) {
    console.log('Fetching all askers');
    var hostId = data.hostId;
    eventId = data.eventId;
    Event.findById(eventId, {}, function(err, myEvent) {
        if (err) {
            console.log('error finding event based on hostId');
        } else {
            var askersList = myEvent.askersList;
            global.sockets[hostId].emit('fetch askers success', askersList);
        }
    });
};


module.exports = {
    createEvent: createEvent,
    suspendEvent: suspendEvent,
    cancelEvent: cancelEvent,
    fetchAskers: fetchAskers
};