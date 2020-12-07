"use strict";

const Sauce = require('../models/Sauce');
const fs = require('fs');

function regex_secure(entryUnsecure) {
    let entrySecure = "",
        regex_string = /^[a-zA-Zà-ÿ?!&%()'":,._\-\d\s]*$/gi;

    console.log('-------- regex_secure --------');
    console.log('-------- entryUnsecure --------');
    console.log(entryUnsecure);

    if (regex_string.test(entryUnsecure) === true) {
        entrySecure = entryUnsecure;
        console.log('-------- regex_string.test(entryUnsecure) === true --------');
        console.log('-------- entryUnsecure --------');
        console.log(entryUnsecure);
        console.log('-------- entrySecure --------');
        console.log(entrySecure);

        return entrySecure;
    } else {
        console.log('-------- regex_string.test(entryUnsecure) === false --------');
        console.log('-------- entryUnsecure --------');
        console.log(entryUnsecure);
        console.log('-------- entrySecure --------');
        console.log('No entrySecure');

        return entrySecure;
    }
}

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;

    const sauceName = sauceObject.name,
        sauceManufacturer = sauceObject.manufacturer,
        sauceDescription = sauceObject.description,
        sauceMainPepper = sauceObject.mainPepper;
    console.log('-------- createSauce req.body --------');
    console.log('-------- sauceName --------');
    console.log(sauceName);
    console.log('-------- sauceManufacturer --------');
    console.log(sauceManufacturer);
    console.log('-------- sauceDescription --------');
    console.log(sauceDescription);
    console.log('-------- sauceMainPepper --------');
    console.log(sauceMainPepper);
    let secureName = regex_secure(sauceName),
        secureManufacturer = regex_secure(sauceManufacturer),
        secureDescription = regex_secure(sauceDescription),
        secureMainPepper = regex_secure(sauceMainPepper);
    console.log('-------- createSauce secure --------');
    console.log('-------- secureName --------');
    console.log(secureName);
    console.log('-------- secureManufacturer --------');
    console.log(secureManufacturer);
    console.log('-------- secureDescription --------');
    console.log(secureDescription);
    console.log('-------- secureMainPepper --------');
    console.log(secureMainPepper);

    const sauce = new Sauce({
        ...sauceObject,
        name: secureName,
        manufacturer: secureManufacturer,
        description: secureDescription,
        mainPepper: secureMainPepper,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({message: "La sauce a bien été enregistrée !"}))
        .catch(error => res.status(400).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body};
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({message: 'La sauce a bien été modifiée !'}))
        .catch(error => res.status(400).json({error}));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'La sauce a bien été supprimée !'}))
                    .catch(error => res.status(400).json({error}));
            });
        })
        .catch(error => res.status(500).json({error}));
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.likeSauce = (req, res, next) => {
    const userId = req.body.userId,
        like = req.body.like;

    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            let usersLiked = sauce.usersLiked.indexOf(userId),
                usersDisliked = sauce.usersDisliked.indexOf(userId),
                message = "";

            if (like === 0 && usersLiked > -1) {
                sauce.likes--;
                sauce.usersLiked.splice(usersLiked, 1);
                message = "Le vote 'J'aime' a bien été annulé !";
            } else if (like === 0 && usersDisliked > -1) {
                sauce.dislikes--;
                sauce.usersDisliked.splice(usersDisliked, 1);
                message = "Le vote 'Je n'aime pas' a bien été annulé !";
            } else if (like === 1) {
                sauce.likes++;
                if (sauce.usersLiked.length > 0) {
                    sauce.usersLiked = [userId];
                } else {
                    sauce.usersLiked.push(userId);
                }
                message = "Le vote 'J'aime' a bien été pris en compte !";
            } else if (like === -1) {
                sauce.dislikes++;
                if (sauce.usersDisliked.length > 0) {
                    sauce.usersDisliked = [userId];
                } else {
                    sauce.usersDisliked.push(userId);
                }
                message = "Le vote 'Je n'aime pas' a bien été pris en compte !";
            }


            sauce.save()
                .then(() => res.status(201).json({message: message}))
                .catch(error => res.status(400).json({error}));

        });
};
