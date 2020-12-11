"use strict";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const CryptoJS = require("crypto-js");

exports.signup = (req, res, next) => {
    const emailUnsecure = req.body.email,
        regex_email = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+?\.[a-zA-Z0-9-]+$/;
    let emailSecure = "",
        message = "";

    if (regex_email.test(emailUnsecure) === true) {
        emailSecure = CryptoJS.AES.encrypt(emailUnsecure, 'secret key 123').toString();
        message = "L'utilisateur a bien été créé !";
    } else {
        message = "Veuillez saisir une adresse email valide !";
    }

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: emailSecure,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({message: message}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

exports.login = (req, res, next) => {
    const emailBody = req.body.email;
    var bytes  = CryptoJS.AES.decrypt(emailBody, 'secret key 123');
    var emailOriginal = bytes.toString(CryptoJS.enc.Utf8);
    User.findOne({email: emailOriginal})
        .then(user => {
            if (!user) {
                return res.status(401).json({error: "L'utilisateur n'a pas été trouvé !"});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({error: 'Le mot de passe est incorrect !'});
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            'RANDOM_TOKEN_SECRET',
                            {expiresIn: '1h'}
                        )
                    });
                })
                .catch(error => res.status(500).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};
