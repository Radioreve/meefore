
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');

	var pusher = require('../globals/pusher');    

	var fetchFriends = function( req, res ){

		console.log('Fetching friends...');
		var userId = req.body.userId;

		User.find({ 'friendList.friendId' : userId }
				    , function( err, friendList ){

			if( err ){
				return eventUtils.raiseError({
					err: err,
					toServer: 'LJ-53',
					toClient: 'Error raising friends',
					res: res
				});
			}

			var expose = { myFriends: friendList }
			eventUtils.sendSuccess( res, expose );

		});
	};

	var friendRequestIn = function( req, res ){

		console.log('Friend request ... ');
		var data = req.body;

		var userId    = data.userId,
			hostIds   = data.hostIds,
			friendId  = data.friendId;

		User.findById( userId, function( err, myUser ){

			if( err )
				return eventUtils.raiseError({ err: err, toServer: 'LJ-72-a', toClient: 'Please try again later', res: res });

			User.findById( friendId, function( err, myFriend ){

				/* Err */
				if( err )
					return eventUtils.raiseError({ err: err, toServer: 'LJ-72-b',
				      	   toClient: 'Please try again later', res: res });


				/* L'utilisateur tente de s'ajouter lui même */
				if( userId == friendId ) 
					return eventUtils.raiseError({ err: err, toServer: 'LJ-71', 
						   toClient: 'Can\t be friend with yourself', res: res });

				
				/* L'utilisateur a déjà fait une demande en ami */
				if( _.some( myFriend.friendList, { friendId: userId, status:'askedMe' })  )
					return eventUtils.raiseError({ err: err, toServer: 'LJ-73', 
						   toClient: 'Request already sent', res: res });


				/* L'utilisateur avait déjà demandé : ils passent tous les deux en 'mutual' */
				if( _.some( myFriend.friendList, { friendId: userId, status:'askedHim' }) )
				{	
					var updateTypeFriend = updateTypeUser = 'mutual';

					var ind  = _.findIndex( myFriend.friendList, function(el){ return el.friendId == userId });
					myFriend.friendList.set( ind, { friendId: userId, status:'mutual', name: myUser.name });

					var ind  = _.findIndex( myUser.friendList, function(el){ return el.friendId == friendId });
					myUser.friendList.set( ind, { friendId: friendId, status: 'mutual', name: myFriend.name });
				}
				else
				{
					var updateTypeUser   = 'askedhim',
						updateTypeFriend = 'askedme';

					myFriend.friendList.push({ friendId : userId, status : 'askedMe', name: myUser.name });				
					myUser.friendList.push({ friendId: friendId, status : 'askedHim', name: myFriend.name });							
				}

				myFriend.save( function( err ){
					if( err ) return console.log('Error LJ-51' );
						var channelName = myFriend.getChannel(),
							eventName   = 'friend-request-in-success',
							data = { friendId: friendId, userId: userId, updateType: updateTypeFriend, friendList: myFriend.friendList, friend: myUser };
						pusher.trigger( channelName, eventName, data );

				});

				myUser.save( function( err ){
					if( err ) return console.log('Error LJ-50' );
					var expose = { friendId: friendId, userId: userId, updateType: updateTypeUser, friendList: myUser.friendList, friend: myFriend };
					eventUtils.sendSuccess( res, expose );
	
				});

				console.log('Alerting host..');
				console.log(hostIds);
				User.find( {'_id': { $in: hostIds }}, function( err, hosts ){

					if( err || hosts.length == 0 ) return;

					var expose = { userId: userId, friendId: friendId };
					for ( var i = 0; i < hosts.length ; i++ ){	
						pusher.trigger( hosts[i].getChannel(), 'friend-request-in-success-host', expose );
					}

				});
			});
		});

	};
	
	var refetchAskers = function( req, res ){

		var data = req.body;

		console.log('Refetching...');
		var userId  = data.userId,
			idArray = data.idArray;

		User.find({ '_id' : { $in : idArray } },
		{
			'_id':1,
			'name': 1,
			'description': 1,
			'age':1,
			'drink':1,
			'mood':1,
			'signupDate':1,
			'imgId':1,
			'imgVersion':1,
			'friendList': 1

		}, function( err, users ){

			if( err )
				return eventUtils.raiseError({
					err:err,
					socket:socket,
					toServer:'E100',
					toClient:'Can\t find friends relationships'
				});

		 console.log('Emitting refetch askers');

		 var expose = users;
		 eventUtils.sendSuccess( res, expose );
			
		});

	};


	module.exports = {

		fetchFriends    : fetchFriends,
	    friendRequestIn : friendRequestIn,
	    refetchAskers: refetchAskers

	}