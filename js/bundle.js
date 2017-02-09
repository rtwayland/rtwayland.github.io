'use strict';

angular.module('app', ['ngSanitize', 'ngMessages', 'ui.router']).run(function ($rootScope) {
    $rootScope.state = 1;
}).config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('home', {
        url: '/',
        templateUrl: './views/public/home.html',
        controller: function controller($scope, $rootScope) {
            $rootScope.state = 1;
        }
    }).state('properties', {
        url: '/properties',
        templateUrl: './views/public/properties.html'
        // controller: ''
    }).state('apply', {
        url: '/apply',
        templateUrl: './views/public/apply.html',
        controller: 'ApplicationCtrl'
    }).state('loginSignup', {
        url: '/login-signup',
        templateUrl: './views/public/login-signup.html'
        // controller: ''
    }).state('contact', {
        url: '/contact',
        templateUrl: './views/public/contact.html'
        // controller: ''
    }).state('resident', {
        url: '/resident',
        template: '<h1>Resident Page</h1>',
        controller: function controller($scope, $rootScope) {
            $rootScope.state = 2;
        }
    }).state('admin', {
        url: '/admin',
        template: '<h1>Admin Page</h1>',
        controller: function controller($scope, $rootScope) {
            $rootScope.state = 3;
        }
    });
});
'use strict';

angular.module('app').controller('ApplicationCtrl', function ($scope) {
  $scope.application = {};
  var user = {
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
    email: '',
    phone: '',
    ssn: '',
    driversLicence: ''
  };
  var currentResidence = {
    street: '',
    city: '',
    state: '',
    zip: ''
  };
});
'use strict';

angular.module('app').controller('NavCtrl', function ($scope, $rootScope) {
    var publicNavLinks = [{
        link: 'properties',
        name: 'Properties'
    }, {
        link: 'apply',
        name: 'Apply'
    }, {
        link: 'contact',
        name: 'Contact'
    }, {
        link: 'loginSignup',
        name: 'Residents'
    }];
    var residentNavLinks = [{
        link: 'maintenance',
        name: 'Maintenance Request'
    }, {
        link: 'rentPay',
        name: 'Pay Rent'
    }];
    var adminNavLinks = [{
        link: 'maintenanceRequests',
        name: 'Maintenance Requests'
    }, {
        link: 'tenents',
        name: 'Tenent Info'
    }, {
        link: 'propertyInfo',
        name: 'Property Info'
    }];

    function updateNav() {
        switch ($rootScope.state) {
            case 1:
                $scope.links = publicNavLinks;
                break;
            case 2:
                $scope.links = residentNavLinks;
                break;
            case 3:
                $scope.links = adminNavLinks;
                break;
            default:
                $scope.links = publicNavLinks;
                break;
        }
    }

    $rootScope.$watch('state', function (newVal, oldVal) {
        if (newVal != oldVal) {
            updateNav();
        }
    });

    updateNav();
});
'use strict';

angular.module('app').directive('semanticForm', function () {
    return {
        restrict: 'A',
        link: function link(scope, elem, attrs) {
            $('.dropdown').dropdown();
        }
    };
});
'use strict';

angular.module('app').directive('additionalOccupantFields', function () {
    return {
        restrict: 'E',
        templateUrl: './js/directives/additional-occupants/additional-occupant-fields.html',
        scope: {
            num: '='
        },
        link: function link(scope, elem, attrs) {
            scope.getNumOccupants = function () {
                return new Array(scope.num);
            };
        }
    };
});
'use strict';

angular.module('app').directive('addressInputs', function () {
    return {
        restrict: 'E',
        templateUrl: './js/directives/address-inputs/address-inputs.html',
        scope: {
            modelKey: '@',
            model: '='
        },
        link: function link(scope, elem, attrs) {}
    };
});
'use strict';

angular.module('app').directive('mainNav', function () {
    return {
        restrict: 'E',
        templateUrl: './js/directives/mainNav/main-nav.html',
        scope: {
            links: '='
        },
        link: function link(scope, elem, attrs) {
            scope.toggleMenu = function () {
                $('#nav-collapse').sidebar('toggle');
            };
        },
        controller: function controller($scope) {
            function getListItemWidth() {
                var numLinks = $scope.links.length;
                var width = 100 / numLinks;
                $scope.listItemWidth = width + '%';
            }

            $scope.$watch('links', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    getListItemWidth();
                }
            });

            getListItemWidth();
        }
    };
});
//# sourceMappingURL=bundle.js.map
