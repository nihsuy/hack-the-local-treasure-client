angular.module('starter.controllers', [])
.controller('HomeCtrl', ['$scope', '$resource', '$timeout', '$ionicModal', '$ionicScrollDelegate', '$log', 'commonDataService', 'uiGmapIsReady', function($scope, $resource, $timeout, $ionicModal, $ionicScrollDelegate, $log, commonDataService, uiGmapIsReady) {
  console.log(commonDataService);

  var map, infoDisplayed, i;
  var markerDummy;
  var mode = 'user';
//  var mode = 'admin';
  var resourceMap = (function() {
    var urlBase = 'http://localhost:9002';
    return {
      live: $resource(urlBase + '/htlt/temporal'),
      trend: $resource(urlBase + '/htlt/spacial'),
    }
  })();

  function setTaskMode(taskMode) {
    $scope.status.taskMode = taskMode.value;
//    $scope.title = ($scope.status.taskMode == commonDataService.type.taskMode.live.value? '現在のホットエリア': '過去の1ヶ月間のホットエリア');

    console.log($scope.status);
    updateMesh(map, $scope.status);
  }

  function setViewMode(viewMode) {
    $scope.status.viewMode = viewMode.value;
    $ionicScrollDelegate.freezeScroll($scope.status.viewMode == commonDataService.type.viewMode.map.value);

    console.log($scope.status);
  }

  function setTouristType(touristType) {
    if (_.isEqual($scope.status.touristType, touristType.value)) {
      return;
    }

    $scope.status.touristType = touristType.value;

    console.log($scope.status);
    $scope.title = commonDataService.type.touristType[$scope.status.touristType].label + 'の注目エリア';
    updateMesh(map, $scope.status);
  }

  function setSpotType(spotTypes) {
    var status = {}
    _.forEach($scope.spotTypes, function(type) {
      status[type.value] = false;
    });
    _.forEach(spotTypes, function(type) {
      status[type.value] = true;
    });
    if (_.isEqual($scope.status.spotType, status)) {
      return;
    }
    $scope.status.spotType = status;

    console.log($scope.status);
    drawMarker(map, commonDataService.user, commonDataService.spot);
  }

  function showModalSetting($scope) {
    if ($scope.modalSetting == null) {
      $ionicModal.fromTemplateUrl('templates/setting.html', {
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false,
        hardwareBackButtonClose: true
      })
        .then(function(modal) {
          $scope.modalSetting = modal;
          $scope.modalSetting.show();
        });
    }
    else {
      $scope.modalSetting.show();
    }
  }

  function updateLayout() {
    var nodes, style, height;
    nodes = document.getElementsByTagName('ion-content');
    style = window.getComputedStyle(nodes[0], null);
    height = style.getPropertyValue('height').replace('px', '');
    nodes = document.getElementsByClassName('angular-google-map-container');
    nodes[0].style.height = height + 'px';
  }

  function updateMesh(map, status) {
    if (_.difference(['taskMode', 'viewMode', 'touristType'], _.keys(status)).length > 0) {
      return;
    }

    drawMesh(map, []);
    resourceMap[status.taskMode].query({ touristtype: status.touristType }).$promise
      .then(
        function(data) {
          return _.map(data, function(item) {
            return _.assign({}, commonDataService.meshMap[item.code], { hotratio: item.hotratio });
          });
        },
        function(response) {
          // TODO
          console.log(response);
        })
      .then(
        function(meshs) {
          drawMesh(map, meshs);
//          updateList(meshs);
        });
  }

  function updateList(meshs) {
    var meshsSorted, spots;
    meshsSorted = _.sortBy(meshs, function(mesh) {
      return - mesh.hotratio;
    });
    console.log(meshsSorted);
    spots = [];
    _.forEach(meshsSorted, function(mesh) {
      var spotsLocal = commonDataService.meshCodeSpotsMap[mesh.code];
      if (spotsLocal != null) {
        _.forEach(spotsLocal, function(spotLocal) {
          spots.push(spotLocal);
        })
      }
    });
    $scope.spots = spots;
  }

  // マーカーを描画
  // 地図読み込み完了後に実行する
  var drawMarker = (function() {
    var markers = [];
    var iconMap;

    function createMarker(item, map, icon) {
      var marker, content, info;
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(item.coords.latitude, item.coords.longitude),
        icon: icon,
        map: map
      });
      // content = '<div style="margin-bottom: 4px;" >' + item.name + '</div>' + '<div><a href="#" onclick="hotarea.onClickInfoDetail()">詳細情報</a></div>';
      content = '<div style="font-weight: 700; margin-bottom: 4px;">' + item.name + '</div>';
      content += '<div style="margin-bottom: 4px;">' + item.address + '</div>';
      content += '<div style="margin-bottom: 4px;">' + item.description + '</div>';
      info = new google.maps.InfoWindow({
        content: content,
        position: new google.maps.LatLng(item.coords.latitude, item.coords.longitude),
        maxWidth: 250
      });
      marker.addListener('click', function() {
        if (infoDisplayed != null) {
          infoDisplayed.close();
        }
        info.open(map, marker);
        infoDisplayed = info;
      });
      return marker;
    }

    return function(map, user, spot) {
      if (iconMap == null) {
        iconMap = {};
        _.forEach(commonDataService.type.spotType, function(value, key) {
          iconMap[key] = {
            url: value.urlIcon,
            scaledSize: new google.maps.Size(22, 22)
          };
        });
        iconMap.user = {
          url: 'img/user.svg',
          scaledSize: new google.maps.Size(22, 22)
        };
      }

      _.forEach(markers, function(marker) {
        marker.setMap(null);
      });
      _.forEach($scope.spotTypes, function(type) {
        if ($scope.status.spotType[type.value]) {
          var spots, icon;
          switch (type) {
          case commonDataService.type.spotType.tourism:
            spots = spot.tourisms;
            break;
          case commonDataService.type.spotType.nightView:
            spots = spot.nightViews;
            break;
          case commonDataService.type.spotType.filming:
            spots = spot.filmings;
            break;
          }
          icon = iconMap[type.value];
          _.forEach(spots, function(item) {
            markers.push(createMarker(item, map, icon));
          });
        }
      });

      markerDummy = createMarker(
        {
          name: '須磨浦公園',
          address: '',
          description: '「data.KOBE」×NTTドコモ　アプリコンテスト用に追加したスポットです。',
          coords: { latitude: 34.63776291183616, longitude: 135.09982109069824 }
        },
        map,
        iconMap.tourism);
      markerDummy.setVisible(false);      
      markers.push(markerDummy);

      if (user.coords != null) {
        markers.push(createMarker(user, map, iconMap.user));
      }
    };
  })();

  var drawMesh = (function() {
    var rects = [];
    return function(map, meshs) {
      _.forEach(rects, function(rect) {
        rect.setMap(null);
      });
      _.forEach(meshs, function(mesh) {
        var color, opacity, rect;
        if (mesh.hotratio >= 1.0) {
          if ($scope.status.touristType == 'local') {
            if (mesh.hotratio >= 1.8) {
              return;
            }
          }
          color = '#ff0000';
          opacity = Math.floor((mesh.hotratio - 1.0) * 10) / 10;
          if (opacity > 0.5) {
            opacity = 0.5;
          }
          opacity *= 1.5;
        }
        else if (mesh.hotratio < 1.0) {
          color = '#0000ff';
          opacity = Math.floor((1.0 - mesh.hotratio) * 10) / 10;
          if (opacity > 0.5) {
            opacity = 0.5;
          }
        }
        else {
          return
        }
        rect  = new google.maps.Rectangle({
          // strokeColor: color,
          // strokeOpacity: 0.5,
          strokeWeight: 0,
          fillColor: color,
          fillOpacity: opacity,
          map: map,
          bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(mesh.bounds.sw.latitude, mesh.bounds.sw.longitude),
            new google.maps.LatLng(mesh.bounds.ne.latitude, mesh.bounds.ne.longitude))
          });
        google.maps.event.addListener(rect, 'click', function() {
          if (mode === 'user') return;
          this.setVisible(false);
        });
        rects.push(rect);
      });
    };
  })();

  $scope.commonDataService = commonDataService;
  $scope.titleDemo = (mode === 'user'? 'Hack The Local Treasure': 'Hack The Local Treasure（管理者モード）');
  $scope.touristTypes = _.map(['local', 'nonlocal', 'male', 'female', '20', '30', '40', '50', '60', '70'], function(item) {
    return commonDataService.type.touristType[item];
  });
  $scope.spotTypes = _.map(['tourism', 'nightView', 'filming'], function(item) {
    return commonDataService.type.spotType[item];
  });

  $scope.status = {};
  setTaskMode(commonDataService.type.taskMode.trend);
  setViewMode(commonDataService.type.viewMode.map);
  // $scope.spots = [];
  // for (i = 0; i < 20; i++) {
  //   $scope.spots.push({ name: 'spot' });
  // }

  $scope.onChangeTaskMode = function(tabName) {
    setTaskMode(tabName == 'live'? commonDataService.type.taskMode.live: commonDataService.type.taskMode.trend);
  };

  $scope.onChangeViewMode = function() {
    setViewMode($scope.status.viewMode == commonDataService.type.viewMode.map.value? commonDataService.type.viewMode.list: commonDataService.type.viewMode.map);
  };

  $scope.onSelectSettings = function() {
    $scope.status.touristTypeWork = _.clone($scope.status.touristType);
    $scope.status.spotTypeWork = _.clone($scope.status.spotType);
    showModalSetting($scope);
  };

  $scope.onOkSetting = function() {
    $scope.modalSetting.hide();
    setTouristType(commonDataService.type.touristType[$scope.status.touristTypeWork]);
    setSpotType(_.compact(_.map($scope.status.spotTypeWork, function(value, key) {
      if (value) {
        return commonDataService.type.spotType[key];
      }
      else {
        return null;
      }
    })));
  };

  $scope.onCancelSetting = function() {
    $scope.modalSetting.hide();
  };

  $scope.onClickInfoDetail = function() {
    console.log('click');
  };

  // 地図の情報ウィンドウのイベントを取得できないため，グローバル関数経由で関数呼び出し
  window.hotarea.onClickInfoDetail = (function() {
    return $scope.onClickInfoDetail;
  })();

  // デモ用のダミーマーカーの表示・非表示切り替え制御
  window.addEventListener('keyup', function(event) {
    console.log(event.keyCode);

    if (mode === 'user' && event.keyCode != 79) return;
    switch (event.keyCode) {
    case 32:
      markerDummy.setVisible(!markerDummy.getVisible());
      break;
    case 79:
      window.open('http://htlt-admin.s3-website-ap-northeast-1.amazonaws.com/');
      break;
    }
  });
