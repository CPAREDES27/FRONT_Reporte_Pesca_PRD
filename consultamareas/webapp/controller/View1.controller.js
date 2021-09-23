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

        return BaseController.extend("com.tasa.consultamareas.controller.View1", {
            formatter: formatter,
            onInit: function () {
                let oViewModel = new JSONModel({});

                this.setModel(oViewModel, "consultaMareas");
                this.loadData();

            },
            loadData: function () {
                let zinprpDom = [];
                let zcdmmaDom = [];
                const bodyDominios = {
                    "dominios": [
                        {
                            "domname": "ZINPRP",
                            "status": "A"
                        },
                        {
                            "domname": "ZCDMMA",
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
                        zinprpDom = data.data.find(d => d.dominio == "ZINPRP").data;
                        zcdmmaDom = data.data.find(d => d.dominio == "ZCDMMA").data;
                        this.getModel("consultaMareas").setProperty("/zinprpDom", zinprpDom);
                        this.getModel("consultaMareas").setProperty("/zcdmmaDom", zcdmmaDom);
                    }).catch(error => console.log(error)
                    );
            },
            searchData: function (event) {
                let options = [];
                let options2 = [];
                let commands = [];
                let mareaLow = parseInt(this.byId("mareaLow").getValue());
                let mareaHigh = parseInt(this.byId("mareaHigh").getValue());
                let plantaLow = this.byId("plantaLow").getValue();
                let plantaHigh = this.byId("plantaHigh").getValue();
                let embarcacionLow = this.byId("embarcacionLow").getValue();
                let embarcacionHigh = this.byId("embarcacionHigh").getValue();
                let propiedad = this.byId("propiedad").getSelectedKey();
                let motivoIni = this.byId("motivoIni").getSelectedKey();
                let motivoFin = this.byId("motivoFin").getSelectedKey();
                let fechaInicio = this.byId("fechaInicio").getValue();
                let fechaFin = this.byId("fechaFin").getValue();
                let numRegistros = this.byId("numRegistros").getValue();

                /*
                options2.push({
                    cantidad: "10",
                    control:"MULTIINPUT",
                    key:"NRMAR",
                    valueHigh: mareaHigh,
                    valueLow: mareaLow
                });

                options2.push({
                    cantidad: "10",
                    control:"MULTIINPUT",
                    key:"WERKS",
                    valueHigh: plantaHigh,
                    valueLow: plantaLow
                });

                options2.push({
                    cantidad: "10",
                    control:"MULTIINPUT",
                    key:"CDEMB",
                    valueHigh: embarcacionHigh,
                    valueLow: embarcacionLow
                });

                options2.push({
                    cantidad: "10",
                    control:"INPUT",
                    key:"INPRP",
                    valueHigh: propiedad,
                    valueLow: ""
                });

                options2.push({
                    cantidad: "10",
                    control:"MULTIINPUT",
                    key:"CDMMA",
                    valueHigh: motivoFin,
                    valueLow: motivoIni
                });

                options2.push({
                    cantidad: "10",
                    control:"MULTIINPUT",
                    key:"FIMAR",
                    valueHigh: fechaFin,
                    valueLow: fechaInicio
                });*/


                if ((mareaLow || mareaLow === 0) || (mareaHigh || mareaHigh === 0)) {
                    commands.push(formatter.generateCommand("NRMAR", mareaLow, mareaHigh));
                }

                if (motivoIni || motivoFin) {
                    commands.push(formatter.generateCommand("CDMMA", motivoIni, motivoFin));
                }

                if (plantaLow || plantaHigh) {
                    commands.push(formatter.generateCommand("WERKS", plantaLow, plantaHigh));
                }

                if (embarcacionLow || embarcacionHigh) {
                    commands.push(formatter.generateCommand("CDEMB", embarcacionLow, embarcacionHigh));
                }

                if (propiedad) {
                    commands.push(formatter.generateCommand("INPRP", propiedad));
                }

                if (fechaInicio || fechaFin) {
                    commands.push(formatter.generateCommand("FIMAR", fechaInicio, fechaFin));
                }

                options = commands.map((c, i) => {
                    const option = {
                        wa: i > 0 ? `AND ${c}` : c
                    };

                    return option;
                });

                console.log(options);
                console.log(numRegistros);

                let body = {
                    option: options,
                    options: [],
                    p_user: "FGARCIA",
                    rowcount: numRegistros
                };

                fetch(`${mainUrlServices}reportepesca/ConsultarMareas`, {
                    method: 'POST',
                    body: JSON.stringify(body)
                })
                    .then(resp => resp.json())
                    .then(data => {

                        console.log(data);

                        this.getModel("consultaMareas").setProperty("/items", data.s_marea);
                        this.getModel("consultaMareas").setProperty("/numCalas", data.s_marea.length);

                    })
                    .catch(error => console.error(error))
            },
            detalleMarea: function (event) {
                console.log(event);
            }
        });
    });
