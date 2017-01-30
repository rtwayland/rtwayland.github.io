'use strict';

angular.module('app', ['ui.router', 'angularMoment', 'firebase']).config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $urlRouterProvider.when('/visualize-data/naps', '/visualize-data/naps/today');

    $stateProvider.state('home', {
        url: '/',
        templateUrl: './views/home.html'
    }).state('enter-data', {
        url: '/enter-data',
        templateUrl: './views/enter-data.html'
    }).state('visualize-data', {
        url: '/visualize-data',
        templateUrl: './views/visualize-data.html'
    })
    // Enter data children
    .state('enter-data.naps', {
        url: '/naps',
        templateUrl: './views/enter-data/naps.html',
        // resolve: {
        //     currentAuth: function(AuthService) {
        //         return AuthService.$requireSignIn();
        //     }
        // },
        controller: 'NapEntryController'
    }).state('enter-data.feedings', {
        url: '/feedings',
        templateUrl: './views/enter-data/feedings.html'
        // controller: 'NapController'
    }).state('enter-data.diapers', {
        url: '/diapers',
        templateUrl: './views/enter-data/diapers.html'
        // controller: 'NapController'
    }).state('enter-data.nighttime', {
        url: '/nighttime',
        templateUrl: './views/enter-data/nighttime.html'
        // controller: 'NapController'
    })
    // Visualize data children
    .state('visualize-data.naps', {
        url: '/naps',
        templateUrl: './views/visualize-data/naps.html',
        controller: 'NapDataController'
    }).state('visualize-data.feedings', {
        url: '/feedings',
        templateUrl: './views/visualize-data/feedings.html'
        // controller: 'NapController'
    }).state('visualize-data.diapers', {
        url: '/diapers',
        templateUrl: './views/visualize-data/diapers.html'
        // controller: 'NapController'
    }).state('visualize-data.nighttime', {
        url: '/nighttime',
        templateUrl: './views/visualize-data/nighttime.html'
        // controller: 'NapController'
    }).state('visualize-data.week-view', {
        url: '/week-view',
        templateUrl: './views/visualize-data/week-view.html'
        // controller: 'NapController'
    })
    // Naps children
    .state('visualize-data.naps.today', {
        url: '/today',
        templateUrl: './views/visualize-data/naps/nap-data-today.html'
    }).state('visualize-data.naps.all', {
        url: '/all',
        templateUrl: './views/visualize-data/naps/nap-data-all.html'
    }).state('visualize-data.naps.visual', {
        url: '/visual',
        templateUrl: './views/visualize-data/naps/nap-data-visual.html'
    });
    // .state('login', {
    //     url: '/login',
    //     templateUrl: './views/login.html',
    //     resolve: {
    //         currentAuth: function(AuthService) {
    //             // console.log('In resolve');
    //             return AuthService.$waitForSignIn();
    //         }
    //     },
    //     controller: 'LoginController'
    // })
});
"use strict";

var config = {
    apiKey: "AIzaSyCc908DwoS9J5SWu9eyVdzR5h4sXR7xpoI",
    authDomain: "infant-data-tracking.firebaseapp.com",
    databaseURL: "https://infant-data-tracking.firebaseio.com",
    storageBucket: "infant-data-tracking.appspot.com",
    messagingSenderId: "849309454705"
};
'use strict';

angular.module('app').controller('HomeController', function ($scope, $state, $timeout, AuthService, rootRef) {
    $scope.logout = function () {
        AuthService.$signOut();

        $timeout(function () {
            $state.go('login');
        }, 500);
    };
});
'use strict';

angular.module('app').controller('LoginController', function ($scope, $state, AuthService, currentAuth) {
    console.log(currentAuth);
    $scope.loggedIn = !!currentAuth;
    $scope.anonLogin = function () {
        AuthService.$signInAnonymously().then(function () {
            $state.go('home');
        }, function (error) {
            $scope.errorMessage = error.code;
        });
    };

    $scope.googleLogin = function () {
        AuthService.$signInWithPopup('google').then(function () {
            $state.go('home');
        }, function (error) {
            $scope.errorMessage = error.code;
        });
    };
});
'use strict';

