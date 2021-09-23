sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../model/formatter",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Fragment, formatter, BusyIndicator, MessageBox) {
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
                BusyIndicator.show(0);
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
                        BusyIndicator.hide();
                    }).catch(error => {
                        console.error(error);
                        BusyIndicator.hide();
                    });
            },

            openCambiarInterlocutor: async function (event) {
                let oContext = event.getSource().getBindingContext("consultaPescaDescargada");
                let mareaSelected = oContext.getObject();
                mareaSelected.armador = null;
                this.getModel("consultaPescaDescargada").setProperty("/mareaSelected", mareaSelected);

                //Asignar la descripción del motivo de marea
                await fetch(`${mainUrlServices}dominios/Listar`, {
                    method: 'POST',
                    body: JSON.stringify({
                        "dominios": [
                            {
                                "domname": "ZCDMMA",
                                "status": "A"
                            }
                        ]
                    })
                })
                    .then(resp => resp.json())
                    .then(data => {
                        const dominio = data.data.find(d => d.dominio == "ZCDMMA");
                        const descripcionMarea = dominio.data.find(d => d.id == mareaSelected.CDMMA).descripcion;
                        mareaSelected.descMotivoMarea = descripcionMarea;
                    });


                // Abrir dialog de cambiar interlocutor
                let oView = this.getView();

                if (!this.cambiarInterlocutorDialog) {
                    this.cambiarInterlocutorDialog = await Fragment.load({
                        name: 'com.tasa.consultapescadescargada.view.CambiarInterlocutor',
                        controller: this
                    }).then(dialog => {
                        oView.addDependent(dialog);
                        dialog.open();
                        return dialog;
                    });
                }
                this.cambiarInterlocutorDialog.open();
            },
            cambiarInterlocutor: function (event) {
                let mareaSelected = this.getModel("consultaPescaDescargada").getProperty("/mareaSelected");
                let armador = mareaSelected.armador;
                console.log(armador)

                const body = {
                    p_user: 'FGARCIA',
                    p_nrmar: mareaSelected.NRMAR.toString(),
                    p_lifnr: armador
                };

                console.log(body);


                fetch(`${mainUrlServices}reportepesca/AgregarInterlocutor`, {
                    method: 'POST',
                    body: JSON.stringify(body)
                })
                    .then(resp => resp.json())
                    .then(data => {
                        this.cambiarInterlocutorDialog.close();
                        MessageBox.success("La marea fue editada correctamente");
                    }).catch(error => console.error(error));
            },
            closeDialog: function (event) {
                this.cambiarInterlocutorDialog.close();
            }
        });
    });
