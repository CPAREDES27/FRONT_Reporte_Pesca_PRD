sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/core/routing/History"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, Controller, JSONModel, formatter, History) {
        "use strict";
        const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';

        return BaseController.extend("com.tasa.reportetdcchd.controller.ReporteTDCCHR", {
            onInit: function () {
                let oViewModel = new JSONModel();

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
                        this.getModel("reporte").setProperty("/mchpm", data.t_mchpm[0]);
                        this.getModel("reporte").setProperty("/dchpm", data.t_dchpm[0]);
                        this.getModel("reporte").setProperty("/bodeg", data.t_bodeg);
                        console.log(data)
                    })
            },
            onNavBack: function (event) {
                // let history=History.getInstance();
                // let prev=history.getPreviousHash();
                // if(prev!==undefined){
                //     window.history.go(-1)
                // }else{
                //     this.router.navTo("RouteMain")
                // }
                //this.router.navTo("RouteMain")
                // let oHistory = History.getInstance();
                // let previousHash = oHistory.getPreviousHash();

                // if (previousHash !== undefined) {
                //     window.history.go(-1);
                // } else {
                //     var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                //     oRouter.navTo("RouteMain", true);
                // }
                history.go(-1);
            }
        });
    });
