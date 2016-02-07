angular.module('starter.services', [])
.service('commonDataService', ['$q', '$http', '$ionicLoading', '$log', function($q, $http, $ionicLoading, $log) {
  var self = this;

  function csv2Json(csv, parseLine) {
    var lines = csv.split('\n');
    var i, length;
    var items = []
    length = lines.length;
    for (i = 1; i < length; i++) {
      items.push(parseLine(lines[i]));
    }
    return items;
  }

  function coords2MeshCode(coords) {
    var latitudeArray = [0, 0, 0, 0], longitudeArray = [0, 0, 0, 0];
    var value, quotient, remainder;

    if (coords.latitude == '' || coords.longitude == '') {
      return '';
    }

    value = coords.latitude / 30.0 * 3600.0;
    quotient = Math.floor(value);
    latitudeArray[0] = Math.floor(quotient / 80);
    latitudeArray[1] = Math.floor((quotient % 80) / 10);
    latitudeArray[2] = (quotient % 80) % 10;
    latitudeArray[3] = (value - quotient) < 0.5? 0: 1;
    value = (coords.longitude - 100) / 45.0 * 3600.0;
    quotient = Math.floor(value);
    longitudeArray[0] = Math.floor(quotient / 80);
    longitudeArray[1] = Math.floor((quotient % 80) / 10);
    longitudeArray[2] = (quotient % 80) % 10;
    longitudeArray[3] = (value - quotient) < 0.5? 0: 1;
    return String(latitudeArray[0]) + String(longitudeArray[0]) + String(latitudeArray[1]) + String(longitudeArray[1]) + String(latitudeArray[2]) + String(longitudeArray[2]) + String(latitudeArray[3] * 2 + longitudeArray[3] + 1);
  }

  function getTourisms() {
    function parseLine(line) {
      var datas = line.split(',');
      return {
        name: datas[0],
        description: datas[7],
        address: datas[8] + datas[9],
        tel: datas[1],
        url: datas[2],
        coords: { latitude: datas[12], longitude: datas[13] },
        businessHour: datas[15],
        regularHoliday: datas[18],
        fee: datas[19]
      }
    }

    return $http({ method: 'GET', url: 'data/tourism_od2707.csv' })
      .then(
        function(response) {
          var spots;
          spots = csv2Json(response.data, parseLine);
          _.forEach(spots, function(spot) {
            spot.meshCode = coords2MeshCode(spot.coords);
            spot.type = self.type.spotType.tourism;
          });
          self.spot.tourisms = spots;
          _.forEach(self.spot.tourisms, function(spot) {
            if (self.meshCodeSpotsMap[spot.meshCode] == null) {
              self.meshCodeSpotsMap[spot.meshCode] = [];
            }
            self.meshCodeSpotsMap[spot.meshCode].push(spot);
          });
        });
  }

  function getNightViews() {
    function parseLine(line) {
      var datas = line.split(',');
      return {
        name: datas[1],
        description: datas[4],
        address: datas[2],
        urlImage: datas[6],
        coords: { latitude: datas[7], longitude: datas[8] }
      }
    }

    return $http({ method: 'GET', url: 'data/yakei_kobe_20141128.csv' })
      .then(
        function(response) {
          var spots;
          spots = csv2Json(response.data, parseLine);
          _.forEach(spots, function(spot) {
            spot.meshCode = coords2MeshCode(spot.coords);
            spot.type = self.type.spotType.nightView;
          });
          self.spot.nightViews = spots;
          _.forEach(self.spot.nightViews, function(spot) {
            if (self.meshCodeSpotsMap[spot.meshCode] == null) {
              self.meshCodeSpotsMap[spot.meshCode] = [];
            }
            self.meshCodeSpotsMap[spot.meshCode].push(spot);
          });
        });
  }

  function getFilmings() {
    function parseLine(line) {
      var datas = line.split(',');
      return {
        name: datas[2] + '：' + datas[8],
        description: datas[9],
        address: datas[5],
        coords: { latitude: datas[6], longitude: datas[7] }
      }
    }

    return $http({ method: 'GET', url: 'data/filming_location_kobe.csv' })
      .then(
        function(response) {
          var spots;
          spots = csv2Json(response.data, parseLine);
          _.forEach(spots, function(spot) {
            spot.meshCode = coords2MeshCode(spot.coords);
            spot.type = self.type.spotType.filming;
          });
          self.spot.filmings = spots;
          _.forEach(self.spot.filmings, function(spot) {
            if (self.meshCodeSpotsMap[spot.meshCode] == null) {
              self.meshCodeSpotsMap[spot.meshCode] = [];
            }
            self.meshCodeSpotsMap[spot.meshCode].push(spot);
          });
        });
  }

  this.type = {
    taskMode: {
      live: { value: 'live', label: 'ライブ' },
      trend: { value: 'trend', label: 'トレンド' }
    },

    viewMode: {
      map: { value: 'map', label: '地図' },
      list: { value: 'list', label: 'リスト' }
    },

    touristType: {
      all: {
        value: 'all',
        label: '全観光客',
        description: {
          live: '観光客が通常に比べて集まっているエリアを表示します',
          trend: '観光客が他エリアに比べて集まっているエリアを表示します',
        }
      },
      local: {
        value: 'local',
        label: '県内観光客',
        description: {
          live: '県内観光客が通常に比べて集まっているエリアを表示します',
          trend: '県内観光客が他エリアに比べて集まっているエリアを表示します',
        }
      },
      nonlocal: {
        value: 'nonlocal',
        label: '県外観光客',
        description: {
          live: '県外観光客が通常に比べて集まっているエリアを表示します',
          trend: '県外観光客が他エリアに比べて集まっているエリアを表示します',
        }
      },
      male: {
        value: 'male',
        label: '男性観光客',
        description: {
          live: '男性観光客が通常に比べて集まっているエリアを表示します',
          trend: '男性観光客が他エリアに比べて集まっているエリアを表示します',
        }
      },
      female: {
        value: 'female',
        label: '女性観光客',
        description: {
          live: '女性観光客が通常に比べて集まっているエリアを表示します',
          trend: '女性観光客が他エリアに比べて集まっているエリアを表示します',
        }
      },
      '20': {
        value: '20',
        label: '20代観光客',
        description: {
          live: '20代観光客が通常に比べて集まっているエリアを表示します',
          trend: '20代観光客が他エリアに比べて集まっているエリアを表示します',
        }
      },
      '30': {
        value: '30',
        label: '30代観光客',
        description: {
          live: '30代観光客が通常に比べて集まっているエリアを表示します',
          trend: '30代観光客が他エリアに比べて集まっているエリアを表示します',
        }
      },
      '40': {
        value: '40',
        label: '40代観光客',
        description: {
          live: '40代観光客が通常に比べて集まっているエリアを表示します',
          trend: '40代観光客が他エリアに比べて集まっているエリアを表示します',
        }
      },
      '50': {
        value: '50',
        label: '50代観光客',
        description: {
          live: '50代観光客が通常に比べて集まっているエリアを表示します',
          trend: '50代観光客が他エリアに比べて集まっているエリアを表示します',
        }
      },
      '60': {
        value: '60',
        label: '60代観光客',
        description: {
          live: '60代観光客が通常に比べて集まっているエリアを表示します',
          trend: '60代観光客が他エリアに比べて集まっているエリアを表示します',
        }
      },
      '70': {
        value: '70',
        label: '70代観光客',
        description: {
          live: '70代観光客が通常に比べて集まっているエリアを表示します',
          trend: '70代観光客が他エリアに比べて集まっているエリアを表示します',
        }
      }
    },

    spotType: {
      tourism: {
        value: 'tourism',
        label: '観光施設',
        urlIcon: 'img/tourism.png'
      },
      nightView: {
        value: 'nightView',
        label: '夜景',
        urlIcon: 'img/nightview.png'
      },
      filming: {
        value: 'filming',
        label: 'ロケ地',
        urlIcon: 'img/filming.png'
      }
    }
  };

  (function() {
    var meshs;

    function meshCode2MeshInfo(meshCode) {
      var latitude, longitude, i;

      latitude = Number(meshCode.slice(0, 2)) / 1.5 * 3600 + Number(meshCode.slice(4, 5)) * 5 * 60 + Number(meshCode.slice(6, 7)) * 30;
      longitude = (Number(meshCode.slice(2, 4)) + 100) * 3600 + Number(meshCode.slice(5, 6)) * 7.5 * 60 + Number(meshCode.slice(7, 8)) * 45;
      i = Number(meshCode.slice(8));
      if (i > 2) { latitude += 15; }
      if (i % 2 == 0) { longitude += 22.5; }

      return {
        code: meshCode,
        bounds: {
          sw: {
            latitude: latitude / 3600,
            longitude: longitude / 3600
          },
          ne: {
            latitude: (latitude + 15) / 3600,
            longitude: (longitude + 22.5) / 3600
          }
        }
      };
    }

    meshMap = {};
    _.forEach(['523511', '523512', '523500', '523501', '523502', '513570', '513571'], function(item) {
      var i, j, code;
      for (i = 0; i < 100; i++) {
        for (j = 1; j <= 4; j++) {
          code = item + ('0' + i).slice(-2) + j;
          meshMap[code] = meshCode2MeshInfo(code);
        }
      }
    });

    self.meshMap = meshMap;
  })();

  this.geoLocation = {
    getUserLocation: function() {
      var deferred = $q.defer();
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject, { timeout: 10000 });
      }
      else {
        deferred.reject(new Error('Your browser does not support Geo Location.'));
      }
      return deferred.promise;
    }
  };

  this.user = {};
  this.spot = {};
  this.meshCodeSpotsMap = {};
  this.promise = $q.all([getTourisms(), getNightViews(), getFilmings()]);

}]);