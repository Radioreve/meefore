
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');

	var fetchFriends = function( userId ){

		console.log('Fetching friends...');
		var userSocket = global.sockets[userId];

		User.find({ 'friendList.friendId' : userId,
				    'friendList.status' : { $in: [ 'askedMe','askedHim','mutual'] } }
				    , function( err, friendList ){

			if( err ){
				return eventUtils.raiseError({
					err: err,
					toServer: 'LJ-53',
					toClient: 'Error raising friends',
					socket: userSocket
				});
			}

		userSocket.emit('fetch friends success', friendList );

		});

	};

	var friendRequestIn = function( data ){

		console.log('Friend request ... ');

		var userId   = data.userId,
			friendId = data.friendId;

		var userSocket   = global.sockets[ userId ],
			friendSocket = global.sockets[ friendId ];


		User.findById( userId, function( err, myUser ){

			if( err )
				return eventUtils.raiseError({ err: err, toServer: 'LJ-72-a', toClient: 'Please try again later', socket: userSocket });

			User.findById( friendId, function( err, myFriend ){

				/* L'utilisateur tente de s'ajouter lui même */
				if( err )
					return eventUtils.raiseError({ err: err, toServer: 'LJ-72-b',
				      	   toClient: 'Please try again later', socket: userSocket });


				/* L'utilisateur tente de s'ajouter lui même */
				if( userId == friendId ) 
					return eventUtils.raiseError({ err: err, toServer: 'LJ-71', 
						   toClient: 'Can\t be friend with yourself', socket: userSocket });

				
				/* L'utilisateur a déjà fait une demande en ami */
				if( _.some( myFriend.friendList, { friendId: userId, status:'askedMe' })  )
					return eventUtils.raiseError({ err: err, toServer: 'LJ-73', 
						   toClient: 'Request already sent', socket: userSocket });


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
					if(  friendSocket != undefined ) 
						friendSocket.emit('friend request in success', {
							 friendId: friendId, userId: userId, updateType: updateTypeFriend, friendList: myFriend.friendList });
				});

				myUser.save( function( err ){
					if( err ) return console.log('Error LJ-50' );
					userSocket.emit('friend request in success', { 
							friendId: friendId, userId: userId, updateType: updateTypeUser, friendList: myUser.friendList });				
				});

			});
		});

	};
	
	var refetchAskers = function( data ){

		var userId  = data.userId,
			idArray = data.idArray;

		var socket = global.sockets[userId];

		User.find({ '_id' : { $in : idArray } },
		{
			'_id':1,
			'name': 1,
			'description': 1,
			'age':1,
			'favoriteDrink':1,
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

		 socket.emit('refetch askers success', users );
			
		});

	};


	module.exports = {

		fetchFriends    : fetchFriends,
	    friendRequestIn : friendRequestIn,
	    refetchAskers: refetchAskers

	}