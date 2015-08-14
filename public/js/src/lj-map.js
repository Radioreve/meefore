window.LJ = _.merge(window.LJ || {}, {

    params: _.merge(window.LJ.params || {}, {

        map: {
            style: {
                sober: [{
                    "featureType": "administrative.neighborhood",
                    "elementType": "labels",
                    "stylers": [{
                        //"color": "#444444",
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [{
                        "color": "#f2f2f2"
                    }]
                }, {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "poi.business",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [{
                        "saturation": -100
                    }, {
                        "lightness": 45
                    }]
                }, {
                    "featureType": "road.highway",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "road.arterial",
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [{
                        "color": "#b4d4e1"
                    }, {
                        "visibility": "on"
                    }]
                }],
                lunar: [{
                    "stylers": [{
                        "hue": "#ff1a00"
                    }, {
                        "invert_lightness": true
                    }, {
                        "saturation": -100
                    }, {
                        "lightness": 33
                    }, {
                        "gamma": 0.5
                    }]
                }, {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#2D333C"
                    }]
                }]
            }
        }
    }),

    fn: _.merge(window.LJ.fn || {}, {

        initMap: function() {

            var map_style_sober = new google.maps.StyledMapType(LJ.params.map.style.sober, {
                name: 'sober'
            });
            var map_style_lunar = new google.maps.StyledMapType(LJ.params.map.style.lunar, {
                name: 'lunar'
            });

            LJ.map = new google.maps.Map(document.getElementsByClassName('row-events-map')[0], {
                center: {
                    lat: 48.8566140,
                    lng: 2.3522219
                },
                zoom: 13,
                mapTypeControlOptions: {
                    mapTypeIds: ['sober', 'lunar']
                }
            });

            LJ.map.mapTypes.set('sober', map_style_sober);
            LJ.map.mapTypes.set('lunar', map_style_lunar);

            LJ.map.setMapTypeId('sober');

        }

    })

})