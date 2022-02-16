sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library"
], function (Controller, UIComponent, mobileLibrary) {
	"use strict";

	return Controller.extend("com.tasa.reportetdcchd.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel : function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		cambiarFormatoString: function (fechaString) {
            const dia = fechaString.substr(0, 2);
            const mes = fechaString.substr(3, 2);
            const anho = fechaString.substr(6, 4);

            return `${anho}-${mes}-${dia}`;
        },
		calcularHoras: function (fecha1, hora1, fecha2, hora2) {
            if (fecha1.includes('/')) {
                fecha1 = this.cambiarFormatoString(fecha1);
            }
            let dateTimeInicio = new Date(`${fecha1} ${hora1}`);

            if (fecha2) {
                if (fecha2.includes('/')) {
                    fecha2 = this.cambiarFormatoString(fecha2);
                }
            }
            let dateTimeFin = fecha2 ? new Date(`${fecha2} ${hora2}`) : new Date();
            let diff = Math.abs(dateTimeFin - dateTimeInicio) / 36e5;
            diff = diff.toFixed(2);

            return diff;
        },
		getCurrentUser: async function(){
            let oUshell = sap.ushell,
            oUser={};
            if(oUshell){
                let  oUserInfo =await sap.ushell.Container.getServiceAsync("UserInfo");
                let sEmail = oUserInfo.getEmail().toUpperCase(),
                sName = sEmail.split("@")[0],
                sDominio= sEmail.split("@")[1];
                if(sDominio === "XTERNAL.BIZ") sName = "FGARCIA";
                oUser = {
                    name:sName
                }
            }else{
                oUser = {
                    name: "FGARCIA"
                }
            }

			var usuario=oUser.name;
			console.log(usuario);

            return usuario;
        },
		onLocation:function(){

			var oRouter = window.location.origin;
	
			console.log(oRouter)
	
			var service="";
	
			if(oRouter.indexOf("localhost") !== -1){
	
				service='https://cf-nodejs-prd.cfapps.us10.hana.ondemand.com/api/'
				//service='https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'

			}
	
			if(oRouter.indexOf("tasadev")!== -1){
	
				service='https://cf-nodejs-cheerful-bat-js.cfapps.us10.hana.ondemand.com/api/'
	
			}
	
			if(oRouter.indexOf("tasaprd")!==-1){
	
				service='https://cf-nodejs-prd.cfapps.us10.hana.ondemand.com/api/'
	
			}
	
			if(oRouter.indexOf("tasaqas")!==-1){
	
				service='https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
	
			}
	
			console.log(service);
	
			return service;
	
		},
		
		_getHelpSearch:  function(){
			var oRouter = window.location.origin;
			var service=[];
			if(oRouter.indexOf("localhost") !== -1){
				service.push({
					url:"https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com/",
					parameter:"IDH4_QAS"
				})
			}
			if(oRouter.indexOf("tasadev")!== -1){
				service.push({
					url:"https://tasadev.launchpad.cfapps.us10.hana.ondemand.com/",
					parameter:"IDH4_DEV"
				})
			}
			if(oRouter.indexOf("tasaprd")!==-1){
				service.push({
					url:"https://tasaprd.launchpad.cfapps.us10.hana.ondemand.com/",
					parameter:"IDH4_PRD"
				})
			}
			if(oRouter.indexOf("tasaqas")!==-1){
				service.push({
					url:"https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com/",
					parameter:"IDH4_QAS"
				})
			}
			return service;
		},
	});

});