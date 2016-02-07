angular.module('starter')
.run(['$httpBackend', function ($httpBackend) {
  function parseParameter(value) {
    var parameter = {};
    var parameters = value.split('&');
    var pair;
    _.forEach(parameters, function(item, index) {
      pair = item.split('=');
      parameter[pair[0]] = pair[1];
    });
    return parameter;
  }


  $httpBackend.whenGET(/templates/).passThrough();
  $httpBackend.whenGET(/data/).passThrough();
  $httpBackend.whenGET(/hotarea/).passThrough();
  $httpBackend.whenGET(/htlt/).passThrough();
  // $httpBackend.whenGET(/hotarea/).respond(function(method, url, data, headers) {
  //   return [ 200, [
  //     { code: '523501151', hotratio: 1.2 },
  //     { code: '523501152', hotratio: 1.3 },
  //     { code: '523501153', hotratio: 1.5 },
  //     { code: '523501154', hotratio: 1.5 },
  //   ] ];
  // });
  // $httpBackend.whenGET(/hotarea/).respond(function(method, url, data, headers) {
  //   var parameter, meshs;
  //   parameter = parseParameter(url.slice(url.indexOf('?') + 1));

  //   if (parameter.touristtype != null) {
  //     meshs = [];
  //     _.forEach(['523501'], function(item) {
  //       var i, j, meshCode;
  //       for (i = 0; i < 100; i++) {
  //         for (j = 1; j <= 4; j++) {
  //           meshCode = item + ('0' + i).slice(-2) + j;
  //           meshs.push({
  //             code: meshCode,
  //             hotratio: Math.random() + 0.5
  //           });
  //         }
  //       }
  //     });
  //     return [ 200, meshs ];
  //   }
  //   else {
  //     return [ 400, {}, {} ];
  //   }
  // });

}]);