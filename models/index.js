var mongoose = require('mongoose');
mongoose.connect( process.env.MONGOLAB_URI || "mongodb://localhost/ADAmap_V2")


mongoose.set('debug', true);


module.exports.User = require('./user');
module.exports.Issue = require('./issue');
module.exports.Wall = require('./wall');
module.exports.Comment = require('./comment');

// console.log(require('./user'));
// console.log(require('./issue'));
// console.log(require('./wall'));
// console.log(require('./comment'));
