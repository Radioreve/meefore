
var User = require('../models/UserModel'),
    Event = require('../models/EventModel'),
    EventTemplate = require('../models/EventTemplateModel'),
    eventUtils = require('./eventUtils'),
    settings = require('../config/settings'),
    bots = require('../globals/bots'),
    moment = require('moment'),
    _ = require('lodash');

var pusher = require('../globals/pusher');

var createEvent = function( req, res ) {
	       
    var data = req.body;

    var hostId = data.hostId,
        socketId = data.socketId,
        userIds = data.userIds || [];

    if( settings.isFrozenTime() ){

        return eventUtils.raiseError({
            res: res,
            toClient:"Pas de meefore avant " + settings.eventsRestartAt +"h"
        });
    }

    var hour =  data.hour; var minut = data.min;
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

        newEvent.beginsAt  = moment.utc({ h: data.hour, m: data.min });
        newEvent.createdAt = moment.utc();

    User.find({ '_id': { $in: userIds }}, function( err, users ){

        if( err )
            return eventUtils.raiseError({
                err:err,
                res:res,
                toClient:"Impossible d'ajouter certains de vos amis"
            });

        /*
        if( users.length == 0 )
            return eventUtils.raiseError({
                err:err,
                res:res,
                toClient:"Ajouter au moins une personne!"
            });
        */

        for( var i=0; i<users.length; i++ ){
            newEvent.askersList.push( users[i] );
        }

        User.findById( hostId, {}, function( err, host ) {

            if (!err ){

                if( host.status === 'hosting' )             
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

                newEvent.save( function( err, myEvent ){
                    
                    if( err )
                        return eventUtils({
                            res:res,
                            err:err,
                            toClient:"Erreur en sauvegardant l'event"
                        });

                        host.status = 'hosting';
                        host.hosted_event_id = myEvent._id;

                        var expose = { myEvent: myEvent };

                        host.save( function( err, myHost ){
                            if( !err ){
                                console.log( myHost.email + ' is hosting event with id : ' + myHost.hosted_event_id );
                                eventUtils.sendSuccess( res, expose );
                                pusher.trigger('default', 'create-event-success', expose, socketId );
                            }
                        });

                        for( var i=0; i<users.length; i++ ){
                            users[i].asked_events.push( myEvent._id )
                            users[i].save();
                        }
                    
                });
            }
        });
    });
};


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
    createEvent: createEvent,
    suspendEvent: suspendEvent,
    cancelEvent: cancelEvent,
    fetchAskers: fetchAskers
};