// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1402234683438525', // your App ID
        'clientSecret'  : 'ff830f55455b16a652089d119ada1eac', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'soWXj1lYhPEh8XoxPgB8r9Xns',
        'consumerSecret'    : 'OPFtQOfDrekam7PPUClbgsKjyDggyeCe8eZ3nWZKaxZppCI72v',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '630403443890-sd77lmreqtp4ap04t1j707cvetdp268s.apps.googleusercontent.com',
        'clientSecret'  : 'ZAs5nWM48M25SJrYejMMeMeZ',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};
