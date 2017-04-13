module.exports = MemoUserDB;

var bcrypt = require("bcrypt");
var moment = require("moment");
var crypto = require("crypto");

var jsext = require("jsext");
var MemoDB = require("memodb");

//var WebPigeon = require("webpigeon");

MemoUserDB.extends( MemoDB );
function MemoUserDB (options) {
    var self = this;
    self.options = Object.assign({
        type : "user",
        schema : self.SCHEMA,
        schemadefault : self.SCHEMADEFAULT,
        badgekeys : self.BADGEKEYS,
        hashsize : 16,
        encryptsalt : 10,
    }, self.DEFAULTOPTIONS, options);
    //self.pigeon = self.options.pigeon || new WebPigeon();
    MemoDB.call(self, self.options);
}

MemoUserDB.ERROR = {
    MISSING_ID : "Missing user identification (email)",
    MISSING_PASSWORD : "Missing user password",
    EMAIL : "The email and id of an user is not the same",
    STATUS_VALUE : "Non valid value of enun STATUS",
    GENDER_VALUE : "Non valid value of enun GENDER",
    PROFILE_VALUE : "Non valid value of enun PROFILE",
    ENCRYPT : "Error during encryption",

    USER_WRONG_PASSWORD : "The password not match with registered password",
    USER_PARAMS : "Missing required params",
    USER_DATA : "Missing user data",
    USER_NOTFOUND : "Cant find the user",
    USER_UNKNOW : "Unknow user",
    USER_NOTLOGGED : "User not logged",
    USER_NOTAUTHORIZED : "User not authorized",
    USER_CONFIRMATION : "Waiting confirmation",
    USER_BLOCKED : "User blocked",
    USER_REMOVED : "User removed",
    USER_TOKEN : "User token doesn't match"
};

MemoUserDB.STATUS = {
    ON : "N",
    OFF : "F",
    OUT : "T",
    CONFIRM : "C",
    BLOCK : "B"
};

MemoUserDB.GENDER = {
    MALE : "M",
    FAMALE : "F"
};

MemoUserDB.PROFILE = {
    ADMIN : "A",   //backoffice administrator
    GUEST : "G",   //middleoffice guest
    CLIENT : "C"   //frontoffice client
};

MemoUserDB.prototype.SCHEMA = {
    id : String,
    email : String,
    password : String,
    token : String,
    label : String,
    name : String,
    birthday : Date,
    since : Date,
    status : String,
    gender : String,
    profile : String,
    lang : String,
    passport : Array,
    favorite : Array
};

MemoUserDB.prototype.BADGEKEYS = ["email","label","name","birthday","since","status","gender","profile","lang","passport","favorite"];

MemoUserDB.prototype.SCHEMADEFAULT = function() {
    var self = this;
    return {
        token : buildToken(self.options.hashsize),
        since : Date.now(),
        passport : [],
        favorite : [],
        status : MemoUserDB.STATUS.CONFIRM
    };
}

MemoUserDB.prototype.signup = function(user) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var badge = pickUserBadge(self, user);
        var isNewUser = true;
        var error = assertUser(user, isNewUser);
        if(error) return reject({error:error, user:badge});

        user.id = user.id || user.email;
        user.email = user.email || user.id;
        user.birthday = moment.utc(user.birthday, "YYYYMMDD");
        user.status = MemoUserDB.STATUS.CONFIRM;
        encryptPassword(self, user.password)
        .then(function(encryptedPassword) {
            if(!encryptedPassword) return reject({error:MemoUserDB.ERROR.ENCRYPT});

            user.password = encryptedPassword;
            return self.create(user);
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.signout = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        //TODO
    });
}

MemoUserDB.prototype.revive = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        //TODO
    });
}

MemoUserDB.prototype.login = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        //TODO
    });
}

MemoUserDB.prototype.logout = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        //TODO
    });
}

MemoUserDB.prototype.confirm = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        //TODO
    });
}

MemoUserDB.prototype.resetPassword = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        //TODO
    });
}

MemoUserDB.prototype.addPassport = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        //TODO
    });
}

MemoUserDB.prototype.remPassport = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        //TODO
    });

}

MemoUserDB.prototype.verifyPassport = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        //TODO
    });
}

MemoUserDB.prototype.badget = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        //TODO
    });
}



// PRIVATE

function buildToken (size) {
    return crypto.randomBytes(size).toString("hex");
}

function encryptPassword (self, password) {
    return new Promise(function (resolve, reject) {
        bcrypt.genSalt(self.options.encryptsalt, function(err, salt) {
            if (err) return reject(err);

            // hash the password using the new salt
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) return reject(err);

                resolve(hash);
            });
        });
    });
}

function pickUserBadge (self, user) {
    return user && user.pick(self.BADGEKEYS);
}

function verifyEnun (value, options) {
    if(!value || !options) return false;

    for(var op in options) {
        if(!options.hasOwnProperty(op)) continue;

        var option = options[op];
        if(option == value) return true;
    }
    return false;
}

function assertUser (user, isNewUser) {
    if(!user || (!user.email && !user.id)) return MemoUserDB.ERROR.MISSING_ID;
    if(isNewUser && !user.password) return MemoUserDB.ERROR.MISSING_PASSWORD;

    if(user.id && user.email && user.id != user.email) return MemoUserDB.ERROR.EMAIL;

    if(user.status && !verifyEnun(user.status, MemoUserDB.STATUS)) return MemoUserDB.ERROR.STATUS_VALUE;
    if(user.gender && !verifyEnun(user.gender, MemoUserDB.GENDER)) return MemoUserDB.ERROR.GENDER_VALUE;
    if(user.profile && !verifyEnun(user.profile, MemoUserDB.PROFILE)) return MemoUserDB.ERROR.PROFILE_VALUE;
}