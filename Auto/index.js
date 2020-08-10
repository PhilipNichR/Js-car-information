
'use strict';
const path = require('path');
const express = require('express');
const http = require('http');

const app = express();

const portti = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const palvelin = http.createServer(app);

//apufunktio hekpottamaan palvelinvirheen lähettämistä
    const palvelinvirhe = res => res.status(500).render('virhesivu', {
        viesti: 'Palvelimen virhe'
    });

    const optiot = 
    require(path.join(__dirname, 'tietovarasto', 'autovarastoConfig.json'));

    const Autokanta =
    require(path.join(__dirname, 'tietovarasto', 'autovarasto.js'));

    const autot = new Autokanta(optiot);

    const valikkopolku = path.join(__dirname, 'valikko.html');

    app.set('view engine','ejs');
    app.set('views', path.join(__dirname, 'sivumallit'));

    //julkiset resurssit käyttöön resurssit-kansion alta
    //kansiot resurssit ei merkitä linkanttavaan polkuun.
    //siis esimerkiksi polku EI ole /resurssit/tyylit/tyylit.css
    //vaan polku on /tyylit/tyylit.css
    app.use(express.static(path.join(__dirname, 'resurssit')));
    //otetaan lomaketiedon muunto automaattisesti käyttöön.
    //Näin ei tarvitse erikseen lisätä jokaiseen polkuun
    app.use(express.urlencoded({ extended: false}));
    //lähettää valikon selaimeen
    app.get('/', (req, res) => res.sendFile(valikkopolku));


    //hakee autovarastosta kaikki autot ja lägettää ne selaimeen
    app.get('/kaikki', async (req, res) =>{
        try{
            const tulos=await autot.haeKaikki();
            res.render('haeKaikki',{autot:tulos});
        }
        catch(virhe){
            res.render('virhesivu', { viesti: virhe.message });
        }
    });

    //lähettää hakulomakkeen seaimeen
    app.get('/hae', (req,res)=>{
        res.render('haeAuto', {
            paaotsikko:'Auton haku',
            otsikko:'Syötä autoId',
            toiminto:'/hae'
        });
    });
        //hakee hakulomakkeelle syötettyä autoId:tä vastaavan
        //auto-olion autovarastosta
        app.post('/hae', async (req,res)=>{
         if (!req.body) {
            palvelinvirhe(res);
        }
        else {
            try {
                const tulos = await autot.hae(req.body.autoId);
                if (tulos.viesti) {
                res.render('tilasivu', {
                paaotsikko: 'Hakutulos',
                otsikko: 'Viesti',
                viesti: tulos.viesti
            });
        } else {
                res.render('hakutulos', {
                auto: tulos
                });
            }
        } catch (virhe) {
                    res.render('virhesivu', {
                    viesti: virhe.message
                  });
              }
          }
        });

        //lähettää poistolomakkeen selaimeen
app.get('/poista', (req,res)=>{
        res.render('haeAuto', {
        paaotsikko:'Auton haku',
        otsikko:'Syötä autoId',
        toiminto:'/poista'
        });
    });
    //Käsitellään lomakkeelta tuleva tieto ja suoritetaan poisto
    app.post('/poista', async (req,res)=>{
        if (!req.body) {
        palvelinvirhe(res);
        } else {
        try {
        const tulos = await autot.poista(req.body.autoId);
        res.render('tilasivu', {
        paaotsikko: 'Poiston tulos',
        otsikko: 'Viesti',
        viesti: tulos.viesti
        });
    }
    catch (virhe) {
            res.render('virhesivu', { viesti: virhe.message });
            }
        }
    });
    //lähettää lomakkeen selaimeen
    app.get('/lisaa', (req,res)=>{
        res.render('lomake', {
        paaotsikko:'Auton lisäys',
        otsikko:'Syötä tiedot',
        toiminto:'/lisaa',
        autoId:{arvo:'',vainluku:''},
        merkki:{arvo:'',vainluku:''},
        rekisteri:{arvo:'',vainluku:''},
        kuvapolku:{arvo:'',vainluku:''}
        });
    });

    //käsittelee lomakkeelta tulevan tiedon ja vie autovarastoon
app.post('/lisaa', async (req,res)=>{
        if (!req.body) {
        palvelinvirhe(res);
        } else {
        try {
        if (req.body.autoId && req.body.merkki) {
        const tulos = await autot.lisaa(req.body);
        res.render('tilasivu', {
        paaotsikko: 'Lisäyksen tulos',
        otsikko: 'Viesti',
        viesti: tulos.viesti
        });
    }
        else {
        res.redirect('/lisaa');
        }
        }
        catch (virhe) {
            res.render('virhesivu', { viesti: virhe.message });
            }
        }
    });
    //lähettää lomakkeen selaimeen
    app.get('/paivita', (req,res)=>{
        res.render('lomake', {
        paaotsikko:'Auton päivitys',
        otsikko:'Syötä tiedot',
        toiminto:'/paivita',
        autoId:{arvo:'',vainluku:''},
        merkki:{arvo:'',vainluku:'readonly'},
        rekisteri:{arvo:'',vainluku:'readonly'},
        kuvapolku:{arvo:'',vainluku:'readonly'}
        });
    });

    //hakee lomakkeelta tulevan autoId:n perusteella auton
//ja lähettää auton tiedoilla täytetyn lomakkeen selaimeen
app.post('/paivita',async (req, res) => {
        if (!req.body) {
        palvelinvirhe(res);
        } else {
        try {
        const tulos = await autot.hae(req.body.autoId);
        if (tulos.viesti) {
        res.render('tilasivu', {
        paaotsikko: 'Hakutulos',
        otsikko: 'Viesti',
        viesti: tulos.viesti
        });
    } else {
            res.render('lomake', {
            paaotsikko: 'Auton päivitys',
            otsikko: 'Syötä tiedot',
            toiminto: '/paivitatiedot',
            autoId: { arvo: tulos.autoId, vainluku: 'readonly' },
            merkki: { arvo: tulos.merkki, vainluku: '' },
            rekisteri: { arvo: tulos.rekisteri, vainluku: '' },
            kuvapolku: { arvo: tulos.kuvapolku, vainluku: '' }
            });
        }
    }
    catch (virhe) {
            res.render('virhesivu', { viesti: virhe.message });
            }
        }
    });
    //päivittää autovarastoon lomakkeelta tulevan
    //muokatun auto - olion
    app.post('/paivitatiedot', async (req,res)=>{
        if (!req.body) {
        palvelinvirhe(res);
        } else {
        try {
        const tulos = await autot.paivita(req.body);
        res.render('tilasivu', {
        paaotsikko: 'Päivityksen tulos',
        otsikko: 'Viesti',
        viesti: tulos.viesti
        });
    }
    catch (virhe) {
            res.render('virhesivu', { viesti: virhe.message });
            }
        }
    });

    palvelin.listen(portti, host, ()=>
    console.log(`Palvelin ${host} palvelee portissa ${portti}.`)
    );