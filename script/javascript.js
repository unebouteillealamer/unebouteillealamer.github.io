function initInfoWindow(){
    var InfoWindow = function(){
        this.container = document.createElement('info');
        this.container.classList.add('map-informationWindow');
        this.layer = null;
        this.marker = null;
        this.position = null;
    };
    //Base sur overlay view
    InfoWindow.prototype = new google.maps.OverlayView();
    //Appele lors de l’ajout a une carte
    InfoWindow.prototype.ajout = function(){
        this.layer = this.getPanes().floatPane;
        this.layer.appendChild(this.container);
        this.container.getElementsByClassName('map-infoWindow-close')[0].addEventListener('click', function(){
            // Ferme l’infoWindow sur le click
            this.close();
        }.bind(this), false);
        // S’assure que lentierete de la fenêtre d’info apparait sur la carte
	// lors d’un clic sur un point.
        setTimeout(this.panToView.bind(this), 200);
    };
    //Appelle apres lajout
    InfoWindow.prototype.draw = function(){
        var markerIcon = this.marker.getIcon(),
            cHeight = this.container.offsetHeight + markerIcon.scaledSize.height + 10,
            cWidth = this.container.offsetWidth / 2;
        this.position = this.getProjection().fromLatLngToDivPixel(this.marker.getPosition());
        this.container.style.top = this.position.y - cHeight+'px';
        this.container.style.left = this.position.x - cWidth+'px';
    };
    //Si la fenetre nest pas entierement dans la fenetre on replace la carte.
    InfoWindow.prototype.panToView = function(){
        var position = this.position,
            latlng = this.marker.getPosition(),
            top = parseInt(this.container.style.top, 10),
            cHeight = position.y - top,
            cWidth = this.container.offsetWidth / 2,
            map = this.getMap(),
            center = map.getCenter(),
            bounds = map.getBounds(),
            degPerPixel = (function(){
                var degs = {},
                    div = map.getDiv(),
                    span = bounds.toSpan();

                degs.x = span.lng() / div.offsetWidth;
                degs.y = span.lat() / div.offsetHeight;
                return degs;
            })(),
            infoBounds = (function(){
                var infoBounds = {};

                infoBounds.north = latlng.lat() + cHeight * degPerPixel.y;
                infoBounds.south = latlng.lat();
                infoBounds.west = latlng.lng() - cWidth * degPerPixel.x;
                infoBounds.east = latlng.lng() + cWidth * degPerPixel.x;
                return infoBounds;
            })(),
            newCenter = (function(){
                var ne = bounds.getNorthEast(),
                    sw = bounds.getSouthWest(),
                    north = ne.lat(),
                    east = ne.lng(),
                    south = sw.lat(),
                    west = sw.lng(),
                    x = center.lng(),
                    y = center.lat(),
                    shiftLng = ((infoBounds.west < west) ? west - infoBounds.west : 0) +
                        ((infoBounds.east > east) ? east - infoBounds.east : 0),
                    shiftLat = ((infoBounds.north > north) ? north - infoBounds.north : 0) +
                        ((infoBounds.south < south) ? south - infoBounds.south : 0);

                return (shiftLng || shiftLat) ? new google.maps.LatLng(y - shiftLat, x - shiftLng) : void 0;
            })();

        if (newCenter){
            map.panTo(newCenter);
        }
    };
    //Appelle lorsque la carte est nulle
    InfoWindow.prototype.onRemove = function(){
        this.layer.removeChild(this.container);
    };
    //Appelle lorsque la carte est initie
    InfoWindow.prototype.setContent = function(html){
        this.container.innerHTML = html;
    };
    //Place la carte et le bon marqueur
    InfoWindow.prototype.open = function(map, marker){
        this.marker = marker;
        this.setMap(map);
    };
    //Place la carte a null
    InfoWindow.prototype.close = function(){
        this.setMap(null);
    };
    return InfoWindow;
}