angular.module('app').controller('NapDataController', function ($scope, moment, $interval, NapService, $firebaseObject, $firebaseArray) {

    $scope.today = getDateFilterString();

    /**************** GET NAP DATA ****************/
    $scope.getNapData = function () {
        NapService.getNaps().then(function (response) {
            // console.log('Nap Arr Data\n', response);
            $scope.naps = response;
        }, function (error) {
            console.log(error);
        });
    };

    /**************** DELETE NAP ****************/
    $scope.deleteNap = function (id) {
        console.log(id);
        NapService.deleteNap(id).then(function (response) {
            for (var i = 0; i < $scope.naps.length; i++) {
                if ($scope.naps[i].id === id) {
                    $scope.naps.splice(i, 1);
                    break;
                }
            }
        }, function () {
            console.log('An Error Occured.');
        });
    };
    /**************** GET DATE FILTER STRING ****************/
    function getDateFilterString() {
        var theDate = new Date();
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Oct', 'Sept', 'Nov', 'Dec'];
        var theMonth = months[theDate.getMonth()];
        var theDay = theDate.getDate().toString();
        var theYear = theDate.getFullYear().toString();

        return theMonth + ' ' + theDay + ' ' + theYear;
    }

    $scope.getNapData();
});
'use strict';

angular.module('app').controller('NapEntryController', function ($scope) {
    $scope.manualEntry = false;
});
'use strict';

angular.module('app').factory('AuthService', function ($firebaseAuth, rootRef) {
    return $firebaseAuth();
});
'use strict';

angular.module('app').factory('rootRef', function () {
  return firebase.database().ref();
});
'use strict';

angular.module('app').service('NapService', function ($firebaseObject, $firebaseArray, $q, moment) {
    var root = firebase.database().ref('data');
    var naps = root.child('naps');
    var napData = $firebaseObject(naps);

    /***************** GET NAPS *****************/
    this.getNaps = function () {
        var defer = $q.defer();
        var dataArray = $firebaseArray(naps.child('data'));
        dataArray.$loaded().then(function () {
            var newArray = [];
            for (var i = 0; i < dataArray.length; i++) {
                var obj = {
                    duration: convertMsToMin(dataArray[i].duration),
                    timestamp: new Date(Date.parse(dataArray[i].timestamp)),
                    id: dataArray[i].$id
                };
                newArray.push(obj);
            }
            defer.resolve(newArray);
        }).catch(function (err) {
            console.log(err);
        });

        return defer.promise;
    };

    /***************** DELETE NAP *****************/
    this.deleteNap = function (id) {
        var defer = $q.defer();
        var dataArray = $firebaseArray(naps.child('data'));
        dataArray.$loaded().then(function () {
            var rec = dataArray.$getRecord(id);
            dataArray.$remove(rec).then(function () {
                defer.resolve('deleted');
                console.log('Resolved');
            });
        }).catch(function (err) {
            console.log(err);
        });

        return defer.promise;
    };

    /***************** SUBMIT TIME *****************/
    this.submitTime = function (entryObj) {
        var defer = $q.defer();

        napData.$loaded().then(function () {
            if (napData.data) {
                var dataArray = $firebaseArray(naps.child('data'));
                dataArray.$loaded().then(function () {
                    dataArray.$add(entryObj).then(function (ref) {
                        defer.resolve(ref);
                    });
                }).catch(function (err) {
                    console.log(err);
                });
            } else {
                console.log('Naps obj not created');
                napData.data = [];
                napData.data.push(entryObj);
                napData.$save().then(function (ref) {
                    defer.resolve(ref);
                });
            }
        }).catch(function (err) {
            console.error(err);
        });

        return defer.promise;
    };

    function convertMsToMin(ms) {
        var duration = moment.duration(ms);
        var hours = duration.hours();
        var minutes = duration.minutes();
        var seconds = duration.seconds();

        if (hours && minutes) {
            return hours + ' hr ' + minutes + ' min';
        } else if (hours) {
            return hours + ' hr';
        } else if (minutes) {
            return minutes + ' min';
        } else {
            return seconds + ' sec';
        }
    }
});
'use strict';

angular.module('app').directive('contenteditable', [function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function link(scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                // element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
                element.html(ngModel.$viewValue);
            };

            // Listen for change events to enable binding
            element.on('blur change', function () {
                scope.$evalAsync(function () {
                    ngModel.$setViewValue(element.html());
                });
            });
        }
    };
}]);
'use strict';

