
	window.LJ.feedback = _.merge( window.LJ.feedback || {}, {

		current: {
			"subject_id": null,
			"content"   : null
		},

		init: function(){

			LJ.feedback.addFeedback();
			LJ.feedback.handleDomEvents();

		},
		handleDomEvents: function(){

			$('body').on('click', '.feedback-subjects-wrapper', LJ.feedback.handleFeedbackSubjectsClicked );
			$('body').on('click', '.feedback__subject', LJ.feedback.handleFeedbackSubjectClicked );
			$('body').on('click', '.js-feedback', LJ.feedback.handleFeedbackClicked );
			$('body').on('click', '.modal.x--feedback .modal-footer button', LJ.feedback.handleModalButtonClicked );

		},
		handleModalButtonClicked: function(){

			var $s        = $( this );
			var $textarea = $s.closest('.modal').find('textarea');

			LJ.feedback.current.content = $textarea.val();
			LJ.feedback.sendFeedback( LJ.feedback.current.subject_id, LJ.feedback.current.content );
			LJ.ui.loaderifyModal();

		},
		handleFeedbackSubjectClicked: function(){

			var $s          = $( this );
			var feedback_id = $s.attr('data-feedback-id');

			LJ.feedback.selectSubject( feedback_id );


		},
		selectSubject: function( feedback_id ){

			$('.feedback__subject').removeClass('x--active');
			$('.feedback__subject[data-feedback-id="'+ feedback_id +'"]').addClass('x--active');
			LJ.feedback.current.subject_id = feedback_id;
			$('.feedback-subject-selected').html( LJ.text("feedback_" + feedback_id ) );
			LJ.feedback.hideSelectFeedbackSubject();

		},
		handleFeedbackSubjectsClicked: function(){

			LJ.feedback.showSelectFeedbackSubject();

		},
		handleFeedbackClicked: function(){

			LJ.feedback.showFeedback();

		},
		showSelectFeedbackSubject: function(){

			$('.feedback-subjects').velocity('shradeIn', {
				duration: 450,
				display: 'flex'
			});

		},
		hideSelectFeedbackSubject: function(){

			$('.feedback-subjects').hide();

		},
		addFeedback: function(){

			$('.app-section.x--map').append( LJ.feedback.renderFeedbackIcon() );

		},
		showFeedback: function(){

			LJ.ui.showModal({
				"title"			: LJ.text('modal_feedback_title'),
				"subtitle"		: LJ.text('modal_feedback_subtitle'),
				"type"      	: "feedback",
				"jsp_body" 	    : false,
				"body"  		: LJ.feedback.renderFeedbackForm(),
				"footer"		: '<button class="x--bombed">'+ LJ.text("modal_feedback_btn") +'</button>',
				"done" 	        : function(){ LJ.feedback.selectSubject( LJ.app_settings.feedback_ids[0] ); }
			});

		},
		renderFeedbackIcon: function(){

			return LJ.ui.render([

				'<div class="map__icon x--round-icon x--feedback js-feedback">',
					'<i class="icon icon-mail"></i>',
				'</div>'

			]);

		},
		renderFeedbackForm: function(){

			var feedback_subjects_html = [];
			LJ.app_settings.feedback_ids.forEach(function( feedback_id ){
				var is_active = feedback_id == "hello" ? "x--active": "";
				feedback_subjects_html.push('<div data-feedback-id="'+ feedback_id +'" class="feedback__subject '+ is_active +'">'+ LJ.text( "feedback_" + feedback_id ) +'</div>')
			});
			feedback_subjects_html = feedback_subjects_html.join('');

			return LJ.ui.render([

				'<div class="feedback">',
					'<div class="feedback-subjects-wrapper">',
						'<div class="feedback-subject-selected">Hello there</div>',
					'</div>',
					'<div class="feedback-subjects">',
						feedback_subjects_html,
					'</div>',
					'<div class="feedback-content">',
						'<textarea data-lid="placeholder_feedback_content"></textarea>',
					'</div>',
				'</div>'

			]);

		},
		sendFeedback: function( subject_id, content ){

			LJ.api.sendFeedback( subject_id, content )
				.then(function( res ){
					LJ.feedback.handleSendFeedbackSuccess();
				})
				.catch(function( err ){
					LJ.feedback.handleSendFeedbackError( err );
				});

		},
		handleSendFeedbackSuccess: function(){

			LJ.ui.hideModal()
				.then(function(){
					LJ.ui.showToast( LJ.text("to_feedback_success") );
				});

		},
		handleSendFeedbackError: function( err ){
			
			LJ.ui.deloaderifyModal();
			LJ.log( err );
		}

	});