sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/core/BusyIndicator",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, Controller, JSONModel, formatter, BusyIndicator, Filter, FilterOperator, exportLibrary, Spreadsheet) {
		"use strict";

		var EdmType = exportLibrary.EdmType;

		const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';

		return BaseController.extend("com.tasa.reportetdcchd.controller.Main", {
			dataTableKeys: [
				'NRMAR',
				'WERKS',
				'DESCR',
				'NMEMB',
				'FHZAR',
				'FHLLE',
				'FICAL',
				'FFCAL',
				'FCSAZ',
				'FCARP',
				'FIDES',
				'FFDES',
				'CNTDS',
				'CNPDC'
			],
			onInit: function () {
				let oViewModel = new JSONModel();

				this.setModel(oViewModel, "listMareas");

				this.loadData();

				// this.router = this.getRouter().getTarget("TargetMain").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				this.router = sap.ui.core.UIComponent.getRouterFor(this);
				this.router.getRoute("RouteMain").attachPatternMatched(this.handleRouteMatched, this)
			},

			loadData: function(){
				BusyIndicator.show(0);
				let plantas = [];
				let embarcaciones = [];
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
						this.getModel("listMareas").setProperty("/zinprpDom", zinprpDom);
						this.getModel("listMareas").setProperty("/zcdmmaDom", zcdmmaDom);
					}).catch(error => console.log(error));

				const bodyAyudaPlantas = {
					"nombreAyuda": "BSQPLANTAS",
					"p_user": this.getCurrentUser()
				};

				fetch(`${mainUrlServices}General/AyudasBusqueda/`,
				{
					method: 'POST',
					body: JSON.stringify(bodyAyudaPlantas)
				})
				.then(resp => resp.json()).then(data => {
					console.log("Busqueda: ", data);
					plantas = data.data;
					this.getModel("listMareas").setProperty("/plantas", plantas);
				}).catch(error => console.log(error));


				const objectRT = {
					"option": [
					],
					"option2": [
					],
					"options": [
					],
					"options2": [
					 {
						 "cantidad":"10",
						 "control":"COMBOBOX",
						 "key":"ESEMB",
						 "valueHigh":"",
						 "valueLow":"0"
					 }

					],
					"p_user": "BUSQEMB"
				  };

				  fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
			{
				method: 'POST',
				body: JSON.stringify(objectRT)
			})
			.then(resp => resp.json()).then(data => {
				console.log("Emba: ", data);
				embarcaciones = data.data;
				
				this.getModel("listMareas").setProperty("/embarcaciones", embarcaciones);
				BusyIndicator.hide();
			}).catch(error => console.log(error));


			},

			handleRouteMatched: function () { },
			searchData: function () {
				BusyIndicator.show(0);
				let option = [];
				let options = [];
				let commands = [];
				let marea = this.byId("marea").getValue();
				let planta = this.byId("planta").getValue();
				let embarcacion = this.byId("embarcacion").getValue();
				/*let fechaInicio = this.byId("fechaInicio").getValue();
				let fechaFin = this.byId("fechaFin").getValue();*/
				let numAciertos = this.byId("numAciertos").getValue();

				let fechaInicio = null;
				let fechaFin = null;
				var valueDateRange = this.byId("idDateRangeSelec").getValue();
				if(valueDateRange){
					var valDtrIni = valueDateRange.split("-")[0].trim();
					var valDtrFin = valueDateRange.split("-")[1].trim();
					if(valDtrIni && valDtrFin){
						fechaInicio = valDtrIni.split("/")[2].concat(valDtrIni.split("/")[1], valDtrIni.split("/")[0]);
						fechaFin = valDtrFin.split("/")[2].concat(valDtrFin.split("/")[1], valDtrFin.split("/")[0]);
					}
				}

				const input = 'INPUT';
				const multiinput = 'MULTIINPUT';
				const comboBox = "COMBOBOX";
				const multiComboBox = "MULTICOMBOBOX";

				if (marea) {
					options.push({
						cantidad: '10',
						control: multiinput,
						key: 'NRMAR',
						valueHigh: "",
						valueLow: marea
					});
				}

				if (planta) {
					options.push({
						cantidad: '10',
						control: input,
						key: 'CDPTA',
						valueHigh: "",
						valueLow: planta
					});
				}

				if (embarcacion) {
					options.push({
						cantidad: '10',
						control: input,
						key: 'CDEMB',
						valueHigh: "",
						valueLow: embarcacion
					});
				}

				if (fechaInicio || fechaFin) {
					const isRange = fechaInicio && fechaFin;
					const fecha = !isRange ? fechaInicio ? fechaInicio : fechaFin : null;
					options.push({
						cantidad: '10',
						control: multiinput,
						key: 'FIMAR',
						valueHigh: isRange ? fechaFin : "",
						valueLow: isRange ? fechaInicio : fecha
					});
				}

				/* if (marea) {
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
				}); */

				console.log(option);

				const body = {
					option: [],
					options: options,
					p_user: this.getCurrentUser(),
					rowcount: numAciertos
				};

				fetch(`${mainUrlServices}reportepesca/ConsultarMareas`, {
					method: 'POST',
					body: JSON.stringify(body)
				})
					.then(resp => resp.json())
					.then(data => {
						this.getModel("listMareas").setProperty("/items", data.s_marea);
						BusyIndicator.hide();
					});

			},
			showDetalle: async function (event) {
				BusyIndicator.show(0);
				let index = event.getSource().getBindingContext("listMareas").getPath().split("/")[2];
				// let oContext = event.getSource().getBindingContext("listMareas");
				// let reporteTdcCdhSelected = oContext.getObject();
				// console.log(reporteTdcCdhSelected);

				//Abrir reporte TDC CHD idCdmar

				const nrmar = this.getModel("listMareas").getProperty("/items")[index].NRMAR;
				this.router.navTo("RouteDetail", { idCdmar: nrmar });
			},
			filterGlobally: function (oEvent) {
				let sQuery = oEvent.getSource().getValue();
				const table = this.byId('tableData');
				const tableItemsBinding = table.getBinding('rows');
				const dataTable = tableItemsBinding.oList;
				let filters = [];

				this.dataTableKeys.forEach(k => {
					const typeValue = typeof dataTable[0][k];
					let vOperator = null;

					switch (typeValue) {
						case 'string':
							vOperator = FilterOperator.Contains;
							break;
						case 'number':
							vOperator = FilterOperator.EQ;
							break;
					}

					const filter = new Filter(k, vOperator, sQuery);
					filters.push(filter);
				});

				const oFilters = new Filter({
					filters: filters
				});

				/**
				 * Actualizar tabla
				 */
				tableItemsBinding.filter(oFilters, "Application");
			},
			createColumnConfig: function () {
				var aCols = [];
				const title = [];
				const table = this.byId('tableData');
				let tableColumns = table.getColumns();
				const dataTable = table.getBinding('rows').oList;

				/**
				 * Obtener solo las opciones que se exportarán
				 */
				for (let i = 0; i < tableColumns.length; i++) {
					let header = tableColumns[i].getAggregation('template');
					if (header) {
						let headerColId = header.getId();
						let headerCol = sap.ui.getCore().byId(headerColId);
						let headerColValue = headerCol.getText();

						title.push(headerColValue);
					}

				}
				title.pop();

				/**
				 * Combinar los títulos y los campos de la cabecera
				 */
				const properties = title.map((t, i) => {
					return {
						column: t,
						key: this.dataTableKeys[i]
					}
				});

				properties.forEach(p => {
					const typeValue = typeof dataTable[0][p.key];
					let propCol = {
						label: p.column,
						property: p.key
					};

					switch (typeValue) {
						case 'number':
							propCol.type = EdmType.Number;
							propCol.scale = 0;
							break;
						case 'string':
							propCol.type = EdmType.String;
							propCol.wrap = true;
							break;
					}

					aCols.push(propCol);
				});

				return aCols;
			},
			exportarExcel: function (event) {
				var aCols, oRowBinding, oSettings, oSheet, oTable;

				if (!this._oTable) {
					this._oTable = this.byId('tableData');
				}

				oTable = this._oTable;
				oRowBinding = oTable.getBinding('rows');
				aCols = this.createColumnConfig();

				oSettings = {
					workbook: { columns: aCols },
					dataSource: oRowBinding,
					fileName: 'Reporte de TDC CHD.xlsx',
					worker: false // We need to disable worker because we are using a Mockserver as OData Service
				};

				oSheet = new Spreadsheet(oSettings);
				oSheet.build().finally(function () {
					oSheet.destroy();
				});
			},

			onSelectEmba: function(evt){
				var objeto = evt.getSource().getBindingContext("listMareas").getObject();
				if(objeto){
					var cdemb = objeto.CDEMB;
					this.byId("embarcacion").setValue(cdemb);
					this.getDialog().close();
				}
			},

			onSearchEmbarcacion: function(evt){
				BusyIndicator.show(0);
				var idEmbarcacion =sap.ui.getCore().byId("idEmba").getValue();
				var idEmbarcacionDesc =sap.ui.getCore().byId("idNombEmba").getValue();
				var idMatricula =sap.ui.getCore().byId("idMatricula").getValue();
				var idRuc =sap.ui.getCore().byId("idRucArmador").getValue();
				var idArmador =sap.ui.getCore().byId("idDescArmador").getValue();
				var idPropiedad = sap.ui.getCore().byId("indicadorPropiedad").getSelectedKey();
				var options=[];
				var options2=[];
				let embarcaciones = [];
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "ESEMB",
					"valueHigh": "",
					"valueLow": "O"
				})
				if(idEmbarcacion){
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "CDEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacion
						
					});
				}
				if(idEmbarcacionDesc){
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "NMEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacionDesc.toUpperCase()
						
					});
				}
				if(idMatricula){
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "MREMB",
						"valueHigh": "",
						"valueLow": idMatricula
					})
				}
				if(idPropiedad){
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "INPRP",
						"valueHigh": "",
						"valueLow": idPropiedad
					})
				}
				if(idRuc){
					options2.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "STCD1",
						"valueHigh": "",
						"valueLow": idRuc
					})
				}
				if(idArmador){
					options2.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "NAME1",
						"valueHigh": "",
						"valueLow": idArmador.toUpperCase()
					})
				}
				
				var body={
					"option": [
					  
					],
					"option2": [
					  
					],
					"options": options,
					"options2": options2,
					"p_user": "BUSQEMB"
				};

				fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
				{
					method: 'POST',
					body: JSON.stringify(body)
				})
				.then(resp => resp.json()).then(data => {
					console.log("Emba: ", data);
					embarcaciones = data.data;
					
					this.getModel("listMareas").setProperty("/embarcaciones", embarcaciones);
					this.getModel("listMareas").refresh();
					BusyIndicator.hide();
				}).catch(error => console.log(error));
			},

			onOpenEmba: function(){
				this.getDialog().open();
			},

			onCerrarEmba: function(){
				this.getDialog().close();
			},

			getDialog: function(){
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment("com.tasa.reportetdcchd.view.Embarcacion", this);
					this.getView().addDependent(this.oDialog);
				}
				return this.oDialog;
			},

			clearFields: function(){
				this.byId("marea").setValue(null);
				this.byId("planta").setValue(null);
				this.byId("embarcacion").setValue(null);
				this.byId("idDateRangeSelec").setValue(null);
				this.getModel("listMareas").setProperty("/items", []);
				this.getModel("listMareas").refresh();
			},

			clearFilterEmba: function(){
				sap.ui.getCore().byId("idEmba").setValue(null);
				sap.ui.getCore().byId("idNombEmba").setValue(null);
				sap.ui.getCore().byId("idRucArmador").setValue(null);
				sap.ui.getCore().byId("idMatricula").setValue(null);
				sap.ui.getCore().byId("indicadorPropiedad").setSelectedKey(null);
				sap.ui.getCore().byId("idDescArmador").setValue(null);
				this.getModel("listMareas").setProperty("/embarcaciones", []);
				this.getModel("listMareas").refresh();
			},

			getCurrentUser: function(){
				return "FGARCIA"
			}

		});
	});