angular.module('app').directive('basicTimer', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/directives/basic-timer/basic-timer.html',
        scope: {
            // name: '@'
        },
        link: function link($scope, elem, attrs) {
            setInterval(function () {
                $scope.getTimes();
                $('#basic-timer .hours').text($scope.hours);
                $('#basic-timer .minutes').text($scope.minutes);
                $('#basic-timer .seconds').text($scope.seconds);
            }, 100);
        },
        controller: function controller($scope, moment, $interval, NapService) {
            $scope.timerInitiated = false;
            $scope.timerRunning = false;
            $scope.timerStopped = true;
            var timeElapsed = 0;
            var totalTime = 0;
            var beginning;
            var stop = null;

            /************* START *************/
            $scope.startTimer = function () {
                $scope.timerInitiated = true;
                $scope.timerRunning = true;
                $scope.timerStopped = false;
                if (!stop) {
                    beginning = new Date();
                    $scope.dateStamp = beginning;
                    stop = $interval(function () {
                        var now = new Date();
                        timeElapsed = now.getTime() - beginning.getTime();
                    }, 50);
                }
            };

            /************* STOP *************/
            $scope.stopTimer = function () {
                $scope.timerRunning = false;
                $scope.timerStopped = true;
                if (stop) {
                    $interval.cancel(stop);
                    stop = null;
                    totalTime += timeElapsed;
                    timeElapsed = 0;
                }
            };

            /************* CANCEL *************/
            $scope.cancelTimer = function () {
                timeElapsed = 0;
                totalTime = 0;
                $scope.timerInitiated = false;
                $scope.timerRunning = false;
                $scope.timerStopped = true;
            };
            /************* GET TOTAL TIME *************/
            var getTotalTime = function getTotalTime() {
                return totalTime + timeElapsed;
            };
            /************* GET TIMES (for view display) *************/
            $scope.getTimes = function () {
                var ms = getTotalTime();
                var temp = moment.duration(ms);
                $scope.hours = temp.hours();
                $scope.minutes = temp.minutes();
                $scope.seconds = temp.seconds();
            };

            /************* SUBMIT TIME *************/
            $scope.submitTime = function () {
                var entryObj = {
                    duration: getTotalTime(),
                    timestamp: $scope.dateStamp.toString()
                };

                NapService.submitTime(entryObj).then(function () {
                    $scope.cancelTimer();
                });
            };

            // End of controller
        }
        // End of return
    };
    // End of directive
});
'use strict';

angular.module('app').directive('d3CirclePack', function () {
    return {
        restrict: '',
        template: '<svg id="graph-container" width="900" height="900"></svg>',
        scope: {},
        link: function link(scope, elem, attrs) {
            var svg = d3.select("svg"),
                margin = 20,
                diameter = +svg.attr("width"),
                g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

            var color = d3.scaleLinear().domain([-1, 5]).range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"]).interpolate(d3.interpolateHcl);

            var pack = d3.pack().size([diameter - margin, diameter - margin]).padding(2);

            d3.json("infant-data-packing.json", function (error, root) {
                if (error) throw error;

                root = d3.hierarchy(root).sum(function (d) {
                    return d.size;
                }).sort(function (a, b) {
                    return b.value - a.value;
                });

                var focus = root,
                    nodes = pack(root).descendants(),
                    view;

                var circle = g.selectAll("circle").data(nodes).enter().append("circle").attr("class", function (d) {
                    return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
                }).style("fill", function (d) {
                    return d.children ? color(d.depth) : null;
                }).on("click", function (d) {
                    if (focus !== d) zoom(d), d3.event.stopPropagation();
                });

                var text = g.selectAll("text").data(nodes).enter().append("text").attr("class", "label").style("fill-opacity", function (d) {
                    return d.parent === root ? 1 : 0;
                }).style("display", function (d) {
                    return d.parent === root ? "inline" : "none";
                }).text(function (d) {
                    return d.data.name;
                });

                var node = g.selectAll("circle,text");

                svg.style("background", color(-1)).on("click", function () {
                    zoom(root);
                });

                zoomTo([root.x, root.y, root.r * 2 + margin]);

                function zoom(d) {
                    var focus0 = focus;
                    focus = d;

                    var transition = d3.transition().duration(d3.event.altKey ? 7500 : 750).tween("zoom", function (d) {
                        var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                        return function (t) {
                            zoomTo(i(t));
                        };
                    });

                    transition.selectAll("text").filter(function (d) {
                        return d.parent === focus || this.style.display === "inline";
                    }).style("fill-opacity", function (d) {
                        return d.parent === focus ? 1 : 0;
                    }).on("start", function (d) {
                        if (d.parent === focus) this.style.display = "inline";
                    }).on("end", function (d) {
                        if (d.parent !== focus) this.style.display = "none";
                    });
                }

                function zoomTo(v) {
                    var k = diameter / v[2];
                    view = v;
                    node.attr("transform", function (d) {
                        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
                    });
                    circle.attr("r", function (d) {
                        return d.r * k;
                    });
                }
            });
        }
    };
});
'use strict';

