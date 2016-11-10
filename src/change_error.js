/**
 * Error with the change
 */
function ChangeError(msg) {
     this.name = "ChangeError"
     this.message = msg
}
ChangeError.prototype = Error.prototype;


module.exports = ChangeError
