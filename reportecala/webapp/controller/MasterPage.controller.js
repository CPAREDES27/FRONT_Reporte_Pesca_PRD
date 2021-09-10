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

        const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'

        return BaseController.extend("com.tasa.reportecala.controller.MasterPage", {
            formatter: formatter,
            onInit: function () {
                console.log("prueba 1");
                let oViewModel,
                    iOriginalBusyDelay,
                    oTable = this.byId("tableReporteCalas");

                iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
                this._oTable = oTable;

                let numCalas = 0;

                this.loadReporteCalas();

                oViewModel = new JSONModel();
                oViewModel.setProperty("/numCalas", numCalas);

                this.setModel(oViewModel, "reporteCala");

                oTable.attachEventOnce("updateFinished", function () {
                    oViewModel.setModel("/tableBusyDelay", iOriginalBusyDelay);
                });

                this.loadData()
            },

            loadData: function () {
                let ubicaciones = null;
                let zdoZinprpDom = null;
                let zdoTipoMareaDom = null;

                const bodyDominio = {
                    "dominios": [
                        {
                            "domname": "ZINPRP",
                            "status": "A"
                        },
                        {
                            "domname": "ZDO_TIPOMAREA",
                            "status": "A"
                        }
                    ]
                }

                const bodyUbicaciones = {
                    "delimitador": "|",
                    "fields": [
                        "CDUPT", "DSUPT"

                    ],
                    "no_data": "",
                    "option": [
                        {
                            "wa": "ESREG = 'S'"
                        }
                    ],
                    "options": [
                        {
                            "cantidad": "",
                            "control": "",
                            "key": "",
                            "valueHigh": "",
                            "valueLow": ""
                        }
                    ],
                    "order": "",
                    "p_user": "FGARCIA",
                    "rowcount": 0,
                    "rowskips": 0,
                    "tabla": "ZFLUPT"
                };

                fetch(`${mainUrlServices}General/Read_Table/`,
                    {
                        method: 'POST',
                        body: JSON.stringify(bodyUbicaciones)
                    }).then(resp => resp.json())
                    .then(data => {
                        console.log(data.data)
                        ubicaciones = data.data;
                        this.getModel("reporteCala").setProperty("/ubicaciones", ubicaciones)
                    })
                    .catch(error => {
                        console.log(error)
                        return null
                    });

                fetch(`${mainUrlServices}dominios/Listar`,
                    {
                        method: 'POST',
                        body: JSON.stringify(bodyDominio)
                    })
                    .then(resp => resp.json()).then(data => {
                        console.log(data);
                        zdoZinprpDom = data.data.find(d => d.dominio == "ZINPRP").data;
                        zdoTipoMareaDom = data.data.find(d => d.dominio == "ZDO_TIPOMAREA").data;
                        this.getModel("reporteCala").setProperty("/zdoZinprpDom", zdoZinprpDom);
                        this.getModel("reporteCala").setProperty("/zdoTipoMareaDom", zdoTipoMareaDom);
                    }).catch(error => console.log(error)
                    );
            },
            loadReporteCalas: function (event) {
                let options = [];
                let commands = [];
                let centro = this.byId("txtCentro").getValue();
                let ubicacion = this.byId("cbUbicaciones").getSelectedKey();
                let embarcacion = this.byId("txtEmbarcacion").getValue();
                let indicadorPropiedad = this.byId("cbIndicadorPropiedad").getSelectedKey();
                let tipoMarea = this.byId("cbTipoMarea").getSelectedKey();
                let fechaInicioStart = this.byId("dpFechaInicioMareaStart").getValue();
                let fechaInicioEnd = this.byId("dpFechaInicioMareaEnd").getValue();
                let fechaFinStart = this.byId("dpFechaFinMareaStart").getValue();
                let fechaFinEnd = this.byId("dpFechaFinMareaEnd").getValue();
                let cantidad = this.byId("txtCantidad").getValue();

                if (centro) {
                    commands.push(`(WERKS LIKE '${centro}')`);
                }

                if (ubicacion) {
                    commands.push(`(CDUPT LIKE '${ubicacion}')`);
                }

                if (embarcacion) {
                    commands.push(`(CDEMB LIKE '${embarcacion}')`);
                }

                if (indicadorPropiedad) {
                    commands.push(`(INPRP LIKE '${indicadorPropiedad}')`);
                }

                if (tipoMarea) {
                    commands.push(`(CDMMA LIKE '${tipoMarea}')`);
                }

                if (fechaInicioStart || fechaInicioEnd) {
                    const isRange = fechaInicioStart && fechaInicioEnd;
                    const fecha = !isRange ? fechaInicioStart ? fechaInicioStart : fechaInicioEnd : null;
                    const operator = isRange ? `BETWEEN '${fechaInicioStart}' AND '${fechaInicioEnd}'` : `LIKE '${fecha}'`;

                    commands.push(`(FIMAR ${operator})`);
                }

                if (fechaFinStart || fechaFinEnd) {
                    const isRange = fechaFinStart && fechaFinEnd;
                    const fecha = !isRange ? fechaFinStart ? fechaFinStart : fechaFinEnd : null;
                    const operator = isRange ? `BETWEEN '${fechaFinStart}' AND '${fechaFinEnd}'` : `LIKE '${fecha}'`;

                    commands.push(`(FFMAR ${operator})`);
                }

                options = commands.map((c, i) => {
                    const option = {
                        wa: i > 0 ? `AND ${c}` : c
                    };

                    return option;
                })

                console.log(options);

                let body = {
                    "options": options,
                    "p_user": "FGARCIA",
                    "rowcount": cantidad
                };
                let request = fetch(`${mainUrlServices}reportepesca/ConsultarCalas`, {
                    method: 'POST',
                    body: JSON.stringify(body),
                })
                    .then((resp) => resp.json())
                    .then((data) => {
                        console.log(data);
                        this.getModel("reporteCala").setProperty("/items", data.s_cala);
                        this.getModel("reporteCala").setProperty("/numCalas", data.s_cala.length);
                    })
                    .catch((error) => {
                        console.error('Error found: ' + error);
                    });
            }
        });
    });