
window.LJ.map_legacy = _.merge( window.LJ.map_legacy || {}, {

	test: {

		addOneMarker: function( i ){

			i = i || LJ.randomInt( 0, LJ.map.test.places.length -1 );
			var latlng = LJ.map.test.places[ i ];

			var marker = LJ.map.markerFactory.create({
                latlng    : new google.maps.LatLng( latlng ),
                html      : LJ.map.renderMarkerPlaceholder("face"),
                marker_id : i
            });

            LJ.map.markers.push({
        		marker_id : i,
        		marker 	  : marker,
                type      : "test",
                latlng    : latlng
        	});

			LJ.delay( 500 ).then(function(){

				LJ.map.showMarker( i );

			});


		},
		showMarkers: function(){
			LJ.map.test.places.forEach(function( latlng, i ){
				LJ.map.test.addOneMarker( i );
			});
		},
		refreshPictures: function(){

			LJ.search.fetchMoreUsers()
				.then(function( users ){

					LJ.search.fetched_users = users;

					LJ.map.test.places.forEach(function( latlng, i ){

						var j = LJ.randomInt( 0, 9 );
						var u = LJ.search.fetched_users[ j ];
						var k = LJ.findMainPic( u );
						var h = LJ.pictures.makeImgHtml( k.img_id, k.img_version, "user-map" );

						var update = {};

						if( i%2 == 0 ){
							update.seen = true;
						} else {
							update.unseen = true;
						}

						update.add_class = 'x--male';
						if( i%3 == 0 ){
							update.add_class = 'x--mixed';
						}
						if( i%4 == 0 ){
							update.add_class = 'x--female';
						}

						var rnd = LJ.randomInt( 0, 5 );
						if( rnd == 0 ){
							update.add_class += " x--pending";
							update.status_html = '<div class="mrk__status x--round-icon"><i class="icon icon-pending"></i></div>';
						}
						if( rnd == 1 ){
							update.add_class += " x--accepted";
							update.status_html = '<div class="mrk__status x--round-icon"><i class="icon icon-thunder-right"></i></div>'
						}
						if( rnd == 2 ){
							update.add_class += " x--number";
							update.status_html = '<div class="mrk__status x--round-icon x--1"><span>1</span></div>';
						}
						if( rnd == 3 ){
							update.add_class += " x--number";
							update.status_html = '<div class="mrk__status x--round-icon x--2"><span>2</span></div>';
						}
						if( rnd == 4 ){
							update.add_class += " x--number";
							update.status_html = '<div class="mrk__status x--round-icon x--3"><span>3</span></div>';
						}
						if( rnd == 5 ){
							update.add_class += " x--number";
							update.status_html = '<div class="mrk__status x--round-icon x--4"><span>4</span></div>';
						}

						if( i == 10 ){
							update.add_class += " x--host";
							update.status_html = '<div class="mrk__status x--round-icon"><i class="icon icon-star"></i></div>'
						}

						var users = _.uniq( _.map( [ LJ.randomInt( 0, 9 ), LJ.randomInt( 0, 9 ), LJ.randomInt( 0, 9 ), LJ.randomInt( 0, 9 ) ], function( i ){
							var u = LJ.search.fetched_users[ i ];
							u.img_id = LJ.findMainPic( u ).img_id;
							u.img_vs = LJ.findMainPic( u ).img_version;
							return u;
						}));

						var imgs = [ '<div class="img-wrap">' ];
		                users.forEach(function( user, i ){
		                    var img_html = LJ.pictures.makeImgHtml( user.img_id, user.img_vs, "user-map" );
		                    imgs.push( LJ.ui.render( '<div class="img-item" data-link="'+ i +'">' + img_html + '</div>' ) );
		                });
		                imgs.push('</div>');

						update.img_html = imgs.join('');

						LJ.map.updateMarker( i, update );
						LJ.map.setMarkerPicturesActive( i );

					});

				});

		},
		places: module.exports = [
		{
		    "lng": 2.3412773507170925,
		    "lat": 48.85182947840886,
		    "place_id": "ChIJE0Fmht5x5kcRIYczoMRN_e8",
		    "place_name": "83 Boulevard Saint-Germain, 75006 Paris, France"
		}, {
		    "lng": 2.335868428871123,
		    "lat": 48.85019144459014,
		    "place_id": "EicxMSBSdWUgR2FyYW5jacOocmUsIDc1MDA2IFBhcmlzLCBGcmFuY2U",
		    "place_name": "11 Rue Garancière, 75006 Paris, France"
		}, {
		    "lng": 2.3431932675021585,
		    "lat": 48.84644483901212,
		    "place_id": "Ei4xNTctMTU5IFJ1ZSBTYWludC1KYWNxdWVzLCA3NTAwNSBQYXJpcywgRnJhbmNl",
		    "place_name": "157-159 Rue Saint-Jacques, 75005 Paris, France"
		}, {
		    "lng": 2.327765762412497,
		    "lat": 48.84337826451903,
		    "place_id": "ChIJJ1roks5x5kcRbz-kyTa0xl4",
		    "place_name": "11 Rue Stanislas, 75006 Paris, France"
		}, {
		    "lng": 2.2991020310732324,
		    "lat": 48.84681873786798,
		    "place_id": "Eig2NC02NiBSdWUgTGV0ZWxsaWVyLCA3NTAxNSBQYXJpcywgRnJhbmNl",
		    "place_name": "64-66 Rue Letellier, 75015 Paris, France"
		}, {
		    "lng": 2.3590195295940077,
		    "lat": 48.86481386302961,
		    "place_id": "ChIJuwQsdQVu5kcRLi8gDi31dvg",
		    "place_name": "5 Rue Réaumur, 75003 Paris, France"
		}, {
		    "lng": 2.3698738151230714,
		    "lat": 48.869907571662,
		    "place_id": "ChIJK2UzPOJt5kcRi-hWu6BftHI",
		    "place_name": "3 Rue d'Aix, 75010 Paris, France"
		}, {
		    "lng": 2.359454624237202,
		    "lat": 48.870204321701635,
		    "place_id": "ChIJj3dQYg5u5kcR5yvZ4_B9LFA",
		    "place_name": "22 Rue Taylor, 75010 Paris, France"
		}, {
		    "lng": 2.3756145763454697,
		    "lat": 48.86959339938147,
		    "place_id": "EiUyNS0yNyBSdWUgTW9yYW5kLCA3NTAxMSBQYXJpcywgRnJhbmNl",
		    "place_name": "25-27 Rue Morand, 75011 Paris, France"
		}, {
		    "lng": 2.3814365617432998,
		    "lat": 48.850375279235834,
		    "place_id": "ChIJuYJDzA5y5kcRvinUoKGl5L8",
		    "place_name": "164 Rue du Faubourg Saint-Antoine, 75012 Paris, France"
		}, {
		    "lng": 2.3781996640332466,
		    "lat": 48.845850411729884,
		    "place_id": "Eis0Ni00OCBBdmVudWUgRGF1bWVzbmlsLCA3NTAxMiBQYXJpcywgRnJhbmNl",
		    "place_name": "46-48 Avenue Daumesnil, 75012 Paris, France"
		}, {
		    "lng": 2.3633761280036083,
		    "lat": 48.852056552914746,
		    "place_id": "ChIJpfBX5_5x5kcRUnkXjDi6vl8",
		    "place_name": "11 Rue Jules Cousin, 75004 Paris, France"
		}, {
		    "lng": 2.3641684375081127,
		    "lat": 48.856334432490996,
		    "place_id": "ChIJE4uz0gFu5kcRdOVk2kgN13I",
		    "place_name": "27 Rue de Turenne, 75004 Paris, France"
		}, {
		    "lng": 2.3590702450075867,
		    "lat": 48.85395833840059,
		    "place_id": "EiU4IFJ1ZSBkdSBGaWd1aWVyLCA3NTAwNCBQYXJpcywgRnJhbmNl",
		    "place_name": "8 Rue du Figuier, 75004 Paris, France"
		}, {
		    "lng": 2.3689300260715527,
		    "lat": 48.85348296790437,
		    "place_id": "Eis3IFBsYWNlIGRlIGxhIEJhc3RpbGxlLCA3NTAwNCBQYXJpcywgRnJhbmNl",
		    "place_name": "7 Place de la Bastille, 75004 Paris, France"
		}, {
		    "lng": 2.372939064350305,
		    "lat": 48.85357167724183,
		    "place_id": "ChIJ1dHsJQdy5kcR9G7xJnHA3ns",
		    "place_name": "24 Rue de Lappe, 75011 Paris, France"
		}, {
		    "lng": 2.3738610130331494,
		    "lat": 48.8530939907877,
		    "place_id": "ChIJk8At4AZy5kcRoBGEhX3juL0",
		    "place_name": "30 Rue de Lappe, 75011 Paris, France"
		}, {
		    "lng": 2.3716223056129877,
		    "lat": 48.85415773848095,
		    "place_id": "ChIJr-wNxgBy5kcRR14zg4aCYvg",
		    "place_name": "6 Rue de Lappe, 75011 Paris, France"
		}, {
		    "lng": 2.3733374219416135,
		    "lat": 48.85502474969982,
		    "place_id": "Ei01Mi01NiBSdWUgZGUgbGEgUm9xdWV0dGUsIDc1MDExIFBhcmlzLCBGcmFuY2U",
		    "place_name": "52-56 Rue de la Roquette, 75011 Paris, France"
		}, {
		    "lng": 2.3742827707201286,
		    "lat": 48.8554341665932,
		    "place_id": "ChIJTbdmYQdy5kcR-9yhvNa1KoA",
		    "place_name": "62 Rue de la Roquette, 75011 Paris, France"
		}, {
		    "lng": 2.3734050923066263,
		    "lat": 48.85330805471142,
		    "place_id": "EiQyOCBSdWUgZGUgTGFwcGUsIDc1MDExIFBhcmlzLCBGcmFuY2U",
		    "place_name": "28 Rue de Lappe, 75011 Paris, France"
		}, {
		    "lng": 2.340559516699443,
		    "lat": 48.85731809751891,
		    "place_id": "ChIJA6wqiCBu5kcRDDDXi-DXUhk",
		    "place_name": "41 Quai de l'Horloge, 75001 Paris, France"
		}, {
		    "lng": 2.3438981997715587,
		    "lat": 48.856859771296854,
		    "place_id": "ChIJX2CRBCBu5kcRZcy9FvrJGI4",
		    "place_name": "7 Quai de l'Horloge, 75001 Paris, France"
		}, {
		    "lng": 2.326563528095164,
		    "lat": 48.86946195971288,
		    "place_id": "ChIJvW52rTNu5kcRDAcVvEiKEN0",
		    "place_name": "11 Boulevard de la Madeleine, 75001 Paris, France"
		}, {
		    "lng": 2.3287209595144702,
		    "lat": 48.87227572110436,
		    "place_id": "ChIJnw1aHTRu5kcR3GNbNfooT4A",
		    "place_name": "4 Rue Boudreau, 75009 Paris, France"
		}, {
		    "lng": 2.2931060054687293,
		    "lat": 48.86950699806155,
		    "place_id": "ChIJRa2EG-9v5kcRICTJWxIlKZ8",
		    "place_name": "9 Rue la Pérouse, 75016 Paris, France " 
		}, {
		    "lng": 2.2930480951425807,
		    "lat": 48.8660090715928,
		    "place_id": "ChIJByqPveVv5kcRGfw3Lz8qcgM",
		    "place_name": "14 Rue de Lübeck, 75116 Paris, France"
		}, {
		    "lng": 2.306978994011388,
		    "lat": 48.866608255143746,
		    "place_id": "EiwxMS0xMyBSdWUgRnJhbsOnb2lzIDFlciwgNzUwMDggUGFyaXMsIEZyYW5jZQ",
		    "place_name": "11-13 Rue François 1er, 75008 Paris, France"
		}, {
		    "lng": 2.328436626593657,
		    "lat": 48.87887710640496,
		    "place_id": "ChIJWcVbNEpu5kcR5zWq7mgD80g",
		    "place_name": "12 Rue de Milan, 75009 Paris, France"
		}, {
		    "lng": 2.2492615087633965,
		    "lat": 48.83821323052456,
		    "place_id": "ChIJIWsy2cF65kcR2nosqaUwsyE",
		    "place_name": "9 Rue Édouard Detaille, 92100 Boulogne - Billancourt, France " 
		}, {
		    "lng": 2.3179336329470175,
		    "lat": 48.830999484430976,
		    "place_id": "EiYxMzQgUnVlIGQnQWzDqXNpYSwgNzUwMTQgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "134 Rue d'Alésia, 75014 Paris, France"
		}, {
		    "lng": 2.3641975406868596,
		    "lat": 48.827893564598924,
		    "place_id": "ChIJy308KYhx5kcR_xd0VNcMa8Q",
		    "place_name": "17 Avenue Edison, 75013 Paris, France"
		}, {
		    "lng": 2.3352555127407584,
		    "lat": 48.85178217063583,
		    "place_id": "ChIJQQwVhNlx5kcRFlmPEr_IumQ",
		    "place_name": "16 Rue Mabillon, 75006 Paris, France"
		}, {
		    "lng": 2.335104947585421,
		    "lat": 48.85273622329353,
		    "place_id": "ChIJk-sUmNlx5kcRK1XtZexedoU",
		    "place_name": "2 Rue Mabillon, 75006 Paris, France"
		}, {
		    "lng": 2.3352748121821207,
		    "lat": 48.851420714143956,
		    "place_id": "ChIJyfpQh9lx5kcROOu7ETbGKN8",
		    "place_name": "20 Rue Mabillon, 75006 Paris, France " 
		}, {
		    "lng": 2.3320177716578314,
		    "lat": 48.85118272989888,
		    "place_id": "EiUxMS0xNSBSdWUgTWFkYW1lLCA3NTAwNiBQYXJpcywgRnJhbmNl",
		    "place_name": "11-15 Rue Madame, 75006 Paris, France"
		}, {
		    "lng": 2.3317766723926354,
		    "lat": 48.849948380745985,
		    "place_id": "EiUzMC0zMiBSdWUgTWFkYW1lLCA3NTAwNiBQYXJpcywgRnJhbmNl",
		    "place_name": "30-32 Rue Madame, 75006 Paris, France"
		}, {
		    "lng": 2.3392026691191745,
		    "lat": 48.8894882432501,
		    "place_id": "ChIJnVB8rltu5kcRcAJ9u5Lb4Pc",
		    "place_name": "100 Rue Caulaincourt, 75018 Paris, France"
		}, {
		    "lng": 2.3317467692188245,
		    "lat": 48.88189953931516,
		    "place_id": "EiY3Ni03OCBSdWUgQmxhbmNoZSwgNzUwMDkgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "76-78 Rue Blanche, 75009 Paris, France"
		}, {
		    "lng": 2.316445948007214,
		    "lat": 48.859874437883434,
		    "place_id": "ChIJjVKNgtZv5kcRM8Lf0gRM0WU",
		    "place_name": "49 Rue Saint-Dominique, 75007 Paris, France"
		}, {
		    "lng": 2.347258293297898,
		    "lat": 48.83350477773871,
		    "place_id": "ChIJMXC5YZRx5kcRKLNPb9I2hsE",
		    "place_name": "70 Rue Pascal, 75013 Paris, France"
		}, {
		    "lng": 2.3509225661785536,
		    "lat": 48.866407381605825,
		    "place_id": "ChIJxZFxVBdu5kcR_WmCi8FU2Xs",
		    "place_name": "201 Rue St Denis, 75002 Paris, France"
		}, {
		    "lng": 2.347116185024305,
		    "lat": 48.86347177002216,
		    "place_id": "ChIJnVQx-Bhu5kcRoK_i4Hpls5A",
		    "place_name": "3 Rue de Turbigo, 75001 Paris, France"
		}, {
		    "lng": 2.344398049980299,
		    "lat": 48.8611400619036,
		    "place_id": "ChIJf5aI-CFu5kcRkhoBes5OTqk",
		    "place_name": "44 Rue Saint Honoré, 75001 Paris, France"
		}, {
		    "lng": 2.3453388576589873,
		    "lat": 48.849440195084725,
		    "place_id": "ChIJXaKubOdx5kcRlMXccz8ZO5s",
		    "place_name": "50 Rue des Écoles, 75005 Paris, France"
		}, {
		    "lng": 2.3345269424987123,
		    "lat": 48.85198352353859,
		    "place_id": "ChIJ_2gPktlx5kcRTaQtmnlEo8A",
		    "place_name": "18 Rue Princesse, 75006 Paris, France"
		}, {
		    "lng": 2.334486306130202,
		    "lat": 48.852314242109685,
		    "place_id": "ChIJS3CplNlx5kcR5nWLj1rrMZA",
		    "place_name": "10 Rue Princesse, 75006 Paris, France"
		}, {
		    "lng": 2.3346781662980334,
		    "lat": 48.854245613290516,
		    "place_id": "Eik4LTEwIFJ1ZSBkZSBsJ0FiYmF5ZSwgNzUwMDYgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "8-10 Rue de l'Abbaye, 75006 Paris, France"
		}, {
		    "lng": 2.3376075069335513,
		    "lat": 48.8523723923866,
		    "place_id": "EjEyNy0zMSBSdWUgR3LDqWdvaXJlIGRlIFRvdXJzLCA3NTAwNiBQYXJpcywgRnJhbmNl",
		    "place_name": "27-31 Rue Grégoire de Tours, 75006 Paris, France"
		}, {
		    "lng": 2.3044630898793628,
		    "lat": 48.83390268855695,
		    "place_id": "ChIJpxce3UZw5kcR_SD2POBO2-0",
		    "place_name": "47 Rue Brancion, 75015 Paris, France"
		}, {
		    "lng": 2.2993755305554373,
		    "lat": 48.83761317248624,
		    "place_id": "ChIJMeh58j9w5kcR6mjwUibOnCw",
		    "place_name": "98 Rue de l'Abbé Groult, 75015 Paris, France"
		}, {
		    "lng": 2.307429553592698,
		    "lat": 48.84013722911817,
		    "place_id": "ChIJfbYhuzlw5kcRzpXKuMm15_E",
		    "place_name": "20 Rue Mathurin Régnier, 75015 Paris, France " 
		}, {
		    "lng": 2.3367101843684566,
		    "lat": 48.86545912240561,
		    "place_id": "ChIJXcMjISVu5kcR0fFuuPr9DuQ",
		    "place_name": "35 Rue de Richelieu, 75001 Paris, France"
		}, {
		    "lng": 2.324333974682304,
		    "lat": 48.854617699433675,
		    "place_id": "ChIJ7ZMmBNVx5kcRaROhFUW77tc",
		    "place_name": "79 Rue du Bac, 75007 Paris, France"
		}, {
		    "lng": 2.3158158861148763,
		    "lat": 48.85183556376484,
		    "place_id": "ChIJp_blqi5w5kcRxYZp2m8JloQ",
		    "place_name": "59 Rue de Babylone, 75007 Paris, France"
		}, {
		    "lng": 2.319827429063878,
		    "lat": 48.81457329917535,
		    "place_id": "ChIJxZzaOQBx5kcRMH6wEzVb1Fg",
		    "place_name": "7 Avenue Verdier, 92120 Montrouge, France"
		}, {
		    "lng": 2.27684293410411,
		    "lat": 48.826894468412604,
		    "place_id": "ChIJazEEL3hw5kcRUtT0JIR5c3M",
		    "place_name": "17 Rue Vaudetard, 92130 Issy-les-Moulineaux, France"
		}, {
		    "lng": 2.374651649124587,
		    "lat": 48.84298427165649,
		    "place_id": "EiUxNzMgUnVlIGRlIEJlcmN5LCA3NTAxMiBQYXJpcywgRnJhbmNl",
		    "place_name": "173 Rue de Bercy, 75012 Paris, France"
		}, {
		    "lng": 2.369441931386291,
		    "lat": 48.83335152067596,
		    "place_id": "Ei4xNzMtMTc1IFJ1ZSBkdSBDaGV2YWxlcmV0LCA3NTAxMyBQYXJpcywgRnJhbmNl",
		    "place_name": "173-175 Rue du Chevaleret, 75013 Paris, France"
		}, {
		    "lng": 2.3951406674246414,
		    "lat": 48.83817715726238,
		    "place_id": "EjYzMC0zMiBSdWUgZGUgbGEgQnLDqGNoZSBhdXggTG91cHMsIDc1MDEyIFBhcmlzLCBGcmFuY2U",
		    "place_name": "30-32 Rue de la Brèche aux Loups, 75012 Paris, France " 
		}, {
		    "lng": 2.3907008820045803,
		    "lat": 48.839538325470414,
		    "place_id": "ChIJkxmjd2ty5kcR7z56oEaQIs0",
		    "place_name": "6 Rue Dugommier, 75012 Paris, France"
		}, {
		    "lng": 2.3868980859470526,
		    "lat": 48.84005073114395,
		    "place_id": "ChIJlfE9oRRy5kcRpfkmvtMaGL0",
		    "place_name": "15 Rue du Charolais, 75012 Paris, France"
		}, {
		    "lng": 2.396861525579226,
		    "lat": 48.84344707670101,
		    "place_id": "EiU0NyBSdWUgZGUgUGljcHVzLCA3NTAxMiBQYXJpcywgRnJhbmNl",
		    "place_name": "47 Rue de Picpus, 75012 Paris, France"
		}, {
		    "lng": 2.393089425504968,
		    "lat": 48.84551878557613,
		    "place_id": "ChIJQT3zDHJy5kcRFoxZj-gAN0E",
		    "place_name": "33 Rue du Sergent Bauchat, 75012 Paris, France"
		}, {
		    "lng": 2.3613561455101717,
		    "lat": 48.86022528743089,
		    "place_id": "ChIJp4Rn5ANu5kcRG2zcRbNOnZ4",
		    "place_name": "86bis Rue Vieille du Temple, 75003 Paris, France"
		}, {
		    "lng": 2.3565510532033045,
		    "lat": 48.859755268720676,
		    "place_id": "ChIJPfNzOANu5kcROxc4PJzG6Sc",
		    "place_name": "52 Rue des Archives, 75004 Paris, France"
		}, {
		    "lng": 2.3584232347667466,
		    "lat": 48.86139547374779,
		    "place_id": "ChIJ2ZUDhARu5kcRNINHEfzmxkY",
		    "place_name": "Hôtel Guénégaud, 75003 Paris, France"
		}, {
		    "lng": 2.3599884178651678,
		    "lat": 48.860676044881274,
		    "place_id": "ChIJi7VHiQNu5kcRMspHBTK97nc",
		    "place_name": "1 Rue Charlot, 75003 Paris, France"
		}, {
		    "lng": 2.3627867592046243,
		    "lat": 48.86204639937799,
		    "place_id": "ChIJX-6jvQZu5kcRIB2U7qvQ6DU",
		    "place_name": "23 Rue de Saintonge, 75003 Paris, France"
		}, {
		    "lng": 2.35854510985547,
		    "lat": 48.85854615257398,
		    "place_id": "EjA1NS02NSBSdWUgVmllaWxsZSBkdSBUZW1wbGUsIDc1MDA0IFBhcmlzLCBGcmFuY2U",
		    "place_name": "55-65 Rue Vieille du Temple, 75004 Paris, France"
		}, {
		    "lng": 2.3572281992717024,
		    "lat": 48.85870841085361,
		    "place_id": "ChIJoxuOIQNu5kcRfy1Y7HM70WU",
		    "place_name": "7 Rue Aubriot, 75004 Paris, France"
		}, {
		    "lng": 2.3570566088212104,
		    "lat": 48.860769129525636,
		    "place_id": "EiYzLTUgUnVlIGRlIEJyYXF1ZSwgNzUwMDMgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "3-5 Rue de Braque, 75003 Paris, France"
		}, {
		    "lng": 2.293956886284519,
		    "lat": 48.85561522972873,
		    "place_id": "ChIJveJz3h1w5kcR--AthimEg8g",
		    "place_name": "22 Avenue de Suffren, 75007 Paris, France"
		}, {
		    "lng": 2.2763967040911837,
		    "lat": 48.85787085082728,
		    "place_id": "ChIJmX2LTVVl5kcRg1Y2-m0QDvg",
		    "place_name": "81 Rue de Passy, 75016 Paris, France"
		}, {
		    "lng": 2.2992714665763003,
		    "lat": 48.850260497173025,
		    "place_id": "Ei4xIEF2ZW51ZSBQYXVsIETDqXJvdWzDqGRlLCA3NTAxNSBQYXJpcywgRnJhbmNl",
		    "place_name": "1 Avenue Paul Déroulède, 75015 Paris, France"
		}, {
		    "lng": 2.278118708689533,
		    "lat": 48.83971774102022,
		    "place_id": "ChIJO3kG-Qpw5kcRryIuGEHX7R8",
		    "place_name": "66 Rue Balard, 75015 Paris, France " 
		}, {
		    "lng": 2.35142461576973,
		    "lat": 48.84777744621809,
		    "place_id": "ChIJGRZBu-Vx5kcRcxSuHpe7uZU",
		    "place_name": "13 Rue des Écoles, 75005 Paris, France"
		}, {
		    "lng": 2.3324750587810854,
		    "lat": 48.85308073999059,
		    "place_id": "EiU1NiBSdWUgZGUgUmVubmVzLCA3NTAwNiBQYXJpcywgRnJhbmNl",
		    "place_name": "56 Rue de Rennes, 75006 Paris, France"
		}, {
		    "lng": 2.3305097169455564,
		    "lat": 48.85481770552943,
		    "place_id": "ChIJpbz9stdx5kcRIF31F2dqqfM",
		    "place_name": "42 Rue des Saints-Pères, 75007 Paris, France"
		}, {
		    "lng": 2.3278102431037837,
		    "lat": 48.8517478060279,
		    "place_id": "EiYxNCBSdWUgZGUgU8OodnJlcywgNzUwMDcgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "14 Rue de Sèvres, 75007 Paris, France"
		}, {
		    "lng": 2.333117362384513,
		    "lat": 48.8441392901768,
		    "place_id": "ChIJUTpRdsVx5kcRFnyn0lLJ-Tg",
		    "place_name": "86 Rue d'Assas, 75006 Paris, France"
		}, {
		    "lng": 2.330074819310056,
		    "lat": 48.84793413503246,
		    "place_id": "ChIJm-09SdBx5kcRMZdAOI1qQIM",
		    "place_name": "37 Rue de Vaugirard, 75006 Paris, France"
		}, {
		    "lng": 2.319177576266469,
		    "lat": 48.847707703054766,
		    "place_id": "ChIJKaMkbi1w5kcREAgMAovtKPI",
		    "place_name": "123 Rue de Sèvres, 75006 Paris, France"
		}, {
		    "lng": 2.3306852835435734,
		    "lat": 48.84297184247916,
		    "place_id": "Eis0LTYgUnVlIEp1bGVzIENoYXBsYWluLCA3NTAwNiBQYXJpcywgRnJhbmNl",
		    "place_name": "4-6 Rue Jules Chaplain, 75006 Paris, France"
		}, {
		    "lng": 2.3494209949981553,
		    "lat": 48.837060140407544,
		    "place_id": "EjIxMy0xNSBCb3VsZXZhcmQgZGUgUG9ydC1Sb3lhbCwgNzUwMDUgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "13-15 Boulevard de Port-Royal, 75005 Paris, France"
		}, {
		    "lng": 2.3596330570135535,
		    "lat": 48.83922098399057,
		    "place_id": "ChIJgUJHiPNx5kcRRLf_TbAsF4U",
		    "place_name": "15 Boulevard Saint-Marcel, 75013 Paris, France"
		}, {
		    "lng": 2.2770383013024684,
		    "lat": 48.86054647696389,
		    "place_id": "Ei0xOSBSdWUgRGVzYm9yZGVzLVZhbG1vcmUsIDc1MTE2IFBhcmlzLCBGcmFuY2U",
		    "place_name": "19 Rue Desbordes-Valmore, 75116 Paris, France"
		}, {
		    "lng": 2.3332911858469174,
		    "lat": 48.83404494465819,
		    "place_id": "ChIJFdRgULhx5kcRb1SRJ_A-lbA",
		    "place_name": "101 Place Denfert-Rochereau, 75014 Paris, France"
		}, {
		    "lng": 2.3330885978969036,
		    "lat": 48.83340889282215,
		    "place_id": "EigxIEF2ZW51ZSBSZW7DqSBDb3R5LCA3NTAxNCBQYXJpcywgRnJhbmNl",
		    "place_name": "1 Avenue René Coty, 75014 Paris, France"
		}, {
		    "lng": 2.3308368012862957,
		    "lat": 48.834149792862206,
		    "place_id": "EjIxNC0xNiBQbGFjZSBEZW5mZXJ0LVJvY2hlcmVhdSwgNzUwMTQgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "14-16 Place Denfert-Rochereau, 75014 Paris, France"
		}, {
		    "lng": 2.3263775308736854,
		    "lat": 48.83517997381696,
		    "place_id": "ChIJ68-6DLZx5kcRXyVz1fZPATY",
		    "place_name": "66 Rue Daguerre, 75014 Paris, France"
		}, {
		    "lng": 2.3278583465524036,
		    "lat": 48.83372952245912,
		    "place_id": "ChIJX2Kj97Zx5kcRmHtab_l3Gqg",
		    "place_name": "12 Rue Liancourt, 75014 Paris, France"
		}, {
		    "lng": 2.334607240469893,
		    "lat": 48.83200184330798,
		    "place_id": "EisxNCBWaWxsYSBTYWludC1KYWNxdWVzLCA3NTAxNCBQYXJpcywgRnJhbmNl",
		    "place_name": "14 Villa Saint-Jacques, 75014 Paris, France"
		}, {
		    "lng": 2.3482686853947996,
		    "lat": 48.847364198947076,
		    "place_id": "ChIJkd9Pa-Zx5kcRX0F09k2O-TY",
		    "place_name": "1 Rue de l'École Polytechnique, 75005 Paris, France"
		}, {
		    "lng": 2.347021265956414,
		    "lat": 48.84668284356445,
		    "place_id": "Ej0yLTQgUnVlIGRlIGxhIE1vbnRhZ25lIFNhaW50ZSBHZW5ldmnDqHZlLCA3NTAwNSBQYXJpcywgRnJhbmNl",
		    "place_name": "2-4 Rue de la Montagne Sainte Geneviève, 75005 Paris France " 
		}, {
		    "lng": 2.346364198912056,
		    "lat": 48.846788083361616,
		    "place_id": "EiI2IFJ1ZSBWYWxldHRlLCA3NTAwNSBQYXJpcywgRnJhbmNl",
		    "place_name": "6 Rue Valette, 75005 Paris, France"
		}, {
		    "lng": 2.3490551337782506,
		    "lat": 48.84620283018543,
		    "place_id": "ChIJA4SUA-Zx5kcRJTU7uAdNF_4",
		    "place_name": "30 Rue Descartes, 75005 Paris, France"
		}, {
		    "lng": 2.3492359517935313,
		    "lat": 48.84433315963682,
		    "place_id": "ChIJmQEdM-9x5kcRctq4kLScXF8",
		    "place_name": "18 Rue Mouffetard, 75005 Paris, France " 
		}, {
		    "lng": 2.3480238079385742,
		    "lat": 48.84444916324529,
		    "place_id": "ChIJ0bGZwuhx5kcRlgNzD2Zc68s",
		    "place_name": "3 Rue de l'Estrapade, 75005 Paris, France"
		}, {
		    "lng": 2.3495723905651857,
		    "lat": 48.843167710581696,
		    "place_id": "EiY1NSBSdWUgTW91ZmZldGFyZCwgNzUwMDUgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "55 Rue Mouffetard, 75005 Paris, France"
		}, {
		    "lng": 2.3491351374344163,
		    "lat": 48.844909740896185,
		    "place_id": "ChIJh1cuS-9x5kcRpV0TYfwWWA4",
		    "place_name": "2 Rue Mouffetard, 75005 Paris, France"
		}, {
		    "lng": 2.3481829218400208,
		    "lat": 48.842910144751386,
		    "place_id": "ChIJHY7IOulx5kcRSzHmw_Khtv4",
		    "place_name": "20 Rue Tournefort, 75005 Paris, France"
		}, {
		    "lng": 2.3470838872565594,
		    "lat": 48.84347146760655,
		    "place_id": "ChIJx5uZ4uhx5kcRUqmnngFAgQ0",
		    "place_name": "12 Rue Laromiguière, 75005 Paris, France"
		}, {
		    "lng": 2.351528521041871,
		    "lat": 48.84394994944458,
		    "place_id": "EiYzMyBSdWUgTGFjw6lww6hkZSwgNzUwMDUgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "33 Rue Lacépède, 75005 Paris, France"
		}, {
		    "lng": 2.3579847009690127,
		    "lat": 48.85133860082047,
		    "place_id": "ChIJizKch_xx5kcR743IKYbR_fo",
		    "place_name": "18 Rue Saint-Louis en l'Île, 75004 Paris, France"
		}, {
		    "lng": 2.367319047120276,
		    "lat": 48.84224071385731,
		    "place_id": "Eiw4MS04NSBRdWFpIGQnQXVzdGVybGl0eiwgNzUwMTMgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "81-85 Quai d'Austerlitz, 75013 Paris, France"
		}, {
		    "lng": 2.3685979701430995,
		    "lat": 48.84066748806413,
		    "place_id": "ChIJiW0Bgh5y5kcR0FYyh_9KVzo",
		    "place_name": "62 Avenue Pierre Mendès-France, 75013 Paris, France " 
		}, {
		    "lng": 2.370555491917287,
		    "lat": 48.840074814047256,
		    "place_id": "EikzMCBRdWFpIGQnQXVzdGVybGl0eiwgNzUwMTMgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "30 Quai d'Austerlitz, 75013 Paris, France"
		}, {
		    "lng": 2.3325632883149297,
		    "lat": 48.87013647549816,
		    "place_id": "ChIJVYsB6zBu5kcR-kQixNG7rBk",
		    "place_name": "2 Avenue de l'Opéra, 75002 Paris, France"
		}, {
		    "lng": 2.3344490050393745,
		    "lat": 48.87102495359164,
		    "place_id": "Ei4zOCBCb3VsZXZhcmQgZGVzIEl0YWxpZW5zLCA3NTAwOSBQYXJpcywgRnJhbmNl",
		    "place_name": "38 Boulevard des Italiens, 75009 Paris, France"
		}, {
		    "lng": 2.33318073551186,
		    "lat": 48.86856618547108,
		    "place_id": "EiozOSBBdmVudWUgZGUgbCdPcMOpcmEsIDc1MDAyIFBhcmlzLCBGcmFuY2U",
		    "place_name": "39 Avenue de l'Opéra, 75002 Paris, France"
		}, {
		    "lng": 2.3771215923600835,
		    "lat": 48.87037232492665,
		    "place_id": "ChIJ19Ao0eVt5kcRhMtZ84kjfcE",
		    "place_name": "34 Rue de l'Orillon, 75011 Paris, France"
		}, {
		    "lng": 2.3754106046805816,
		    "lat": 48.865229455855854,
		    "place_id": "EiU5NSBSdWUgT2JlcmthbXBmLCA3NTAxMSBQYXJpcywgRnJhbmNl",
		    "place_name": "95 Rue Oberkampf, 75011 Paris, France"
		}, {
		    "lng": 2.376844668371433,
		    "lat": 48.86558967856769,
		    "place_id": "ChIJSzdSzfpt5kcR7wTFKtjgKFo",
		    "place_name": "103 Rue Oberkampf, 75011 Paris, France"
		}, {
		    "lng": 2.3780487195346325,
		    "lat": 48.86586018427718,
		    "place_id": "EioxMTEtMTEzIFJ1ZSBPYmVya2FtcGYsIDc1MDExIFBhcmlzLCBGcmFuY2U",
		    "place_name": "111-113 Rue Oberkampf, 75011 Paris, France"
		}, {
		    "lng": 2.379893200821755,
		    "lat": 48.866214498099026,
		    "place_id": "ChIJO-KD5u9t5kcR-fFP0i9KSiM",
		    "place_name": "126 Rue Oberkampf, 75011 Paris, France"
		}, {
		    "lng": 2.3820337582612012,
		    "lat": 48.86682192583322,
		    "place_id": "EioxNTMtMTU1IFJ1ZSBPYmVya2FtcGYsIDc1MDExIFBhcmlzLCBGcmFuY2U",
		    "place_name": "153-155 Rue Oberkampf, 75011 Paris, France"
		}, {
		    "lng": 2.380339613934069,
		    "lat": 48.86480368143208,
		    "place_id": "ChIJo1b6GPBt5kcRSrN5LGNuKV8",
		    "place_name": "11 Villa Gaudelet, 75011 Paris, France"
		}, {
		    "lng": 2.373809074126484,
		    "lat": 48.86625432816385,
		    "place_id": "ChIJSZryr-Rt5kcRnnzvvnGHri8",
		    "place_name": "100 Avenue Parmentier, 75011 Paris, France"
		}, {
		    "lng": 2.3772522926025204,
		    "lat": 48.86353916455607,
		    "place_id": "Ei4xMiBQYXNzYWdlIFNhaW50LUFtYnJvaXNlLCA3NTAxMSBQYXJpcywgRnJhbmNl",
		    "place_name": "12 Passage Saint-Ambroise, 75011 Paris, France"
		}, {
		    "lng": 2.3598152034875,
		    "lat": 48.868724397275344,
		    "place_id": "EiYxLTMgUnVlIGRlIExhbmNyeSwgNzUwMTAgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "1-3 Rue de Lancry, 75010 Paris, France"
		}, {
		    "lng": 2.364448450823005,
		    "lat": 48.869186213745735,
		    "place_id": "EikxMSBSdWUgTMOpb24gSm91aGF1eCwgNzUwMTAgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "11 Rue Léon Jouhaux, 75010 Paris, France"
		}, {
		    "lng": 2.3634248971246166,
		    "lat": 48.867773593643506,
		    "place_id": "ChIJNSD_2ghu5kcROsUImbCJJ7A",
		    "place_name": "1 Square Henri Christine, 75010 Paris, France " 
		}, {
		    "lng": 2.340952609564937,
		    "lat": 48.87504335471394,
		    "place_id": "ChIJu9xMMT9u5kcR0Ck8_gV7fGc",
		    "place_name": "29 Rue Drouot, 75009 Paris, France"
		}, {
		    "lng": 2.3198997096798735,
		    "lat": 48.874825274666705,
		    "place_id": "Eiw2IEJvdWxldmFyZCBNYWxlc2hlcmJlcywgNzUwMDggUGFyaXMsIEZyYW5jZQ",
		    "place_name": "6 Boulevard Malesherbes, 75008 Paris, France"
		}, {
		    "lng": 2.369974448297512,
		    "lat": 48.85132936965638,
		    "place_id": "Eic5Ni0xMTggUnVlIGRlIEx5b24sIDc1MDEyIFBhcmlzLCBGcmFuY2U",
		    "place_name": "96-118 Rue de Lyon, 75012 Paris, France"
		}, {
		    "lng": 2.371056438046054,
		    "lat": 48.84945359648276,
		    "place_id": "EiM0NCBSdWUgZGUgTHlvbiwgNzUwMTIgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "44 Rue de Lyon, 75012 Paris, France"
		}, {
		    "lng": 2.3651055551923434,
		    "lat": 48.85389576523826,
		    "place_id": "ChIJ_-bqvP9x5kcRDniiZ_95msM",
		    "place_name": "34 Rue Saint-Antoine, 75004 Paris, France"
		}, {
		    "lng": 2.3609311092008625,
		    "lat": 48.85531884271563,
		    "place_id": "ChIJ79_w8P1x5kcRLq_CB8TUMsI",
		    "place_name": "10 Rue de Rivoli, 75004 Paris, France"
		}, {
		    "lng": 2.3737505902456633,
		    "lat": 48.85881290620904,
		    "place_id": "EiMxLTMgUnVlIE1vdWZsZSwgNzUwMTEgUGFyaXMsIEZyYW5jZQ",
		    "place_name": "1-3 Rue Moufle, 75011 Paris, France"
		}, {
		    "lng": 2.3801941407071183,
		    "lat": 48.85357152770533,
		    "place_id": "ChIJjffwTwhy5kcRsU-6lhINtSs",
		    "place_name": "69 Rue de Charonne, 75011 Paris, France"
		}, {
		    "lng": 2.3471307690911942,
		    "lat": 48.82559557160158,
		    "place_id": "ChIJRSzk-plx5kcRZXZIPBQUByA",
		    "place_name": "32 Rue de l'Espérance, 75013 Paris, France"
		}, {
		    "lng": 2.341862765314886,
		    "lat": 48.82652231890893,
		    "place_id": "ChIJAVlj_Zdx5kcRjW6-y18nz-s",
		    "place_name": "129 Rue de la Glacière, 75013 Paris, France"
		}, {
		    "lng": 2.3287226197275857,
		    "lat": 48.83570149557116,
		    "place_id": "ChIJB65wy7dx5kcRmW9SUthsxek",
		    "place_name": "21 Rue Froidevaux, 75014 Paris, France"
		}, {
		    "lng": 2.3181000468403568,
		    "lat": 48.83755343561171,
		    "place_id": "ChIJs_tNnDVw5kcRyhhZEsLCUW8",
		    "place_name": "60 Rue du Château, 75014 Paris, France"
		}, {
		    "lng": 2.379031501635666,
		    "lat": 48.892793939070316,
		    "place_id": "ChIJH0CoWtJt5kcR4lulkPQdQfk",
		    "place_name": "141 Avenue de Flandre, 75019 Paris, France " 
		}, {
		    "lng": 2.37270673237245,
		    "lat": 48.89240982996253,
		    "place_id": "EiUxNy0xOSBSdWUgQ3VyaWFsLCA3NTAxOSBQYXJpcywgRnJhbmNl",
		    "place_name": "17-19 Rue Curial, 75019 Paris, France"
		}, {
		    "lng": 2.3708434081895575,
		    "lat": 48.888604557042555,
		    "place_id": "EiU1MSBSdWUgZGUgVGFuZ2VyLCA3NTAxOSBQYXJpcywgRnJhbmNl",
		    "place_name": "51 Rue de Tanger, 75019 Paris, France"
		}, {
		    "lng": 2.3766324166172126,
		    "lat": 48.89077510685465,
		    "place_id": "EisxODAtMTg0IFJ1ZSBkZSBDcmltw6llLCA3NTAxOSBQYXJpcywgRnJhbmNl",
		    "place_name": "180-184 Rue de Crimée, 75019 Paris, France"
		}, {
		    "lng": 2.355830641778283,
		    "lat": 48.89041568777148,
		    "place_id": "ChIJjczbjWRu5kcRohHcUtuPYzE",
		    "place_name": "21 Rue Ordener, 75018 Paris, France"
		}, {
		    "lng": 2.355959361875051,
		    "lat": 48.88861816658135,
		    "place_id": "ChIJs3WXAWVu5kcRRCEJayVYcAc",
		    "place_name": "25 Rue Doudeauville, 75018 Paris, France"
		}, {
		    "lng": 2.3671168038801795,
		    "lat": 48.88760997544867,
		    "place_id": "ChIJcelsTHhu5kcRuQOMge0fhrw",
		    "place_name": "47 Rue d'Aubervilliers, 75018 Paris, France"
		}, {
		    "lng": 2.382209219876131,
		    "lat": 48.89065164563837,
		    "place_id": "EiQzIFJ1ZSBkZSBsJ09pc2UsIDc1MDE5IFBhcmlzLCBGcmFuY2U",
		    "place_name": "3 Rue de l'Oise, 75019 Paris, France"
		}, {
		    "lng": 2.3798924162180413,
		    "lat": 48.887861777246854,
		    "place_id": "ChIJq1t0MdBt5kcRJKUCp7XPKlY",
		    "place_name": "100 Quai de la Loire, 75019 Paris, France"
		}, {
		    "lng": 2.361179572212791,
		    "lat": 48.88678401473075,
		    "place_id": "EiQyMS0yMyBSdWUgUGFqb2wsIDc1MDE4IFBhcmlzLCBGcmFuY2U",
		    "place_name": "21-23 Rue Pajol, 75018 Paris, France"
		}, {
		    "lng": 2.340657562817512,
		    "lat": 48.88575882140458,
		    "place_id": "ChIJwXAYu0Ru5kcRDOkIlh69_Yc",
		    "place_name": "23 Rue Gabrielle, 75018 Paris, France"
		}, {
		    "lng": 2.336471643221955,
		    "lat": 48.88459392264849,
		    "place_id": "ChIJi3eucUVu5kcRdt12p7A7kjs",
		    "place_name": "16 Rue Véron, 75018 Paris, France"
		}, {
		    "lng": 2.3332094800162224,
		    "lat": 48.88431834078011,
		    "place_id": "ChIJefXWq09u5kcRDOIgAcHmE6U",
		    "place_name": "7 Rue Lepic, 75018 Paris, France"
		}, {
		    "lng": 2.3394240162493816,
		    "lat": 48.8852729925874,
		    "place_id": "ChIJYRLQ6URu5kcRLBa2XVKOdyc",
		    "place_name": "45 Rue des Trois Frères, 75018 Paris, France"
		}, {
		    "lng": 2.305505829977818,
		    "lat": 48.88250500950252,
		    "place_id": "EisxIFJ1ZSBFZG91YXJkIERldGFpbGxlLCA3NTAxNyBQYXJpcywgRnJhbmNl",
		    "place_name": "1 Rue Edouard Detaille, 75017 Paris, France"
		}, {
		    "lng": 2.353290833501319,
		    "lat": 48.87475636342987,
		    "place_id": "ChIJzVsRFRNu5kcReIfrccv0wdQ",
		    "place_name": "17 Rue de Paradis, 75010 Paris, France"
		}, {
		    "lng": 2.378418993536627,
		    "lat": 48.8790382309013,
		    "place_id": "ChIJZzVc6dxt5kcRHJsiWcjYlI0",
		    "place_name": "31 Rue Manin, 75019 Paris, France " 
		}, {
		    "lng": 2.388312636795831,
		    "lat": 48.87920521578451,
		    "place_id": "EigyIFJ1ZSBkZSBsJ0VuY2hldmFsLCA3NTAxOSBQYXJpcywgRnJhbmNl",
		    "place_name": "2 Rue de l'Encheval, 75019 Paris, France"
		}, {
		    "lng": 2.3947578346536034,
		    "lat": 48.856847179635594,
		    "place_id": "ChIJy04ZJIpt5kcRJzShTdSj1as",
		    "place_name": "150 Boulevard de Charonne, 75020 Paris, France"
		}, {
		    "lng": 2.38688294488378,
		    "lat": 48.83407418560631,
		    "place_id": "ChIJ2X108j9y5kcRtVRbEaglMDs",
		    "place_name": "22 Rue Gabriel Lamé, 75012 Paris, France"
		}, {
		    "lng": 2.385550272002405,
		    "lat": 48.83255477744976,
		    "place_id": "ChIJYUgmjT9y5kcR72Bo9SMXpQc",
		    "place_name": "75012 Paris, France"
		}]

	}

});


