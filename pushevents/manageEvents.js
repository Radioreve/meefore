
var User = require('../models/UserModel'),
    Event = require('../models/EventModel'),
    EventTemplate = require('../models/EventTemplateModel'),
    eventUtils = require('./eventUtils'),
    settings = require('../config/settings'),
    bots = require('../globals/bots'),
    moment = require('moment'),
    _ = require('lodash');

var pusher = require('../globals/pusher');




var suspendEvent = function( req, res ) {

    var data = req.body;
    var eventId  = data.eventId,
        hostId   = data.hostId,
        socketId = data.socketId || null;

    Event.findById( eventId, {}, function( err, myEvent ){

        if( err || !myEvent ){
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
                if( socketId ){
                    console.log(socketId);
                    return pusher.trigger('default', 'suspend-event-success', expose, socketId );
                }
                console.log('Triggering normal');
                pusher.trigger('default', 'suspend-event-success', expose );
            }
        });
    });
};


var cancelEvent = function( req, res ) {

    var data = req.body;

    var eventId = data.eventId,
        hostId = data.hostId,
        socketId = data.socketId;

    /* Pour le lancement only */
    if( data.templateId ){
        console.log('Deactivating event template... : ' + data.templateId );;
        EventTemplate.update({ '_id': data.templateId }, { $set : { active: false }}, function( err ){
            if( err )
                console.log('Error occured releasing event template state');
            
        });
    }

    var expose = {} //global for cancelEvent scope

    Event.findById( eventId, {}, function( err, myEvent ) {

        if( err || !myEvent ){
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
                    { $pull: { 'asked_events': eventId } },
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
        _.remove( myHost.channels, function(el){
            return ( el.access_name != 'defchan' && el.access_name != 'mychan' );
        });

        myHost.hosted_event_id = '';
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
    suspendEvent: suspendEvent,
    cancelEvent: cancelEvent,
    fetchAskers: fetchAskers
};