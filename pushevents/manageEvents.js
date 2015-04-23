
var User = require('../models/UserModel'),
    Event = require('../models/EventModel'),
    eventUtils = require('./eventUtils'),
    settings = require('../config/settings'),
    _ = require('lodash');

var pusher = require('../globals/pusher');

var createEvent = function( req, res ) {
	       
    var data = req.body;

    var hostId = data.hostId,
        socketId = data.socketId;

    var currentDate = new Date(),
        currentHour = currentDate.getHours();

    if( settings.isFrozenTime() ){

        return eventUtils.raiseError({
            res: res,
            toClient:"Pas de meefore avant " + settings.eventsRestartAt +"h"
        });
    }

    var beginsAt = new Date();
    var hour = parseInt( data.hour );

    beginsAt.setHours( hour );
    beginsAt.setMinutes( parseInt( data.min ));
    beginsAt.setSeconds(0);

    if( hour < 14  || hour > 23 )
    return eventUtils.raiseError({
            toClient:"Les meefores ont lieu entre 14h00 et 23h59",
            toServer:"EC-6",
            res:res
     });

    if( !data.tags )
    return eventUtils.raiseError({
            toClient:"Un tag minimum",
            toServer:"Wrong Tags Inputs",
            res:res
    });

    if( data.tags.length > 3 )
    return eventUtils.raiseError({
            toClient:"Trois tags maximum",
            toServer:"Wrong Tags Inputs",
            res:res
    });

    if( data.maxGuest < 2 || data.maxGuest > 10 )
    return eventUtils.raiseError({
            toClient:"Le nombre d'invités doit être entre 2 et 10",
            toServer:"Wrong Tags Inputs",
            res:res
    });
    
    var newEvent = new Event( data );
    newEvent.createdAt = currentDate;
    newEvent.beginsAt = beginsAt;

    User.findById( hostId, {}, function( err, user ) {

        if (!err ){

            if( user.status === 'hosting' )             
            return eventUtils.raiseError({
                toClient:"Already hosting !",
                toServer:"Can't host multiple events",
                res: res
            });
                
            if( 0 )
            return eventUtils.raiseError({
                toClient:"Renseignez tous les champs svp ;-)",
                toServer :"Not all fields filled",
                res: res
            });

            newEvent.save( function(err, myEvent){
                
                if( !err ) {

                    user.status = 'hosting';
                    user.hostedEventId = myEvent._id;

                    var expose = { myEvent: myEvent };

                    user.save( function(err, user) {
                        if( !err ){
                            console.log(user.email + ' is hosting event with id : ' + user.hostedEventId);

                            eventUtils.sendSuccess( res, expose );
                            pusher.trigger('default', 'create-event-success', expose, socketId );
                        }
                    });
                }
            });
        }
    });
};


var suspendEvent = function( req, res ) {

    var data = req.body;
    var eventId  = data.eventId,
        hostId   = data.hostId,
        socketId = data.socketId;

    Event.findById( eventId, {}, function( err, myEvent ){

        if( err ){
             return eventUtils.raiseError({
                toClient: "Could not find event",
                toServer: "Error finding event to suspend",
                err: err,
                res: res
            });
        }

        myEvent.state === 'suspended' ?  myEvent.state = 'open' : myEvent.state = 'suspended';

        myEvent.save( function( err, newEvent ){

            var expose = {
                eventId: eventId,
                hostId: hostId,
                eventState: newEvent.state
            };

            if( !err ){
                eventUtils.sendSuccess( res, expose );
                pusher.trigger('default', 'suspend-event-success', expose, socketId );
            }
        });
    });
};


var cancelEvent = function( req, res ) {

    var data = req.body;

    var eventId = data.eventId,
        hostId = data.hostId,
        socketId = data.socketId;

    var expose = {} //global for cancelEvent scope

    Event.findById( eventId, {}, function( err, myEvent ) {

        if( err ){
            return eventUtils.raiseError({
                toClient: "Could not find event",
                toServer: "Error finding event to cancel",
                err: err,
                res: res
            });
        }

        myEvent.state = 'canceled';

        myEvent.save( function( err, newEvent ){
            if( err ){
                return console.log('Error canceling event : err = ' + err);
            }

         expose = {
                eventId: eventId,
                hostId: hostId,
                eventState: newEvent.state
            };

         eventUtils.sendSuccess( res, expose );
         pusher.trigger('default', 'cancel-event-success', expose, socketId );

        });

        myEvent.askersList.forEach( function( asker ){

            User.findById( asker._id, {}, function( err, myUser ){

                User.update(
                    { _id: myUser._id },
                    { $pull: { 'eventsAskedList': eventId } },
                    {},
                    function( err ){
                    if( err ){
                        return console.log('Error updating user on cancelation ');
                    }
                });

            });
        }); 
    });

    User.findById( hostId, {}, function( err, myHost ){

        if (err) {
            return console.log('Error finding host '+ err);
        }
        var hostId = myHost._id.toString();

        /* On enlève tous les channels sauf les Defaults one */
        _.remove( myHost.myChannels, function(el){
            return ( el.accessName != 'defchan' && el.accessName != 'mychan' );
        });

        myHost.hostedEventId = '';
        myHost.status = 'idle';

        myHost.save(function(err) {
            if (err) {
                return console.log('Error canceling event (Host)');
            }
        });
    });
};

var fetchAskers = function( req, res ) {

    var eventId = req.body.eventId;

    console.log('Fetching askers for eventId : ' + eventId );

    Event.findById( eventId, {}, function( err, myEvent ) {

        if( err ){
            return eventUtils.raiseError({
                toClient: "Problem fetching askers",
                toServer: "Problem fetching askers",
                err: err,
                res: res
            });
        } 

        var expose = { askersList: myEvent.askersList }

        console.log('Event found, currently %d people in askersList', myEvent.askersList.length );
        eventUtils.sendSuccess( res, expose )
        
    });
};


module.exports = {
    createEvent: createEvent,
    suspendEvent: suspendEvent,
    cancelEvent: cancelEvent,
    fetchAskers: fetchAskers
};