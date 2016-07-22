import './add-event.html';
import './add-event.css'
import '/imports/api/events/methods.js';
//import {Images} from '/imports/api/images/images.js'; // TODO create method

function displayImage(imgObj) {
    var cursor = Images.find(imgObj._id);
    var liveQuery = cursor.observe({
        changed: function(newImage, oldImage) {
          if (newImage.url() !== null) {
            liveQuery.stop();
            $('#droppedImg').find('img').attr('src', newImage.url());
            $('#imgDropZone').attr('imgUrl', newImage.url());
            $('#imgDropZone').addClass('hide');
          }
        }
    });       
}

function initValidator() {
    var validator = $('.event-setup').validate({
        rules: {
            name: {
                maxlength: 20
            }
        },
        submitHandler: function(event) {
            Meteor.call('addEvent', event.target.name.value, event.target.location.value, event.target.date.value, $('#imgDropZone').attr('imgUrl'), function () {
                Router.go('home');
            });
        }
    });
}

function initDateTimePickers() {
    $('#start-date')
        .datetimepicker({
            defaultDate: new Date(),
            format: "DD-MM-YYYY HH:mm",
            minDate: new Date()
        })
        .on("dp.change", () => {
            var startDate = $('#start-date').data('DateTimePicker').date()
            $("#end-date").data('DateTimePicker').minDate(startDate);
        });
    $('#end-date')
        .datetimepicker({
            defaultDate: new Date(),
            format: "DD-MM-YYYY HH:mm",
        })
        .on("dp.change", () => {
            var endDate = $('#end-date').data('DateTimePicker').date()
            $("#start-date").data('DateTimePicker').maxDate(endDate);
        });
}

function initGoogleMaps() {
    GoogleMaps.load({
        key: 'AIzaSyBY0lDEE8uNafAydB8sJlj3SMKZQ1rr4Ls',
        libraries: 'places'
    });
    Tracker.autorun(function () {
        if (GoogleMaps.loaded()) {
            $("#inputLocation")
                .geocomplete({
                    map: '#map'//,
                    // markerOptions: {
                    //     draggable: true
                    // }
                })
                .bind("geocode:result", function(event, result){
                    $('#map').show();
                    var map = $("#inputLocation").geocomplete("map");
                    google.maps.event.trigger(map, 'resize');
                    console.log(result.geometry.viewport);
                    map.panTo(result.geometry.location);
                    // map.setZoom(12);
                    // map.fitBounds(result.geometry.bounds);
                })
                .bind("geocode:error", function(event, result){
                    console.log("Geo error:", result);
                });
        }
    });
}

Template.addEvent.onRendered(function() {
    initValidator();
    initGoogleMaps();
    initDateTimePickers();
});

Template.addEvent.events({
    'submit form': function(event) {
        event.preventDefault();
    },
    'dropped #imgDropZone': function(event) {
        FS.Utility.eachFile(event, function(file) {
            Images.insert(file, function (err, fileObj) {
                if (err){
                    console.log(err);
                } else {
                    displayImage(fileObj);
                }
            });
         });
    }
});

Template.addEvent.helpers({
    mapOptions: function() {
        // Make sure the maps API has loaded
        if (GoogleMaps.loaded()) {
          // Map initialization options
          return {
            center: new google.maps.LatLng(-37.8136, 144.9631),
            zoom: 8
          };
        }
    }
})