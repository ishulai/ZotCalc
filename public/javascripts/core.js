var app = angular.module("ZotCalc", ['ngMaterial']);

app.controller("ZotCalc", ["$scope", "$http", "$mdPanel", function($scope, $http, $mdPanel) {
	$scope.completed = [];

	app.getAPexams($scope);
	app.getGE($scope);
	app.getclasses($scope);

	$scope.years = [
		{
			number: 1,
			terms: [
				{
					name: "Summer",
					classes: ["WRITING 39B", "MATH 2D", "MATH 3D"]
				},
				{
					name: "Fall",
					classes: ["MATH 2E", "PHYSICS 7C", "PSYCH 46A", "I&C SCI 32"]
				},
				{
					name: "Winter",
					classes: ["WRITING 39C", "HISTORY 10", "PHYSICS 7D", "MATH 13"]
				},
				{
					name: "Spring",
					classes: ["PHY SCI 139W", "ARABIC 51", "MATH 9", "PHYSICS 7E"]
				}
			]
		},
		{
			number: 2,
			terms: [
				{
					name: "Summer",
					classes: ["MATH 120A", "MATH 121A", "MATH 140A"]
				},
				{
					name: "Fall",
					classes: ["MATH 147", "MATH 121B", "MATH 140B", "HISTORY 11"]
				},
				{
					name: "Winter",
					classes: ["MATH 120B", "COMPSCI 172B", "MATH 180A", "MATH 140C"]
				},
				{
					name: "Spring",
					classes: ["MATH 180B", "MATH 174A", "MATH 175", "MUSIC 78"]
				}
			]
		}
	];


	$scope.deselect = function(index) {
		$scope.subtractge(index);
		$scope.exams[index].active = false;
		$scope.exams[index].score = 0;
		$scope.completed = $scope.getcompleted();
	}

	$scope.select = function(index, score) {
		$scope.exams[index].active = true;
		$scope.exams[index].score = score;
		$scope.completed = $scope.getcompleted();
		$scope.addge(index, score);
	};

	$scope.addge = function(index, score) {
		if("ge" in $scope.exams[index]) {
			var s = "";
			for(var i = $scope.exams[index].score;i > 0;i--) {
				if($scope.getscore(i) in $scope.exams[index].ge) {
					s = $scope.getscore(i);
					break;
				} else if(i == 1) {
					return false;
				}
			}
			if($scope.exams[index].ge[s].constructor === Array) {
				for(var i = 0;i < $scope.exams[index].ge[s].length;i++) {
					$scope.ge[$scope.exams[index].ge[s][i].category].courses += $scope.exams[index].ge[s][i].courses;
				}
			} else {
				$scope.ge[$scope.exams[index].ge[s].category].courses += $scope.exams[index].ge[s].courses;
			}
		}
	}

	$scope.getscore = function(score) {
		var arr = ["zero", "one", "two", "three", "four", "five"];
		return arr[score];
	};

	$scope.getAPcredit = function(exam, arr) {
		if("credits" in exam) {
			var s = "";
			for(var i = exam.score;i > 0;i--) {
				if($scope.getscore(i) in exam.credits) {
					s = $scope.getscore(i);
					break;
				} else if(i == 1) {
					return [];
				}
			}
			if(exam.credits[s].constructor === Array) {
				var courses = [];
				for(var i = 0;i < exam.credits[s].length;i++) {
					var course = {
						name: exam.credits[s][i].course,
						units: exam.credits[s][i].units
					};
					if(arr.filter(function(item) {return item.name == exam.credits[s][i].course}).length == 0 || exam.credits[s][i].course == "elective") {
						courses.push(course);
					}
				}
				return courses;
			} else {
				var course = {
					name: exam.credits[s].course,
					units: exam.credits[s].units
				};
				if(arr.filter(function(item) {return item.name == exam.credits[s].course}).length == 0 || exam.credits[s].course == "elective") {
					return [course];
				}
			}
		}
		return [];
	};

	$scope.getcompleted = function() {
		var completed = [];
		var groups = [];
		var exams = $scope.exams;
		var cat = [];
		var group = "";
		for(var i = 0;i < exams.length;i++) {
			if(exams[i].active) {
				if("group" in exams[i] && exams[i].group == group) {
					cat.push(exams[i]);
				} else {
					cat.sort(function(a, b) {
						return b.weight - a.weight;
					});
					for(var k = 0;k < cat.length;k++) {
						var g = $scope.findgroup(groups, cat[k].group);
						if(g == -1) {
							var m = (cat[k].category == 1)?8:4;
							groups.push({
								name: cat[k].group,
								units: 0,
								max: m
							});
							g = groups.length - 1;
						}
						if(groups[g].units < groups[g].max) {
							completed.push.apply(completed, $scope.getAPcredit(cat[k], completed));
							if(groups[g].units + $scope.getAPcredit(cat[k], completed).units <= groups[g].max) {
								groups[g].units += $scope.getAPcredit(cat[k], completed).units;
							} else {
								groups[g].units = groups[g].max;
							}
						}
					}
					cat = [];
					group = "";
					if("group" in exams[i]) {
						group = exams[i].group;
						cat.push(exams[i]);
					} else {
						completed.push.apply(completed, $scope.getAPcredit(exams[i], completed));
					}
				}
			}
		}
		if(cat.length > 0) {
			cat.sort(function(a, b) {
				return b.weight - a.weight;
			});
			for(var k = 0;k < cat.length;k++) {
				var g = $scope.findgroup(groups, cat[k].group);
				if(g == -1) {
					var m = (cat[k].category == 1)?8:4;
					groups.push({
						name: cat[k].group,
						units: 0,
						max: m
					});
					g = groups.length - 1;
				}
				if(groups[g].units < groups[g].max) {
					completed.push.apply(completed, $scope.getAPcredit(cat[k], completed));
					if(groups[g].units + $scope.getAPcredit(cat[k], completed).units <= groups[g].max) {
						groups[g].units += $scope.getAPcredit(cat[k], completed).units;
					} else {
						groups[g].units = groups[g].max;
					}
				}
			}
		}
		return completed;
	}

	$scope.findgroup = function(groups, group) {
		for(var i = 0;i < groups.length;i++) {
			if(groups[i].name == group) {
				return i;
			}
		}
		return -1;
	}

	$scope.countunits = function() {
		var units = 0;
		var arr = $scope.getcompleted();
		for(var i = 0;i < arr.length;i++) {
			units += arr[i].units;
		}
		return units;
	};

	$scope.countelectives = function() {
		var units = 0;
		var arr = $scope.getcompleted();
		for(var i = 0;i < arr.length;i++) {
			if(arr[i].name == "elective") {
				units += arr[i].units;
			}
		}
		return units;
	};

	$scope.getclassbycode = function(code) {
		for(var i = 0;i < $scope.classes.length;i++) {
			if($scope.classes[i].course == code) {
				return $scope.classes[i];
			}
		}
		return false;
	}

	$scope.showclassdialog = function(code) {
		var tmpclass = $scope.getclassbycode(code);

		var position = $mdPanel.newPanelPosition()
			.absolute()
			.center();

		var config = {
			attachTo: angular.element(document.body),
			hasBackdrop: true,
			panelClass: 'demo-dialog-example',
			position: position,
			template: '\
<div role="dialog" aria-label="Eat me!" layout="column" layout-align="center center">\
  <md-toolbar>\
    <div class="md-toolbar-tools">\
      <h2>' + code + ' - ' + tmpclass.units + ' Units</h2>\
    </div>\
  </md-toolbar>\
  <div class="demo-dialog-content">\
    <p>' + $scope.displayclassdetails(code) + '<br></p>\
  </div>\
</div>',
			trapFocus: true,
			zIndex: 150,
			clickOutsideToClose: true,
			escapeToClose: true,
			focusOnOpen: true,
			disableParentScroll: true
		};

		$mdPanel.open(config);
	}

	$scope.displayclassdetails = function(code) {
		var re = "";
		var tmpclass = $scope.getclassbycode(code);
		re += tmpclass.description;
		if("grading" in tmpclass) {
			re += "<br><br>Grading option: " + tmpclass.grading;
		}
		if("repeat" in tmpclass) {
			re += "<br><br>Repeatability: " + tmpclass.repeat;
		}
		if("restriction" in tmpclass) {
			re += "<br><br>Restriction: " + tmpclass.restriction;
		}
		if("prerequisite" in tmpclass) {
			re += "<br><br>Prerequisite: " + tmpclass.prerequisite;
		}
		if("corequisite" in tmpclass) {
			re += "<br><br>Corequisite: " + tmpclass.corequisite;
		}
		if("same" in tmpclass) {
			re += "<br><br>Same as: " + tmpclass.same.join(", ");
		}
		if("overlap" in tmpclass) {
			re += "<br><br>Overlaps with: " + tmpclass.overlap.join(", ");
		}
		return re;
	}
}]);