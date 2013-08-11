A configurable component that turns any text into an editable form input. It supports AngularJS validation by default, and custom controls via templates.

### Notes on Use ###
The current template design for Bootstrap 2.3 requires that each form element span the width of its parent container. 
As such, using Editable in inline text, the input box will take 100% of it's parent containers div (usually results in 
an entire line being dedicated to the input box).

Editable is an isolate scope directive, and as such the `ngModel` attribute must bind to the $parent of the editable. So when 
assigning the ngModel to the editable you must use the form `ng-model="$parent.variable"` and when using the variable for display 
**inside** the editable container, you must use {{ $parent.variable }}. See the examples for more information.


### Attributes ###

All attributes must be set in the editable element, and can not be overwritten by the editable-options object.

 * `ng-model` <i class="icon-eye-open"></i>
 	:
 	The model value to be edited.

 * `active` <i class="icon-eye-open"></i>
 	:
 	An assignable value which stores the current state of a single editable object.

 * `type`
    : 
    Accepts any HTML type attribute (number, email) as well as the text, select and radio types.

 * `trigger`
 	_(Defaults: 'click')_ :
 	An event type to trigger edit mode used in conjunction with angular.element.bind(). 

 * `source`
 	:
 	An object or array that represents the data for a select or radio type.

 * `source-options`
 	:
 	An ng-options expression that is passed to a select element (or any element with the editableOptions directive). It must
 	*always* refer to `source()` as the "in" value.

 * `editable-options`
 	:
 	An object with the properties listed below.


### Settings ###

Settings are non-attribute options that can be 

 * `checked-label`
 	_(Defaults: 'label')_ :
 	The property name of the source object to use as a label for radio/checkboxes.

 * `checked-value`
 	_(Defaults: 'key')_ :
 	The property name of the source object to send back as the return value.

 * `template-urls`
    :
 	An object of template URLs used in conjunction with the `type` attribute listed above.

 * `validators` 
 	:
 	An object of validators in the form `validators[name]: errorMessage`. The default validators object contains values for all default AngularJS form validators.

 * `requiredConstants` 
 	:
 	An array of strings, each string representing a configuration constant for a complex control. The timepicker for example would be
    `requiredConstants: ['timepicker']`, which would attempt to inject the timepickerConfig object into the scope as scope.timepicker. Requiring a constant that doesn't exist will result in an javascript error.