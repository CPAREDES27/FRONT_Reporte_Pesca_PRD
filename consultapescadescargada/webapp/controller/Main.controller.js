sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/formatter"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, Controller, JSONModel, formatter) {
        "use strict";

        const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';

        return BaseController.extend("com.tasa.consultapescadescargada.controller.Main", {
            formatter: formatter,
            onInit: function () {
                let oViewModel = new JSONModel({});

                this.setModel(oViewModel, "consultaPescaDescargada");

                this.loadData();
            },
            loadData: function () {
                let ubicacionesPlanta = [];
                let zinprpDom = [];
                let zdoTipoMareaDom = [];
                const bodyDominios = {
                    "dominios": [
                        {
                            "domname": "UBICPLANTA",
                            "status": "A"
                        },
                        {
                            "domname": "ZINPRP",
                            "status": "A"
                        },
                        {
                            "domname": "ZDO_TIPOMAREA",
                            "status": "A"
                        }
                    ]
                };

                fetch(`${mainUrlServices}dominios/Listar`,
                    {
                        method: 'POST',
                        body: JSON.stringify(bodyDominios)
                    })
                    .then(resp => resp.json()).then(data => {
                        console.log(data);
                        ubicacionesPlanta = data.data.find(d => d.dominio == "UBICPLANTA").data;
                        zinprpDom = data.data.find(d => d.dominio == "ZINPRP").data;
                        zdoTipoMareaDom = data.data.find(d => d.dominio == "ZDO_TIPOMAREA").data;
                        this.getModel("consultaPescaDescargada").setProperty("/ubicacionesPlanta", ubicacionesPlanta);
                        this.getModel("consultaPescaDescargada").setProperty("/zinprpDom", zinprpDom);
                        this.getModel("consultaPescaDescargada").setProperty("/zdoTipoMareaDom", zdoTipoMareaDom);
                    }).catch(error => console.log(error));
            },
            searchData: function (event) {
                let options = [];
                let commands = [];
                let planta = this.byId("planta").getValue();
                let ubicacionPlanta = this.byId("ubicacionPlanta").getSelectedKey();
                let embarcacion = this.byId("embarcacion").getValue();
                let indicadorPropiedad = this.byId("indicadorPropiedad").getSelectedKey();
                let tipoMarea = this.byId("tipoMarea").getSelectedKey();
                let fechaProdIni = this.byId("fechaProdIni").getValue();
                let fechaProdFin = this.byId("fechaProdFin").getValue();
                let numRegistros = this.byId("numRegistros").getValue();

                if (planta) {
                    commands.push(formatter.generateCommand("WERKS", planta));
                }

                if (ubicacionPlanta) {
                    commands.push(formatter.generateCommand("CDUPT", ubicacionPlanta));
                }

                if (embarcacion) {
                    commands.push(formatter.generateCommand("CDEMB", embarcacion));
                }

                if (indicadorPropiedad) {
                    commands.push(formatter.generateCommand("INPRP", indicadorPropiedad));
                }

                if (tipoMarea) {
                    commands.push(formatter.generateCommand("CDMMA", tipoMarea));
                }

                if (fechaProdIni || fechaProdFin) {
                    commands.push(formatter.generateCommand("FECCONMOV", fechaProdIni, fechaProdFin));
                }

                options = commands.map((c, i) => {
                    const option = {
                        data: i > 0 ? `AND ${c}` : c
                    };

                    return option;
                });

                const body = {
                    "p_options": options,
                    "p_rows": numRegistros,
                    "p_user": "FGARCIA"
                };

                fetch(`${mainUrlServices}reportepesca/ConsultarPescaDescargada`, {
                    method: 'POST',
                    body: JSON.stringify(body)
                })
                    .then(resp => resp.json())
                    .then(data => {
                        this.getModel("consultaPescaDescargada").setProperty("/items", data.str_des);
                    }).catch(error => console.error(error));
            }
        });
    });
