angular.module('wisdom.directives', [])

.directive('focusme', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            $timeout(function () {
                element[0].focus();
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.show(); //open keyboard manually
                }
            }, 350);
        }
    }
})

.directive('onloaded', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var fn = $parse(attrs.onloaded);
            elem.on('load', function (event) {
                scope.$apply(function() {
                    fn(scope, { $event: event });
                });
            });
        }
    }
})

.directive('httpSrc', ['$http', '$q', function ($http, $q) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            function revokeObjectURL() {
                if ($scope.objectURL) {
                    URL.revokeObjectURL($scope.objectURL);
                }
            }
            $scope.$watch('objectURL', function (objectURL) {
                elem.attr('src', objectURL);
            });
            $scope.$on('$destroy', function () {
                revokeObjectURL();
            });
            attrs.$observe('httpSrc', function (url) {
                revokeObjectURL();

                if(url && url.indexOf('data:') === 0) {
                    $scope.objectURL = url;
                } else if(url) {
                    $http.get(url, { responseType: 'arraybuffer' })
                        .then(function (response) {
                            var blob = new Blob(
                                [ response.data ], 
                                { type: response.headers('Content-Type') }
                            );
                            $scope.objectURL = URL.createObjectURL(blob);
                        });
                }
            });
        }
    }
}]);