angular.module('app').directive('d3PieChart', function () {
    return {
        restrict: 'E',
        template: '<svg width="900" height="500"></svg>',
        scope: {},
        link: function link(scope, elem, attrs) {
            var width = 960,
                height = 500,
                radius = Math.min(width, height) / 2;

            var color = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

            var arc = d3.arc().outerRadius(radius - 10).innerRadius(radius - 70);

            var pie = d3.pie().sort(null).value(function (d) {
                return d.population;
            });

            var svg = d3.select("svg").append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            d3.csv("data.csv", type, function (error, data) {
                if (error) throw error;

                var g = svg.selectAll(".arc").data(pie(data)).enter().append("g").attr("class", "arc");

                g.append("path").attr("d", arc).style("fill", function (d) {
                    return color(d.data.age);
                });

                g.append("text").attr("transform", function (d) {
                    return "translate(" + arc.centroid(d) + ")";
                }).attr("dy", ".35em").text(function (d) {
                    return d.data.age;
                });
            });

            function type(d) {
                d.population = +d.population;
                return d;
            }
        }
    };
});
'use strict';

angular.module('app').directive('formulaEntry', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/directives/formula-entry/formula-entry.html',
        scope: {},
        link: function link(scope, elem, attrs) {},
        controller: function controller($scope) {
            $scope.manualEntry = false;

            var obj = {
                amount: $scope.ozAmount,
                timestamp: $scope.timeFed
            };
        }
    };
});
'use strict';

angular.module('app').directive('enterDataNav', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/directives/enter-data-nav/enter-data-nav.html',
        scope: {},
        link: function link(scope, elem, attrs) {
            $('.navbar li').on('click', function (event) {
                // event.preventDefault();
                $(this).children('a').addClass('current');
                $(this).siblings('li').children('a').removeClass('current');
            });
        }
    };
});
'use strict';

angular.module('app').directive('manualTimeEntry', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/directives/manual-time-entry/manual-time-entry.html',
        scope: {},
        link: function link(scope, elem, attrs) {},
        controller: function controller($scope, moment, NapService) {
            $scope.fillerDate = new Date();
            $scope.fillerSTime = new Date('1970-01-01T20:00:00.000Z');
            $scope.fillerETime = new Date('1970-01-01T21:00:00.000Z');

            $scope.submitTime = function (valid) {
                if (valid) {
                    $scope.correctDate = combineDatesAndTime($scope.entryDate, $scope.entryStartTime);

                    var entryObj = {
                        duration: getTimeElapsed($scope.entryStartTime, $scope.entryEndTime),
                        timestamp: $scope.correctDate.toString()
                    };

                    NapService.submitTime(entryObj).then(function () {
                        $scope.entryDate = $scope.fillerDate;
                        $scope.entryStartTime = $scope.fillerSTime;
                        $scope.entryEndTime = $scope.fillerETime;
                    });
                }
            };

            function combineDatesAndTime(date, time) {
                var pos1 = date.toISOString().indexOf('T');
                var firstHalf = date.toISOString().slice(0, pos1);
                var pos2 = time.toISOString().indexOf('T');
                var secondHalf = time.toISOString().slice(pos2);
                var combinedString = firstHalf + secondHalf;

                return new Date(combinedString);
            }

            function getTimeElapsed(startTime, endTime) {
                if (startTime && endTime) {
                    var start = moment(startTime, "HH:mm:ss a");
                    var end = moment(endTime, "HH:mm:ss a");
                    var duration = moment.duration(end.diff(start));

                    return duration._milliseconds;
                }
            }
            // End of controller
        }
    };
});
'use strict';

angular.module('app').directive('visualizeDataNapsNav', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/directives/visualize-data-naps-nav/visualize-data-naps-nav.html',
        scope: {},
        link: function link(scope, elem, attrs) {
            $('nav li').on('click', function (event) {
                // event.preventDefault();
                $(this).children('a').addClass('current');
                $(this).siblings('li').children('a').removeClass('current');
            });
        }
    };
});
'use strict';

angular.module('app').directive('visualizeDataNav', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/directives/visualize-data-nav/visualize-data-nav.html',
        scope: {},
        link: function link(scope, elem, attrs) {
            $('.navbar li').on('click', function (event) {
                // event.preventDefault();
                $(this).children('a').addClass('current');
                $(this).siblings('li').children('a').removeClass('current');
            });
        }
    };
});
//# sourceMappingURL=bundle.js.map
