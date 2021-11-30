/* 'use strict';

const express = require('express');
const path = require('path')

module.exports = function (services){

    const fileOptions = {
        root: Path2D.join(__dirname, 'views'),
        dotfiles: 'deny'
    };
    
    function getHomePage(req, res){
        res.senfFile('home.html', fileOptions);
    }
    
    async function findInBGA(req, res){
        const query = req.query.searc;
        try{
            const gameRes = services.searchGame(query);
            sendFindResponse(200, ... , gameRes.game);
        } catch (err){
            switch(err.name){
                case 'MISSING_PARAM':
                    sendFindResponse(400, ...);
                    break;
                case 'NOT_FOUND':
                    sendFindResponse(404,...);
                    break;
                //por completar 
            }
        }
    }

    function sendFindResponse(errNumber, ){
        //por fazer
    }


    function getSearchPage(){
        //por fazer
    }

    const router = express.Router();

    router.get('/', getHomePage);
    router.get('/global/games', findInBGA);


    return router;
} */