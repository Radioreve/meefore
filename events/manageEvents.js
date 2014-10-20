var User = require('../models/UserModel'),
    Event = require('../models/EventModel'),
    eventUtils = require('./eventUtils'),
    _ = require('lodash');

var createEvent = function(data) {
	
    var hostId = data.hostId,
        socket = global.sockets[hostId];

    /* Pour pouvoir push des events à l'host ultérieurement*/
    socket.join(hostId);

    var beginsAt = new Date();
    beginsAt.setHours(parseInt(data.hour));
    beginsAt.setMinutes(parseInt(data.min));
    beginsAt.setSeconds(0);

    var newEvent = new Event(data);
    newEvent.createdAt = new Date();
    newEvent.beginsAt = beginsAt;

    User.findById(hostId, {}, function(err, user) {
        if (!err ) {
            if (user.status === 'hosting') {
                
                eventUtils.raiseError({
                    toClient:"Can't host multiple events",
                    toServer:"Can't host multiple events",
                    socket: socket
                })
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

    var eventId = data.eventId,
        hostId  = data.hostId,
        hostSocket = global.sockets[hostId];

    Event.findById( eventId, {}, function( err, myEvent ){

        if( err ){
             return eventUtils.raiseError({
                toClient: "Could not find event",
                toServer: "Error finding event to suspend",
                err: err,
                socket: hostSocket
            });
        }

        myEvent.state === 'suspended' ?  myEvent.state = 'open' : myEvent.state = 'suspended';

        myEvent.save( function( err, newEvent ){
            if( !err ){
                global.io.emit( 'change state event success', {
                    eventId: eventId,
                    hostId: hostId,
                    myEvent: newEvent
                });
            }
        })
        
    });
};

var terminateEvent = function(data) {

    var eventId = data.eventId,
        hostId  = data.hostId,
        hostSocket = global.sockets[hostId];

    Event.findById( eventId, {}, function( err, myEvent ){

        if( err ){
             return eventUtils.raiseError({
                toClient: "Could not find event",
                toServer: "Error finding event to suspend",
                err: err,
                socket: hostSocket
            });
        }

        myEvent.state = 'completed';
        myEvent.review = /* Ajouter une review ici ? */

        myEvent.save( function( err, newEvent ){
            if( !err ){
                /* Notifier l'host */
            }
        });
        
    });

};

var cancelEvent = function(data) {

    var eventId = data.eventId,
        hostId = data.hostId,
        socket = global.sockets[hostId];

    Event.findById( eventId, {}, function( err, myEvent ) {

        if( err ){
    
            return eventUtils.raiseError({
                toClient: "Could not find event",
                toServer: "Error finding event to cancel",
                err: err,
                socket: socket
            });
        }

        myEvent.state = 'canceled';

        myEvent.save( function( err, newEvent ){
            if( err ){
                return console.log('Error canceling event');
            }
            global.io.emit('change state event success', {
                eventId: eventId,
                hostId: hostId,
                 myEvent: newEvent

            });
        });

        myEvent.askersList.forEach( function( asker ){

            User.findById( asker.id, {}, function( err, myUser ){

                User.update({
                    _id: myUser._id
                }, {
                    $pull: {
                        'eventsAskedList': eventId
                    }
                }, {}, function( err ){
                    if( err ){
                        return console.log('Error updating user on cancelation ');
                    }
                })
            });
        }); 
    });

    User.findById(hostId, {}, function(err, myHost) {

        if (err) {
            return console.log('Error finding host '+ err);
        }
        var hostId = myHost._id.toString();

        myHost.socketRooms.forEach(function(room) {
            global.sockets[hostId].leave(room);
        });

        myHost.hostedEventId = '';
        myHost.socketRooms = [];
        myHost.status = 'idle';

        myHost.save(function(err) {
            if (err) {
                return console.log('Error canceling event (Host)');
            }
        });
    });
};

var fetchAskers = function(data) {

    var hostId      = data.hostId,
        eventId     = data.eventId,
        hostSocket  = global.sockets[hostId];

    Event.findById( eventId, {}, function( err, myEvent ) {

        if (err) {
            return eventUtils.raiseError({
                toClient: "Problem fetching askers",
                toServer: "Problem fetching askers",
                err: err,
                socket: hostSocket
            });
        } 
            var askersList = myEvent.askersList;
            hostSocket.emit( 'fetch askers success', askersList );
        
    });
};


module.exports = {
    createEvent: createEvent,
    suspendEvent: suspendEvent,
    terminateEvent: terminateEvent,
    cancelEvent: cancelEvent,
    fetchAskers: fetchAskers
};