//  updateLayout();

  // 地図を読み込み
  // ノードのサイズが計算された後に読み込むため，レイアウト更新後の処理としている
  $scope.map = {
    zoom: 14,
//    center: { latitude: 34.694404, longitude: 135.194614 },
    options: {
      panControl: false,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false
    }
  };
  uiGmapIsReady.promise(1).then(function(instances) {
    instances.forEach(function(inst) {
      map = inst.map;
      var uuid = map.uiGmap_id;
      var mapInstanceNumber = inst.instance;
    });

    // 地図の読み込みを待って設定
    setSpotType([commonDataService.type.spotType.tourism, commonDataService.type.spotType.nightView, commonDataService.type.spotType.filming]);
    setTouristType(commonDataService.type.touristType.local);
  });

  commonDataService.geoLocation.getUserLocation()
    .then(
      function(data) {
        commonDataService.user.coords = _.pick(data.coords, 'latitude', 'longitude');
        $scope.map.center = _.clone(commonDataService.user.coords);
      },
      function(result) {
        $log.error(result);
        if (commonDataService.user.coords == null) {
          commonDataService.user.coords = { latitude: 34.694404, longitude: 135.194614 };
          $scope.map.center = _.clone(commonDataService.user.coords);
        }
      });

  // タイミング依存のため，ウエイト後に実行
  $timeout(function() {
    $ionicScrollDelegate.freezeScroll($scope.status.viewMode == commonDataService.type.viewMode.map.value);
  }, 1000);
}]);