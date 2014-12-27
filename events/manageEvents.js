
var User = require('../models/UserModel'),
    Event = require('../models/EventModel'),
    eventUtils = require('./eventUtils'),
    settings = require('../config/settings'),
    _ = require('lodash');

var createEvent = function(data) {
	
    var hostId = data.hostId,
        socket = global.sockets[hostId];

    var currentDate = new Date(),
        currentHour = currentDate.getHours();

    if( settings.isFrozenTime() ){

        return eventUtils.raiseError({
            socket: socket,
            toClient:"Opening start at " + settings.eventsEndAt +"h"
        });

    }

    /* Pour pouvoir push des events à l'host ultérieurement*/
    socket.join( hostId );

    var beginsAt = new Date();
    var hour = parseInt( data.hour );

    beginsAt.setHours( hour );
    beginsAt.setMinutes( parseInt( data.min ));
    beginsAt.setSeconds(0);

    if( hour < 14  || hour > 23 )
    return eventUtils.raiseError({
            toClient:"Les évènements ont lieu entre 14h00 et 23h59",
            toServer:"EC-6",
            socket: socket
     });

    if( data.tags.length == 0 )
    return eventUtils.raiseError({
            toClient:"Un tag minimum",
            toServer:"Wrong Tags Inputs",
            socket: socket
    });

    if( data.tags.length > 3 )
    return eventUtils.raiseError({
            toClient:"Trois tags maximum",
            toServer:"Wrong Tags Inputs",
            socket: socket
    });

    if( data.maxGuest < 2 || data.maxGuest > 10 )
    return eventUtils.raiseError({
            toClient:"Le nombre d'invités doit être compris entre 2 et 10",
            toServer:"Wrong Tags Inputs",
            socket: socket
    });
    
    var newEvent = new Event(data);
    newEvent.createdAt = currentDate;
    newEvent.beginsAt = beginsAt;

    User.findById( hostId, {}, function(err, user) {

        if (!err ){

            if( user.status === 'hosting' ){
                
                return eventUtils.raiseError({
                    toClient:"Already hosting !",
                    toServer:"Can't host multiple events",
                    socket: socket
                });
                
            }

            if( 0 ){

                return eventUtils.raiseError({
                    toClient:"Renseignez tous les champs svp ;-)",
                    toServer :"Not all fields filled",
                    socket: socket
                });
            }

            newEvent.save( function( err, myEvent ){
                
                if( !err ) {
                    global.io.emit('create event success', myEvent);

                    user.status = 'hosting';
                    user.socketRooms.push(hostId)
                    user.hostedEventId = myEvent._id;

                    user.save(function(err, user) {
                        if( !err ){
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


var cancelEvent = function(data) {
    console.log('Cancel event received');

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
                return console.log('Error canceling event : err = ' + err);
            }
            global.io.emit('change state event success', {
                eventId: eventId,
                hostId: hostId,
                 myEvent: newEvent

            });
        });

        myEvent.askersList.forEach( function( asker ){

            User.findById( asker._id, {}, function( err, myUser ){

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

        if( err ){
            return eventUtils.raiseError({
                toClient: "Problem fetching askers",
                toServer: "Problem fetching askers",
                err: err,
                socket: hostSocket
            });
        } 
        var askersList = myEvent.askersList;
        hostSocket.emit( 'fetch askers success', { askersList: askersList });
        
    });
};


module.exports = {
    createEvent: createEvent,
    suspendEvent: suspendEvent,
    cancelEvent: cancelEvent,
    fetchAskers: fetchAskers
};