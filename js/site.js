/*! Marta-Times - v0.0.1 - */
(function(){
    MartaTimes = {
        EndPoint: '/curl.php',
        ArrivalTimes: '',
        init: function () {
            MartaTimes.GetData();
            MartaTimes.Locate.GetLocation();
            MartaTimes.StationListToggle();
            
        },
        TrainData: null,
        CurrentStation:null,
        SetBGImage: function () {
            var $wrapper = $('#pageWrapper');
            var $win = $(window);
            var $body = $('body');
            var h = $win.height();
            if (h <= $wrapper.height()) h = $wrapper.outerHeight() + 30;
            var w = $body.width();
            var wrapW = $wrapper.width();
            var margin = (w - wrapW) / 2;
            if (margin <= 0) margin = 10;
            var image = '<div class="bg-image" style="height:' + h + 'px;"><img src="/img/bg.jpg" /></div>';
            $wrapper
                .css('left', margin)
                .before(image)
                .height(h- 40);
            if (wrapW >= ((wrapW + margin) / 2)) $wrapper.width(wrapW - margin);
        },
        GetData: function () {
            $.ajax({
                url: MartaTimes.EndPoint,
                complete: function (event,xhr) { MartaTimes.FormatData(event, xhr) },
                type: 'GET',
                dataType:'json'
            });
        },
        FormatData: function (event, xhr) {
            var Data = event.responseJSON;
            MartaTimes.TrainData = Data;
            MartaTimes.Locate.LoadAllStationLocations();
        },
        ShowNextTrainsAtClosestStation: function(){
            var closestStation = MartaTimes.Locate.ClosestLocation();
            var $linesAtStations = $(closestStation.find('Lines').find('Line'));
            var trainData = MartaTimes.TrainData;
            var $page = $('#pageContent');
            var closestStationName = closestStation.find('Name').text().replace(/'/g, "") + ' STATION';
            var nextTrainsAtStation = new Array();
            for (var i = 0; i < $linesAtStations.length; i++) {
                var line = $linesAtStations[i].innerHTML;

                for (var ii = 0; ii < trainData.length; ii++) {
                    if (trainData[ii].STATION == closestStationName) {
                        nextTrainsAtStation.push(trainData[ii]);
                    }
                }
                var firstDirection = "";
                var secondDirection = "";
                for (var a = 0; a < nextTrainsAtStation.length; a++) {
                    switch (firstDirection) {
                        case "":
                            firstDirection = nextTrainsAtStation[a].DIRECTION;
                            $page.append(MartaTimes.Templates.DirectionHeader(nextTrainsAtStation[a]));
                            $page.append(MartaTimes.Templates.NextTrainMarkup(nextTrainsAtStation[a]));
                            nextTrainsAtStation.splice(a, 1);
                            break;
                        case nextTrainsAtStation[a].DIRECTION:
                            $page.append(MartaTimes.Templates.NextTrainMarkup(nextTrainsAtStation[a]));
                            nextTrainsAtStation.splice(a, 1);
                            break;
                        default:
                            if (secondDirection === "") secondDirection = nextTrainsAtStation[a].DIRECTION;
                            break;
                    }
                }
                if (nextTrainsAtStation.length > 0) {;
                    $page.append(MartaTimes.Templates.DirectionHeader(nextTrainsAtStation[0]));
                    for (var aa = 0; aa < nextTrainsAtStation.length; aa++) {
                        $page.append(MartaTimes.Templates.NextTrainMarkup(nextTrainsAtStation[aa]));
                    }
                }
            }
            
        },
        AddStationList: function(){
            var $stations = MartaTimes.Locate.StationLocations.find('Station');
            var $selector = $('#stationSelector');
            $stations.each(function () {
                $selector.append(MartaTimes.Templates.StationSelectOption($(this)));
            });
            MartaTimes.StationSwitch();
        },
        StationListToggle: function () {
            var $stationBtn = $('#headings h3');
            var $stationList = $('#stationSelect');
            var $showText = $('#changeText');
            var $hideText = $('#hideText');
            $stationBtn.on('click', function () {
                $stationList.slideToggle();
                $showText.toggle();
                $hideText.toggle();
            });
        },
        StationSwitch: function(){
            var $stations = MartaTimes.Locate.StationLocations.find('Station');
            var $select = $('#stationSelector');

            $select.on('change', function () {
                var option = $(this).find('option:selected');
                var value = option.val().replace(' station','');
                MartaTimes.Locate.StationLocations.find('Station').find('Name').each(function () {
                    if ($(this).text().toLowerCase() == value) {
                        MartaTimes.CurrentStation = $(this).parent('Station');
                        return;
                    }
                });
                var $heading = $('#headings');
                var $lineListing = $('.line-listing');
                $lineListing.remove();
                var $oldInfo = $('.direction-header,.next-train');
                $oldInfo.remove();
                $heading.after(MartaTimes.Templates.StationLineInfo(MartaTimes.Locate.ClosestLocation()));
                MartaTimes.ShowNextTrainsAtClosestStation();
            });
        },
        Locate: {
            init: function () {
                
            },
            UserLatitude: null,
            UserLongitude: null,
            StationLocations: null,
            GetLocation: function(){
                if (navigator.geolocation){
                    navigator.geolocation.getCurrentPosition(MartaTimes.Locate.SetPosition);
                }
            },
            SetPosition: function (position) {
                MartaTimes.Locate.UserLatitude = position.coords.latitude;
                MartaTimes.Locate.UserLongitude = position.coords.longitude;
            },
            LoadAllStationLocations: function (callback) {
                
                $.ajax({
                    url: '/xml/Stations.xml',
                    complete: function (event) {
                        var $title = $('#stationOutput');
                        var $heading = $('#headings');
                        MartaTimes.Locate.StationLocations = $(event.responseXML);
                        var stationName = MartaTimes.Locate.ClosestLocation().find('Name').text().toLowerCase() + ' Station';
                        $title.text(stationName);
                        $heading.after(MartaTimes.Templates.StationLineInfo(MartaTimes.Locate.ClosestLocation()));
                        MartaTimes.ShowNextTrainsAtClosestStation();
                        MartaTimes.SetBGImage();
                        MartaTimes.AddStationList();
                    },
                });

            },
            ClosestLocation: function () {
                if(MartaTimes.CurrentStation === null){
                    var stations = MartaTimes.Locate.StationLocations.find('Station');
                    var distances  = '';
                    var ClosestStation;
                    stations.each(function () {
                        var stationLat = $(this).find('Latitude').text();
                        var stationLong = $(this).find('Longitude').text();
                        var distance = Helpers.GetDistanceFromLatLonInKm(stationLat, stationLong, MartaTimes.Locate.UserLatitude, MartaTimes.Locate.UserLongitude);
                        distances += distance + '|';
                    });
                    distances = distances.substring(0, distances.length - 1);
                    var distancesArray = distances.split('|');
               
                    //Resig Hack
                    Array.min = function (distancesArray) {
                        return Math.min.apply(Math, distancesArray);
                    };
                    var lowest = Array.min(distancesArray);
                    lowest = lowest.toString();
                    var AI = $.inArray(lowest, distancesArray);
                    ClosestStation = $(stations[AI]);
                    MartaTimes.CurrentStation = ClosestStation;

                    return ClosestStation;
                } else {
                    ClosestStation = MartaTimes.CurrentStation;

                    return ClosestStation;
                }

            },
            GetDistance: function (lat1, lon1, lat2, lon2, unit) {
                var radlat1 = Math.PI * lat1 / 180
                var radlat2 = Math.PI * lat2 / 180
                var radlon1 = Math.PI * lon1 / 180
                var radlon2 = Math.PI * lon2 / 180
                var theta = lon1 - lon2
                var radtheta = Math.PI * theta / 180
                var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                dist = Math.acos(dist)
                dist = dist * 180 / Math.PI
                dist = dist * 60 * 1.1515
                if (unit == "K") { dist = dist * 1.609344 }
                if (unit == "N") { dist = dist * 0.8684 }
                return dist
            }
        },
        Templates: {
            StationButtons: function (stationName) {
                var markup = '<div class="station-btn">' +
                    stationName +
                    '</div>';

                return markup;
            },
            StationLineInfo: function(location){
                var lines = location.find('Lines');
                var markup = '<div class="line-listing">Lines: <ul>';
                lines.find('Line').each(function () {
                    var stationName = $(this).text().toLowerCase();
                    var className = stationName + '-line';
                    markup += '<li class="cap"><div class="icon-flickr ' + className + '">&nbsp</div>' + stationName + '</li>';
                });
                markup += '</ul></div>'
                return markup;
            },
            DirectionHeader: function (train) {
                var direction;
                var iconClass;
                switch (train.DIRECTION) {
                    case "W":
                        direction = 'West Bound';
                        iconClass = 'icon-arrow-left';
                        break;
                    case "E":
                        direction = 'East Bound';
                        iconClass = 'icon-arrow-right';
                        break;
                    case "S":
                        direction = 'South Bound';
                        iconClass = 'icon-arrow-down';
                        break;
                    case "N":
                        direction = 'North Bound';
                        iconClass = 'icon-arrow-up';
                        break;
                }
                var markup = '<div class="direction-header">' +
                    '<span class="' + iconClass + ' i-font"></span>' +
                    direction + ' Trains' + 
                    '</div>';

                return markup;
            },
            NextTrainMarkup: function (trainData) {
                var diff = MartaTimes.Helpers.GetTimeDiff(trainData);
                var className = trainData.LINE.toLowerCase() + '-line';
                var markup = '<div class="next-train">' + 
                    '<span class="icon-flickr ' +
                    className +
                    '">&nbsp;</span>' +
                    '<span class="cap">' + trainData.LINE.toLowerCase() + '</span> Line - ' +
                    diff +
                    '<span class="appx">Approximately</span><div class="arrival-time">' +
                    trainData.NEXT_ARR +
                    '</div></div>';

                return markup;
            },
            StationSelectOption: function (station) {
                var stationName = station.find('Name').text().toLowerCase() + ' station';
                var markup = '<option value="' +
                    stationName + '">' +
                    stationName +
                    '</option>';
                return markup;
            }
        },
        Helpers: {
            GetTimeDiff: function (trainData) {
                var compareTime = trainData.NEXT_ARR.replace(' PM', '').replace(' AM', '');
                compareTime = compareTime.split(':');
                var currentDate = new Date();
                var currentTime = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
                currentTime = currentTime.split(':');
                var diff = compareTime[1] - currentTime[1] + ' minutes';
                if (diff == '0 minutes') diff = 'arriving';
                if (diff == '1 minutes') diff = '1 minute';

                return diff;
            }
        }
    }
})();

(function(){
    Helpers = {

        GetDistanceFromLatLonInKm: function(lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = Helpers.deg2rad(lat2 - lat1);  // deg2rad below
            var dLon = Helpers.deg2rad(lon2 - lon1);
            var a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(Helpers.deg2rad(lat1)) * Math.cos(Helpers.deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            return d;
        },

        deg2rad: function (deg) {
            return deg * (Math.PI / 180)
        }
    }
})();