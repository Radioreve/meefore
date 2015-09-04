
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsGroups: function(){

			 LJ.$body.on('click', '.icon-toggle', function(){

                var $self = $(this);

                LJ.fn.showLoaders();
                $self.addClass('active');

                var group_status = '';
                var group_id = $self.parents('.event-accepted-users-group').attr('data-groupid');
                var status   = $self.parents('.event-accepted-users-group').attr('data-status');
                var event_id = $self.parents('.row-events-accepted-inview').attr('data-eventid');

                if( status == 'accepted' ) {
                    group_status = 'kicked';
                } else {
                    group_status = 'accepted';
                }

                LJ.fn.updateGroupStatus({
                        group_status : group_status,
                        group_id     : group_id,
                        event_id     : event_id
                });

            });	
			
			 
		},
		updateGroupStatus: function( options ){

            var group_status = options.group_status,
                event_id     = options.event_id,
                group_id     = options.group_id;

            if( !group_status || !group_status || !event_id )
                return console.error('Missing group_id || group_status || group_id');

            var data = { group_status: group_status };
            LJ.fn.api('patch', 'events/'+event_id+'/groups/'+group_id+'/status', { data: data }, function( err, res ){

                LJ.fn.hideLoaders();

                if( err ){
                    LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.handleUpdateGroupStatusSuccess( res );
                }

            });

        },
        handleUpdateGroupStatusSuccess: function( res ){

            console.log('Updating group status success');
            var event_id = res.event_id;
            var group    = res.group;

            LJ.fn.updateGroupStatusUI( event_id, group );

            var status = group.status;
            var $wrap = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            $wrap.find('[data-groupid="' + group.group_id + '"]')
                 .attr('data-status', status )

            if( status == 'accepted' ){
                LJ.fn.toastMsg('Le groupe ' + group.name + ' a été accepté');
            }

            if( status == 'kicked' ){
                LJ.fn.toastMsg('Le groupe ' + group.name + ' a été mis en attente');
            }     
        },
        updateGroupStatusUI: function( event_id, group ){

            var status = group.status;
            var $wrap = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            $wrap.find('[data-groupid="' + group.group_id + '"]')
                 .attr('data-status', status )

            if( status == 'accepted' ){
                $wrap.find('[data-groupid="' + group.group_id + '"] .icon-toggle')
                    .removeClass('icon-toggle-off').addClass('icon-toggle-on').removeClass('active');
            }

            if( status == 'kicked' ){
                $wrap.find('[data-groupid="' + group.group_id + '"] .icon-toggle')
                    .removeClass('icon-toggle-on').addClass('icon-toggle-off').removeClass('active');
            }     

        }

	});