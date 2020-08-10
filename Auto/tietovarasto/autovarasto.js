
'use strict';

    const Tietokanta = require('./tietokanta.js');

    const ohjelmavirhe = virhe => {
        if(virhe) console.log(virhe);
        return new Error('ohjelmavirhe');
    }

    const autontiedot = auto => [
        auto.autoId, auto.merkki, auto.rekisteri,
        auto.kuvapolku
    ];

    const autotiedotPaivitykseen = auto => [
        auto.merkki, auto.rekisteri,
        auto.kuvapolku, auto.autoId
    ];


    //Sql-lauseet
    const haeKaikkiSql='select autoId, merkki, rekisteri, kuvapolku from auto';
    const haeAutoSql='select autoId, merkki, rekisteri, kuvapolku from auto where autoId=?';
    const lisaaAutoSql='insert into auto(autoId, merkki, rekisteri, kuvapolku) values(?,?,?,?)';
    const poistaAutoSql='delete from auto where autoId=?';
    const paivitaAutoSql='update auto set merkki=?, rekisteri=?, kuvapolku=? where autoId=?'


    //Autokanta-luokka
    module.exports = class Autokanta {

        constructor(optiot){
            this.varasto=new Tietokanta(optiot);
        }

        //metodit
        //palauttaa lupauksen
        haeKaikki() {
            return new Promise(async (resolve, reject) => {
                try{
                    const tulos = 
                    await this.varasto.suoritaKysely(haeKaikkiSql);
                    if(tulos.tulosjoukko) {
                        resolve(tulos.kyselynTulos);
                    }
                    else{
                        reject(ohjelmavirhe());
                    }
                }
                catch(virhe) {
                    reject(ohjelmavirhe(virhe));
                }
            });
        }

        //palauttaa lupauksen
        hae(autoId) {
            return new Promise(async (resolve, reject)=>{
                try{
                    const tulos =
                     await this.varasto.suoritaKysely(haeAutoSql,[+autoId]);
                    if(tulos.tulosjoukko){
                        if(tulos.kyselynTulos.length>0) {
                            resolve(tulos.kyselynTulos[0]);
                        }
                        else {
                            resolve({
                                viesti:`Numerolla ${autoId} ei löytynyt autoa`
                            });
                        }
                    }
                    else {
                        reject(ohjelmavirhe());
                    }
                }
                catch(virhe){
                    reject(ohjelmavirhe(virhe));
                }
            });
        }

        
        
        //palauttaa lupauksen
        lisaa(auto) {
            return new Promise(async (resolve, reject)=> {
                try{
                    const hakutulos=
                    await this.varasto.suoritaKysely(haeAutoSql, [auto.autoId]);
                    if(hakutulos.kyselynTulos.length===0) {
                        const tulos=
                         await this.varasto.suoritaKysely(lisaaAutoSql, autontiedot(auto));
                        if(tulos.kyselynTulos.muutettuRivitLkm === 1){
                            resolve({
                                viesti:`Auto numerolla ${auto.autoId} lisättiin`
                            });
                        }
                        else {
                            resolve({viesti:'Autoa ei lisätty'});
                        }
                    }
                    else {
                        resolve({
                            viesti:`AutoId ${auto.autoId} oli jo käytössä`
                        });
                    }
                }
                catch(virhe) {
                    reject(ohjelmavirhe(virhe));
                }
            });
        }

        //palauttaa lupauksen
        poista(autoId) {
            return new Promise(async (resolve, reject)=>{
                try {
                    const tulos=
                    await this.varasto.suoritaKysely(poistaAutoSql, [+autoId]);
                    if(tulos.kyselynTulos.muutettuRivitLkm===0) {
                        resolve({ viesti: 'Antamallasi numerolla ei löytynyt autoa. Mitään ei poistettu.'});
                    }
                    else {
                        resolve({
                            viesti: `Auto numerolla ${autoId} poistettiin`
                        })
                    }
                }
                catch(virhe) {
                    reject(ohjelmavihrhe(virhe));
                }
            });
        }

        //palauttaa lupauksen
        paivita(auto) {
            return new Promise(async (resolve, reject)=>{
                try {
                    const tulos=
                    await this.varasto.suoritaKysely(paivitaAutoSql, autotiedotPaivitykseen(auto));
                    if(tulos.kyselynTulos.muutettuRivitLkm === 0) {
                        resolve({ viesti: 'Tietoja ei päivitetty'});
                    }
                    else {
                        resolve({
                            viesti:`Auton ${auto.autoId} tiedot päivitettiin`
                        });
                    }
                }
                catch(virhe) {
                    reject(ohjelmavirhe(virhe));
                }
            });
        }

    }