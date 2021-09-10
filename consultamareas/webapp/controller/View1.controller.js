sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, Controller, JSONModel) {
        "use strict";

        const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';

        return BaseController.extend("com.tasa.consultamareas.controller.View1", {
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
                let commands = [];
                let marea = this.byId("marea").getValue();
                let planta = this.byId("planta").getValue();
                let embarcacion = this.byId("embarcacion").getValue();
                let propiedad = this.byId("propiedad").getSelectedKey();
                let motivoIni = this.byId("motivoIni").getSelectedKey();
                let motivoFin = this.byId("motivoFin").getSelectedKey();
                let fechaInicio = this.byId("fechaInicio").getValue();
                let fechaFin = this.byId("fechaFin").getValue();
                let numRegistros = this.byId("numRegistros").getValue();

                if (marea) {
                    commands.push(`()`)
                }

                let body = {
                    "options": [
                        {
                            "wa": "(CDMMA LIKE '2')"
                        },
                        {
                            "wa": "AND (WERKS LIKE 'TCHI')"
                        },
                        {
                            "wa": "AND (FIMAR BETWEEN '20210101' AND '20210804')"
                        }
                    ],
                    "p_user": "FGARCIA",
                    "rowcount": "1"
                }

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
            }
        });
    });
