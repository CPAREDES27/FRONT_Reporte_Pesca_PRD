sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/core/routing/History",
    "sap/ui/core/BusyIndicator",
    "../model/utilities"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,
        Controller,
        JSONModel,
        formatter,
        History,
        BusyIndicator,
        utilities) {
        "use strict";
        const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'; //utilities.getHostService();

        return BaseController.extend("com.tasa.reportetdcchd.controller.ReporteTDCCHR", {
            formatter: formatter,
            onInit: function () {
                let oViewModel = new JSONModel();

                oViewModel.setProperty("/fechaActual", new Date());

                this.setModel(oViewModel, "reporte");

                this.router = sap.ui.core.UIComponent.getRouterFor(this);
                //this.router.getTarget("TargetDetail").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
                this.router.getRoute("RouteDetail").attachPatternMatched(this.handleRouteMatched, this)
            },
            handleRouteMatched: function (event) {
                const nrmar = event.getParameters().arguments.idCdmar
                console.log(nrmar);
                const body = {
                    ip_canti: '0',
                    ip_cdmar: '166062'
                }
                fetch(`${mainUrlServices}reportepesca/ReporteTDC_CHD`, {
                    method: 'POST',
                    body: JSON.stringify(body)
                }).then(resp => resp.json())
                    .then(data => {
                        const t_bodeg = data.t_bodeg.map(b => {


                            return {
                                CDBOD: parseInt(b.CDBOD),
                                CDEMB: b.CDEMB,
                                DSBOD: b.DSBOD,
                                CAPES: b.CAPES
                            }
                        });
                        data.t_bodeg.forEach((b, i) => {
                            const bodeg = {
                                CDBOD: parseInt(b.CDBOD),
                                CDEMB: b.CDEMB,
                                DSBOD: b.DSBOD,
                                CAPES: b.CAPES
                            }

                            this.getModel("reporte").setProperty(`/t_bodeg${bodeg.CDBOD}`, bodeg);
                        });

                        this.getModel("reporte").setProperty("/mchpm", data.mchpm);
                        this.getModel("reporte").setProperty("/t_dchpm", data.t_dchpm);
                        this.getModel("reporte").setProperty("/t_bodeg", t_bodeg);
                        console.log(data)

                    }).finally(() => {
                        BusyIndicator.hide();
                    })
            },
            onNavBack: function (event) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain", {}, true);
            }
        });
    });
