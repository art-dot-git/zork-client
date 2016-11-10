/**
 * Error with user input
 */
function InputError(msg) {
     this.name = "InputError"
     this.message = msg
}
InputError.prototype = Error.prototype;


module.exports = InputError
