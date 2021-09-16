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

        return BaseController.extend("com.tasa.reportetdcchd.controller.Main", {
            onInit: function () {
                let oViewModel = new JSONModel();

                this.setModel(oViewModel, "reportetdcchd");


            },
            searchData: function () {
                let option = [];
                let commands = [];
                let marea = this.byId("marea").getValue();
                let planta = this.byId("planta").getValue();
                let embarcacion = this.byId("embarcacion").getValue();
                let fechaInicio = this.byId("fechaInicio").getValue();
                let fechaFin = this.byId("fechaFin").getValue();
                let numAciertos = this.byId("numAciertos").getValue();

                if (marea) {
                    commands.push(formatter.generateCommand("NRMAR", marea));
                }

                if (planta) {
                    commands.push(formatter.generateCommand("CDPTA", planta));
                }

                if (embarcacion) {
                    commands.push(formatter.generateCommand("CDEMB", embarcacion));
                }

                if (fechaInicio || fechaFin) {
                    commands.push(formatter.generateCommand("FIMAR", fechaInicio, fechaFin));
                }

                option = commands.map((c, i) => {
                    return {
                        wa: i > 0 ? `AND ${c}` : c
                    }
                });

                console.log(option)


                const body = {
                    option: option,
                    options: [],
                    p_user: 'FGARCIA',
                    rowcount: numAciertos
                }

                fetch(`${mainUrlServices}reportepesca/ConsultarMareas`, {
                    method: 'POST',
                    body: JSON.stringify(body)
                })
                    .then(resp => resp.json())
                    .then(data => {
                        this.getModel("reportetdcchd").setProperty("/items", data.s_marea);
                    });

            }
        });
    });
