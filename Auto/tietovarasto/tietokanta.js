//tietokanta.js
'use strict';

const mariadb=require('mariadb');

module.exports = class Tietokanta{
    
    constructor(optiot) {
        this.optiot=optiot;
    }

    suoritaKysely(sql, parametrit,yhteys) {
        return new Promise(async (resolve, reject)=>{
            let onUusiYhteys=false;
            try{
                if(!yhteys) {
                    yhteys = await mariadb.createConnection(this.optiot);
                    onUusiYhteys=true;
                }
                let kyselynTulos = await yhteys.query(sql, parametrit);
                if(typeof kyselynTulos === 'undefined') {
                    reject(new Error('Kyselyvirhe'));
                }
                else if(typeof kyselynTulos.affectedRows === 'undefined') {
                    //select-kyselyn tulosjoukko
                    delete kyselynTulos.meta;
                    resolve({kyselynTulos, tulosjoukko: true});
                }
                else {
                    resolve({
                        kyselynTulos: {
                            muutetutRivitLkm: kyselynTulos.affectedRows,
                            lisattyNro: kyselynTulos.insertId,
                            status: kyselynTulos.warningStatus
                        },
                        tulosjoukko: false
                    });
                }
            }
            catch(virhe){
                reject(new Error('SQL-virhe:'+ virhe.message));
            }
            finally{
                if(yhteys && onUusiYhteys) yhteys.end();
            }
        });
    }
};