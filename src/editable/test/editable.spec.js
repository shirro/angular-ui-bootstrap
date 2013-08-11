describe('Given a ui.bootstrap.editable', function () {
    beforeEach(module('ui.bootstrap.editable', 'template/editable/editable.html', 'template/editable/select.html', 'template/editable/radio.html'));

    beforeEach(inject(function($compile, $rootScope, _$sniffer_) {
        scope = $rootScope;
        $sniffer = _$sniffer_;
        scope.editable = 'test';
    }));

    afterEach(function() {
        elementBody.remove();
    });

    var scope, element, elementBody, $sniffer;

    var findInput = function(triggerEl) {
        return triggerEl.find('input');
    };

    var findSelect = function(triggerEl) {
        return triggerEl.find('select');
    };

    var findSubmitButton = function(triggerEl) {
        return triggerEl.find('button').eq(1);
    };

    var findErrorButton = function(triggerEl) {
        return triggerEl.find('button').eq(0);
    };

    var triggerKeyDown = function (element, keyCode) {
        var inputEl = findInput(element);
        var e = $.Event("keydown");
        e.which = keyCode;
        inputEl.trigger(e);
    };

    var changeInputValueTo = function (element, value) {
        var inputEl = findInput(element);
        inputEl.val(value);
        inputEl.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
        scope.$digest();
    };

    var changeSelectValueTo = function (element, value) {
        var inputEl = findSelect(element);
        inputEl.val(value);
        inputEl.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
        scope.$digest();
    };

    describe('with default settings', function() {

        beforeEach(inject(function($compile, $rootScope, $sniffer) {
            elementBody = angular.element('<div></div>');
            element = $compile('<a href="" type="text" ng-model="$parent.editable" editable></a>')(scope);
            angular.element(elementBody).append(element);
            scope.$apply();
        }));

        it('the element should be visible by default', function () {
            expect(element.css('display')).not.toBe('none');
        });

        describe('when the element is clicked', function() {

            beforeEach(function() {
                element.click();
            });

            it ('should change the element css property `display` to "none"', function() {
                expect(element.css('display')).toBe('none');
            });

            it ('should have a visible submit button', function() {
                expect(findSubmitButton(elementBody).css('display')).not.toBe('none');
            });

            it ('should create 1 `text` input type', function() {
                expect(findInput(elementBody).length).toBe(1);
                expect(findInput(elementBody).attr('type')).toBe('text');
            });

            it ('should update the model when the input value changes', function() {
                changeInputValueTo(elementBody, 'modified');
                expect(scope.editable).toBe('modified');
            });      

            describe('and the submit button is clicked', function() {

                it('should change the element css property back to the original value', function() {
                    findSubmitButton(elementBody).click();
                    expect(element.css('display')).not.toBe('none');
                });

                it('should remove the input and button elements', function() {
                    findSubmitButton(elementBody).click();
                    expect(findInput(elementBody).length).toBe(0);
                    expect(findSubmitButton(elementBody).length).toBe(0);
                });

                it('should update the model to the new value', function() {
                    changeInputValueTo(elementBody, 'clickedSubmit');
                    findSubmitButton(elementBody).click();
                    expect(scope.editable).toBe('clickedSubmit');
                });

            }); 

        });
    });

    describe('with a validation property', function() {
        describe('of `required`', function() {
            beforeEach(inject(function($compile, $rootScope, $sniffer) {
                element = $compile('<a href="" type="text" ng-model="$parent.editable" editable required></a>')(scope);
                angular.element(elementBody).append(element);
                angular.element(document.body).append(elementBody);
                scope.$apply();
                element.click();
            }));

            describe('and and invalid value', function() {
                beforeEach(function() {
                    changeInputValueTo(elementBody, '');
                });

                it('should hide the submit button and show the error button when invalid', function() {
                    expect(findSubmitButton(elementBody).css('display')).toBe('none');
                    expect(findErrorButton(elementBody).css('display')).not.toBe('none');
                });

                it('should display errors in the error buttons tooltip', function() {
                    expect(findErrorButton(elementBody).attr('tooltip')).not.toBe(false);
                });

                it('should set the validation classes', function() {
                    expect(findInput(elementBody).hasClass('ng-invalid')).toBe(true);
                    expect(findInput(elementBody).hasClass('ng-invalid-required')).toBe(true);
                });
            });
        });

        describe ('of `min="3"` and a type of type of `number`', function() {
            beforeEach(inject(function($compile, $rootScope, $sniffer) {
                element = $compile('<a href="" type="number" ng-model="$parent.editable" editable min="3"></a>')(scope);
                angular.element(elementBody).append(element);
                scope.$apply();
                element.click();
            }));

            describe('and and invalid value', function() {
                beforeEach(function() {
                    changeInputValueTo(elementBody, '1');
                });

                it('should hide the submit button and show the error button when invalid', function() {
                    expect(findSubmitButton(elementBody).css('display')).toBe('none');
                    expect(findErrorButton(elementBody).css('display')).not.toBe('none');
                });

                it('should display errors in the error buttons tooltip', function() {
                    expect(findErrorButton(elementBody).attr('tooltip')).not.toBe(false);
                });

                it('should set the validation classes', function() {
                    expect(findInput(elementBody).hasClass('ng-invalid')).toBe(true);
                    expect(findInput(elementBody).hasClass('ng-invalid-min')).toBe(true);
                });
            });
        });

        describe ('of `min="3"` and a type of type of `number`', function() {
            beforeEach(inject(function($compile, $rootScope, $sniffer) {
                element = $compile('<a href="" type="number" ng-model="$parent.editable" editable max="10"></a>')(scope);
                angular.element(elementBody).append(element);
                scope.$apply();
                element.click();
            }));

            describe('and and invalid value', function() {
                beforeEach(function() {
                    changeInputValueTo(elementBody, '100');
                });

                it('should hide the submit button and show the error button when invalid', function() {
                    expect(findSubmitButton(elementBody).css('display')).toBe('none');
                    expect(findErrorButton(elementBody).css('display')).not.toBe('none');
                });

                it('should display errors in the error buttons tooltip', function() {
                    expect(findErrorButton(elementBody).attr('tooltip')).not.toBe(false);
                });

                it('should set the validation classes', function() {
                    expect(findInput(elementBody).hasClass('ng-invalid')).toBe(true);
                    expect(findInput(elementBody).hasClass('ng-invalid-max')).toBe(true);
                });
            });
        });

        describe ('of `ng-minlength="3"`', function() {
            beforeEach(inject(function($compile, $rootScope, $sniffer) {
                element = $compile('<a href="" type="text" ng-model="$parent.editable" editable ng-minlength="3"></a>')(scope);
                angular.element(elementBody).append(element);
                scope.$apply();
                element.click();
            }));

            describe('and and invalid value', function() {
                beforeEach(function() {
                    changeInputValueTo(elementBody, 'aa');
                });

                it('should hide the submit button and show the error button when invalid', function() {
                    expect(findSubmitButton(elementBody).css('display')).toBe('none');
                    expect(findErrorButton(elementBody).css('display')).not.toBe('none');
                });

                it('should display errors in the error buttons tooltip', function() {
                    expect(findErrorButton(elementBody).attr('tooltip')).not.toBe(false);
                });

                it('should set the validation classes', function() {
                    expect(findInput(elementBody).hasClass('ng-invalid')).toBe(true);
                    expect(findInput(elementBody).hasClass('ng-invalid-minlength')).toBe(true);
                });
            });
        });

        describe ('of `ng-maxlength="3"`', function() {
            beforeEach(inject(function($compile, $rootScope, $sniffer) {
                element = $compile('<a href="" type="text" ng-model="$parent.editable" editable ng-maxlength="3"></a>')(scope);
                angular.element(elementBody).append(element);
                scope.$apply();
                element.click();
            }));

            describe('and and invalid value', function() {
                beforeEach(function() {
                    changeInputValueTo(elementBody, 'aaaa');
                });

                it('should hide the submit button and show the error button when invalid', function() {
                    expect(findSubmitButton(elementBody).css('display')).toBe('none');
                    expect(findErrorButton(elementBody).css('display')).not.toBe('none');
                });

                it('should display errors in the error buttons tooltip', function() {
                    expect(findErrorButton(elementBody).attr('tooltip')).not.toBe(false);
                });

                it('should set the validation classes', function() {
                    expect(findInput(elementBody).hasClass('ng-invalid')).toBe(true);
                    expect(findInput(elementBody).hasClass('ng-invalid-maxlength')).toBe(true);
                });
            });
        });
    });

    describe('with an HTML5 validation type', function() {
        describe('of `url`', function() {
            beforeEach(inject(function($compile, $rootScope) {
                element = $compile('<a href="" type="url" ng-model="$parent.editable" editable></a>')(scope);
                angular.element(elementBody).append(element);
                angular.element(document.body).append(elementBody);
                scope.$apply();
                element.click();
            }));

            describe('and an invalid value', function() {
                beforeEach(function() {
                    changeInputValueTo(elementBody, 'test');
                });

                it('should hide the submit button and show the error button when invalid', function() {
                    expect(findSubmitButton(elementBody).css('display')).toBe('none');
                    expect(findErrorButton(elementBody).css('display')).not.toBe('none');
                });

                it('should display errors in the error buttons tooltip', function() {
                    expect(findErrorButton(elementBody).attr('tooltip')).not.toBe(false);
                });

                it('should set the validation classes', function() {
                    expect(findInput(elementBody).hasClass('ng-invalid')).toBe(true);
                    expect(findInput(elementBody).hasClass('ng-invalid-url')).toBe(true);
                });
            });
        });

        describe('of `email`', function() {
            beforeEach(inject(function($compile, $rootScope) {
                element = $compile('<a href="" type="email" ng-model="$parent.editable" editable></a>')(scope);
                angular.element(elementBody).append(element);
                angular.element(document.body).append(elementBody);
                scope.$apply();
                element.click();
            }));

            describe('and an invalid value', function() {
                beforeEach(function() {
                    changeInputValueTo(elementBody, 'test');
                });

                it('should hide the submit button and show the error button when invalid', function() {
                    expect(findSubmitButton(elementBody).css('display')).toBe('none');
                    expect(findErrorButton(elementBody).css('display')).not.toBe('none');
                });

                it('should display errors in the error buttons tooltip', function() {
                    expect(findErrorButton(elementBody).attr('tooltip')).not.toBe(false);
                });

                it('should set the validation classes', function() {
                    expect(findInput(elementBody).hasClass('ng-invalid')).toBe(true);
                    expect(findInput(elementBody).hasClass('ng-invalid-email')).toBe(true);
                });
            });
        });

        describe('of `number`', function() {
            beforeEach(inject(function($compile, $rootScope) {
                element = $compile('<a href="" type="number" ng-model="$parent.editable" editable></a>')(scope);
                angular.element(elementBody).append(element);
                angular.element(document.body).append(elementBody);
                scope.$apply();
                element.click();
            }));

            describe('and an invalid value', function() {
                beforeEach(function() {
                    changeInputValueTo(elementBody, 'asdf');
                });

                it('should hide the submit button and show the error button when invalid', function() {
                    expect(findSubmitButton(elementBody).css('display')).toBe('none');
                    expect(findErrorButton(elementBody).css('display')).not.toBe('none');
                });

                it('should display errors in the error buttons tooltip', function() {
                    expect(findErrorButton(elementBody).attr('tooltip')).not.toBe(false);
                });

                it('should set the validation classes', function() {
                    expect(findInput(elementBody).hasClass('ng-invalid')).toBe(true);
                    expect(findInput(elementBody).hasClass('ng-invalid-number')).toBe(true);
                });
            });
        });
    });

    describe('with a `select` type', function() {
        beforeEach(inject(function($compile, $rootScope) {
            scope.editable = 'Red';
            scope.selectSource = ['Red', 'Green', 'Blue'];
            element = $compile('<a href="" type="select" source="selectSource" source-options="value for value in source()" ng-model="$parent.editable" editable></a>')(scope);
            angular.element(elementBody).append(element);
            angular.element(document.body).append(elementBody);
            scope.$apply();
            element.click();
        }));

        it('should have 3 option values', function() {
            expect(findSelect(elementBody).children().length).toBe(3);
        });

        it('should update the model on selection change', function() {
            changeSelectValueTo(elementBody, 'Green');
            expect(scope.editable).toBe('Red');
        });
    });

    describe('with a `radio` type', function() {
        beforeEach(inject(function($compile, $rootScope) {
            scope.editable = 'Red';
            scope.selectSource = ['Red', 'Green', 'Blue'];
            elementBody = angular.element('<div></div>');
            element = $compile('<a href="" type="radio" source="selectSource" ng-model="$parent.editable" editable></a>')(scope);
            angular.element(elementBody).append(element);
            angular.element(document.body).append(elementBody);
            scope.$apply();
            element.click();
        }));

        it('should have 3 input radios', function() {
            expect(findInput(elementBody).length).toBe(3);
        });
    });
});