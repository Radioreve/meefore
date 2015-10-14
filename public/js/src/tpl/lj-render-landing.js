
		window.LJ.fn = _.merge( window.LJ.fn || {}, {

			renderContactForm: function(){

				var html = [

					'<div class="landing-contact">',
						'<div data-lid="lp_contact_title" class="contact-title">Contactez-nous</div>',
						'<form>',
							'<div class="contact-row contact-error none"></div>',
							'<div class="contact-row">',
								'<label data-lid="lp_contact_name" for="contact-name">Nom*</label>',
								'<input id="contact-name" type="text" placeholder="Ben"/>',
							'</div>',
							'<div class="contact-row">',
								'<label data-lid="lp_contact_email" for="contact-email">Email*</label>',
								'<input id="contact-email" type="text" placeholder="ben@party.com"/>',
							'</div>',
							'<div class="contact-row">',
								'<label data-lid="lp_contact_message" for="contact-message">Message*</label>',
								'<textarea id="contact-message" placeholder="Hey " rows="8" cols="50" ></textarea>',
							'</div>',
						'</form>',
						'<div class="contact-buttons">',
							'<button data-lid="p_button_validate" class="theme-btn btn-validate">Envoyer</button>',
							'<button data-lid="p_button_cancel" class="theme-btn btn-cancel">Annuler</button>',
						'</div>',
					'</div>'

				].join('');

				var $html = $( html );
				LJ.fn.setAppLanguage( LJ.app_language, $html );

				return $html.prop('outerHTML');

			}

		});
