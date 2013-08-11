angular.module('ui.bootstrap.editable', [])
    .constant('editableConfig', {
        validators: {
            required: 'This field is required.',
            min: 'A minimum value of {{ value }} is required.',
            max: 'A maximum value of {{ value }} is allowed.',
            ngMinlength: 'A minimum length of {{ value }} is required.',
            ngMaxlength: 'A maximum length of {{ value }} is allowed.',
            email: 'A valid email address is required.',
            url: 'A valid URL is required.',
            number: 'A valid number is required.',
            defaultError: 'This is not a valid value.'
        },
        templateUrls: {
            defaultTemplate: 'template/editable/editable.html',
            radio: 'template/editable/radio.html',
            select: 'template/editable/select.html'
        },
        requiredConstants: [],
        checkedLabel: 'label',
        checkedValue: 'key'
    })
    .controller('EditableController', ['$scope', '$element', '$attrs', '$interpolate', '$injector', 'editableConfig', function ($scope, $element, $attrs, $interpolate, $injector, editableConfig) {
        $scope.opts = {};

        // injects constants into the current scope
        // we introduce these first so they can get overwritten
        // by editableOptions
        if (angular.isDefined($scope.editableOptions())) {
            if ($scope.editableOptions().requiredConstants) {
                angular.forEach($scope.editableOptions().requiredConstants, function(serviceName, key) {
                    $scope.opts[serviceName] = $injector.get(serviceName + 'Config');
                });
            }
        }

        // write anything that's calculated in the model
        $scope.opts = angular.extend($scope.opts, $scope.editableOptions());

        // next we write the editableConfig constant
        $scope.opts = angular.extend($scope.opts, editableConfig);

        // we need the attributes for editable-validators/options as well
        $scope.attrs = $attrs;

        // ensure the compiledForm and form are removed
        $scope.$on('$destroy', function() {
            if (angular.isDefined($scope.compiledForm)) {
                $scope.cleanUp();
            }

            if (angular.isDefined($scope.form)) {
                $scope.form.remove();
            }
        });

    }])
    .directive('editable', ['$compile', '$http', '$templateCache', '$parse', function ($compile, $http, $templateCache, $parse) {
        return {
            require: 'ngModel',
            controller: 'EditableController',
            scope: {
                'source': '&',
                'editableOptions': '&',
                'sourceOptions': '@',
                'type': '@',
                'trigger': '@'
            },
            link: function postLink(scope, element, attrs, ctrl) {
                var template,
                    templateUrl,
                    errors,
                    getActive,
                    setActive;

                // wait for the trigger to be available and load the template
                attrs.$observe('trigger', function(value) {
                    if (!angular.isDefined(value)) {
                        scope.trigger = 'click';
                    }

                    getTemplate();
                });

                // active state, taken from the tabs directive
                if (attrs.editableActive) {
                    getActive = $parse(attrs.editableActive);
                    setActive = getActive.assign;

                    scope.$parent.$watch(getActive, function updateActive(value) {
                        scope.active = !! value;
                    });

                    scope.active = getActive(scope.$parent);
                } else {
                    setActive = getActive = angular.noop;
                }

                // watch the active state for progmatic control
                scope.$watch('active', function(active) {
                    setActive(scope.$parent, active);
                    if (active) {
                        showForm();
                    } else {
                        // on first run this won't do anything
                        scope.submitForm();
                    }
                });

                // changes from inside isolate scope -> outside isolate scope
                scope.$watch('model', function(val) {
                    // when the element is intially created, it's undefined
                    if (angular.isDefined(val)) {
                        ctrl.$setViewValue(val);
                    } else {
                        // get the original value
                        scope.originalValue = ctrl.$modelValue;
                    }
                });

                // changes from outside isolate scope -> isolate scope
                scope.$watch(attrs.ngModel, function(val) {
                    scope.model = ctrl.$viewValue;
                });

                // submits the form if it's valid, shows error otherwise
                scope.submitForm = function() {
                    if ((angular.isDefined(scope.editable_form) && scope.editable_form.$valid) || !scope.isValidated && ctrl.$valid) {
                        scope.cleanUp();
                        scope.active = false;
                    }
                };

                // cancels the form and sets the viewValue back to the originalValue
                scope.cancelForm = function() {
                    scope.model = scope.originalValue;
                    scope.cleanUp();
                };

                // remove the compiled form and show the element
                scope.cleanUp = function() {
                    if (angular.isDefined(scope.compiledForm)) {
                        scope.compiledForm.remove();
                    }
                    showElement();
                    scope.compiledForm = scope.form.clone();
                };

                // recompiles and shows the form
                var showForm = function() {
                    scope.cleanUp();

                    // clone/compile the form
                    compileForm();

                    // hide the element
                    hideElement();
                };

                var getTemplate = function() {
                    // get the template
                    if (angular.isDefined(scope.opts.templateUrls[scope.type])) {
                        templateUrl = scope.opts.templateUrls[scope.type];
                    } else {
                        templateUrl = scope.opts.templateUrls.defaultTemplate;
                    }

                    $http.get(templateUrl, {cache: $templateCache})
                        .success(function(result) {
                            template = result;
                            buildForm();

                            // only bind the element after the form has been built
                            element.bind(scope.trigger, function(e) {
                                e.preventDefault();

                                scope.active = true;
                                scope.$apply();
                            });

                        });
                };

                // clone and compile the form
                var compileForm = function() {
                    $compile(scope.compiledForm)(scope);
                    element.after(scope.compiledForm);
                };

                // hides the element
                var hideElement = function() {
                    element.css('display', 'none');
                };

                // shows the element
                var showElement = function() {
                    element.css('display', '');
                };

                // form must have an editable-input somewhere
                var buildForm = function() {
                    scope.form = angular.element(template);

                    // this is a "fix" to get the jasmine tests to pass
                    // jQuery doesn't allow for dynamic type changing of input attributes if
                    // the browser doesn't support it (<= IE 8).
                    // this shouldn't cause any issues since it will only run when the default
                    // template is called, but jasmine really shouldn't be firing a type error
                    if (templateUrl == scope.opts.templateUrls.defaultTemplate) {
                        scope.form.find('input').get(0).type = scope.type;
                    }
                };
            }
        };
    }])
    // Handles any input that requires validation (such as text);
    .directive('editableValidator', ['$interpolate', '$compile', function ($interpolate, $compile) {
        return {
            restrict: 'C',
            link: function postLink(scope, element, attrs) {
                // setup errors as false
                scope.errors = false;

                // watch wehther editable_form is valid or not
                scope.$watch(function() {
                    if (angular.isDefined(scope.editable_form)) {
                        return scope.editable_form.$valid;
                    }
                // show error on valid is true
                }, function(valid) {
                    if (!valid) {
                        showError();
                    }
                });

                // once type is loaded we know the element attributes are read
                attrs.$observe('type', function() {
                    // add the input attributes
                    addInputAttributes();

                    // ensure recompile won't forever loop
                    element.removeClass("editable-validator");

                    // avoid breaking the model
                    attrs.$set('ngModel', 'model');

                    // re-compile the element
                    $compile(element)(scope);
                });

                // adds the input attributes per scope.opts.validators
                var addInputAttributes = function() {
                    scope.isValidated = true;
                    angular.forEach(scope.attrs, function(value, key) {
                        if (angular.isDefined(scope.opts.validators[key])) {
                            element.attr(snakeCase(key), scope.attrs[key]);
                        }
                    });
                };

                // displays the errors
                // on scope namespace since editable input may need to call it
                var showError = function() {
                    // reset the errors
                    scope.errors = false;

                    var errorString = false;

                    // make sure the form field is defined
                    // also check if this particular component even has valid validations
                    if (angular.isDefined(scope.editable_form)) {
                        // loop through all editable_field errors
                        angular.forEach(scope.editable_form.$error, function(key, value) {

                            // if error is true
                            if (key) {

                                // most validation fields don't have ng prefixes. But since ngMinlength and ngMaxlength do
                                // we have to check.
                                var camelValue = camelCase('ng-' + value);
                                var validator = scope.opts.validators[value] || scope.opts.validators[camelValue] || false;

                                // if validator is not false
                                if(validator !== false) {
                                    // interpolate the value... this only works for min/max/minlength/maxlength or custom
                                    // it will return a null for any validator that doesn't have a {{ value }}
                                    var errorFunction = $interpolate(validator, true);

                                    // if a function is returned
                                    if (angular.isDefined(errorFunction) && angular.isFunction(errorFunction)) {
                                        // get the value for {{ value }} and replace it
                                        var replacementVal = scope.attrs[value] || scope.attrs[camelValue];
                                        errorString = errorFunction({ value: replacementVal });
                                    } else {
                                        // no interpolation required, just set string
                                        errorString = validator;
                                    }

                                } else {
                                    // we don't have a validator for this (how?) push the default error
                                    errorString = scope.opts.validators.defaultError;
                                }
                            }
                        });
                    }
                    scope.errors = !errorString ? '' : errorString;
                };

                // taken directly from Angular.
                // converts camelCase to snake-case
                var snakeCase = function(name, separator) {
                    separator = separator || '-';
                        return name.replace(/[A-Z]/g, function(letter, pos) {
                        return (pos ? separator : '') + letter.toLowerCase();
                    });
                };

                // taken directly from Angular.js
                // converts snake-case to camelCaseGET
                var camelCase = function(name) {
                  return name.
                    replace(/([\:\-\_]+(.))/g, function(_, separator, letter, offset) {
                      return offset ? letter.toUpperCase() : letter;
                    }).
                    replace(/^moz([A-Z])/, 'Moz$1');
                };
            }
        };
    }])
    .directive('editableOptions', ['$compile', function ($compile) {
        return {
            restrict: 'C',
            link: function postLink(scope, element, attrs) {

                // once type is loaded we know the element attributes are read
                attrs.$observe('ng-options', function() {
                    addOptions();

                    // ensure recompile won't forever loop
                    element.removeClass("editable-options");

                    // avoid breaking the model
                    attrs.$set('ngModel', 'model');

                    // re-compile the element
                    $compile(element)(scope);
                });

                // pass ng-options to from sourceOptions on to the .wg-editable-options element
                var addOptions = function() {
                    element.attr('ng-options', scope.sourceOptions);
                };
            }
        };
    }]);
