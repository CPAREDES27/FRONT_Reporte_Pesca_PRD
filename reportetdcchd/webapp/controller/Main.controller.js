sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/core/BusyIndicator",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"sap/m/MessageBox"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, Controller, JSONModel, formatter, BusyIndicator, Filter, FilterOperator, exportLibrary, Spreadsheet, MessageBox) {
		"use strict";
		var oGlobalBusyDialog = new sap.m.BusyDialog();

		var EdmType = exportLibrary.EdmType;

		//const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'; //utilities.getHostService();
		//const HOST = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com";
		return BaseController.extend("com.tasa.reportetdcchd.controller.Main", {
			formatter: formatter,
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

				//this.loadData();

				// this.router = this.getRouter().getTarget("TargetMain").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				this.router = sap.ui.core.UIComponent.getRouterFor(this);
				this.router.getRoute("RouteMain").attachPatternMatched(this.handleRouteMatched, this);

				this.primerOption = [];
				this.segundoOption = [];
				this.currentPage = "";
				this.lastPage = "";
			},
			onAfterRendering: async function(){
				this.userOperation =await this.getCurrentUser();
				console.log(this.userOperation);	
	
				this.objetoHelp =  this._getHelpSearch();
				this.parameter= this.objetoHelp[0].parameter;
				this.url= this.objetoHelp[0].url;
				console.log(this.parameter)
				console.log(this.url)
				console.log(this.userOperation);
				this.callConstantes();
			},
	
			callConstantes: function(){
				oGlobalBusyDialog.open();
				var body={
					"nombreConsulta": "CONSGENCONST",
					"p_user": this.userOperation,
					"parametro1": this.parameter,
					"parametro2": "",
					"parametro3": "",
					"parametro4": "",
					"parametro5": ""
				}
				fetch(`${this.onLocation()}General/ConsultaGeneral/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						
						console.log(data.data);
						this.HOST_HELP=this.url+data.data[0].LOW;
						console.log(this.HOST_HELP);
							oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
				);
			},

			/*
			loadData: function () {
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

				fetch(`${this.onLocation()}dominios/Listar`,
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

				fetch(`${this.onLocation()}General/AyudasBusqueda/`,
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
							"cantidad": "10",
							"control": "COMBOBOX",
							"key": "ESEMB",
							"valueHigh": "",
							"valueLow": "0"
						}

					],
					"p_user": "BUSQEMB"
				};

				fetch(`${this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
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


			},*/

			handleRouteMatched: function () { },
			searchData: function () {
				BusyIndicator.show(0);
				let option = [];
				let options = [];
				let commands = [];
				let marea = this.byId("marea").getValue();
				let planta = this.byId("planta").getValue();
				let embarcacion = this.byId("inputId0_R").getValue();
				/*let fechaInicio = this.byId("fechaInicio").getValue();
				let fechaFin = this.byId("fechaFin").getValue();*/
				let numAciertos = this.byId("numAciertos").getValue();

				let fechaInicio = null;
				let fechaFin = null;
				/*
				var valueDateRange = this.byId("idDateRangeSelec").getValue();
				if (valueDateRange) {
					var valDtrIni = valueDateRange.split("-")[0].trim();
					var valDtrFin = valueDateRange.split("-")[1].trim();
					if (valDtrIni && valDtrFin) {
						fechaInicio = valDtrIni.split("/")[2].concat(valDtrIni.split("/")[1], valDtrIni.split("/")[0]);
						fechaFin = valDtrFin.split("/")[2].concat(valDtrFin.split("/")[1], valDtrFin.split("/")[0]);
					}
				}*/

				var valDtrIni=this.byId("fechaProdIni").getValue();
				var valDtrFin=this.byId("fechaProdFin").getValue();

				if(!marea && !embarcacion && !planta && !valDtrIni && !valDtrFin){
					var msj="Por favor ingrese un dato de selección";
				
					MessageBox.error(msj);
					BusyIndicator.hide();
					return false;
				}

				if (valDtrIni) {							
					fechaInicio = valDtrIni.split("/")[2].concat(valDtrIni.split("/")[1], valDtrIni.split("/")[0]);
				}
				if (valDtrFin) {
					fechaFin = valDtrFin.split("/")[2].concat(valDtrFin.split("/")[1], valDtrFin.split("/")[0]);
				}
				if(valDtrIni && !valDtrFin){
					fechaFin=fechaInicio;
				}
				if(valDtrFin && !valDtrIni){
					fechaInicio=fechaFin;
				}

				const input = 'INPUT';
				const multiinput = 'MULTIINPUT';
				const comboBox = "COMBOBOX";
				const multiComboBox = "MULTICOMBOBOX";

				options.push({
					cantidad: '10',
					control: comboBox,
					key: 'INPRP',
					valueHigh: "",
					valueLow: "P"
				});

				options.push({
					cantidad: '10',
					control: comboBox,
					key: 'CDMMA',
					valueHigh: "",
					valueLow: "1"
				});

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
				console.log(body);

				fetch(`${this.onLocation()}reportepesca/ConsultarMareas`, {
					method: 'POST',
					body: JSON.stringify(body)
				})
					.then(resp => resp.json())
					.then(data => {

						var listaMareas=data.s_marea;


						for(var i=0; i< data.s_marea.length;i++){
							data.s_marea[i].NRMAR=String(data.s_marea[i].NRMAR);
						}
						
						this.getModel("listMareas").setProperty("/items", data.s_marea);
						BusyIndicator.hide();
						
						console.log(data);

						var cantidadRegistros="Lista de registros: "+data.s_marea.length;
						this.byId("idListaReg").setText(cantidadRegistros);

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
			createColumnConfig5: function() {
				return [
					{
						label: 'Marea',
						property: 'NRMAR' ,
						type: EdmType.Number
					},
					{
						label: 'Centro',
						property: 'WERKS' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Planta',
						property: 'DESCR' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Nombre Embarcación',
						property: 'NMEMB' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Fecha Zarpe',
						property: 'FHZAR' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Llegada Zona',
						property: 'FHLLE' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Inicio Cala',
						property: 'FICAL' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Fin Cala',
						property: 'FFCAL' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Salida Zona',
						property: 'FCSAZ' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Arribo Puerto',
						property: 'FCARP' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Inicio Descarga',
						property: 'FIDES' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Fin Descarga',
						property: 'FFDES' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Descargada ',
						property: 'CNTDS' ,
						type: EdmType.Number,
						scale: 3
					},
					{
						label: 'Declarada',
						property: 'CNPDC' ,
						type: EdmType.Number,
						scale: 3
					}

					
					];
			},
			onExport: function() {
				oGlobalBusyDialog.open();
			
				var aCols, aProducts, oSettings, oSheet;
	
				aCols = this.createColumnConfig5();
		
				aProducts = this.getView().getModel("listMareas").getProperty('/items');
	
				oSettings = {
					
					workbook: { 
						columns: aCols,
						context: {
							application: 'Debug Test Application',
							version: '1.95.0',
							title: 'Some random title',
							modifiedBy: 'John Doe',
							metaSheetName: 'Custom metadata'
						}
						
					},
					dataSource: aProducts,
					fileName:"Reporte de TDC CHD"
				};
	
				oSheet = new Spreadsheet(oSettings);
				oSheet.build()
					.then( function() {
						MessageToast.show('El Archivo ha sido exportado correctamente');
					})
					.finally(oSheet.destroy);
					oGlobalBusyDialog.close();
			},

			onSelectEmba: function (evt) {
				var objeto = evt.getParameter("rowContext").getObject();
				if (objeto) {
					var cdemb = objeto.CDEMB;
					this.byId("inputId0_R").setValue(cdemb);
					this.getDialog().close();
				}
			},

			onSearchEmbarcacion: function (evt) {
				BusyIndicator.show(0);
				var idEmbarcacion = sap.ui.getCore().byId("idEmba").getValue();
				var idEmbarcacionDesc = sap.ui.getCore().byId("idNombEmba").getValue();
				var idMatricula = sap.ui.getCore().byId("idMatricula").getValue();
				var idRuc = sap.ui.getCore().byId("idRucArmador").getValue();
				var idArmador = sap.ui.getCore().byId("idDescArmador").getValue();
				var idPropiedad = sap.ui.getCore().byId("indicadorPropiedad").getSelectedKey();
				var options = [];
				var options2 = [];
				let embarcaciones = [];
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "ESEMB",
					"valueHigh": "",
					"valueLow": "O"
				})
				if (idEmbarcacion) {
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "CDEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacion

					});
				}
				if (idEmbarcacionDesc) {
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "NMEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacionDesc.toUpperCase()

					});
				}
				if (idMatricula) {
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "MREMB",
						"valueHigh": "",
						"valueLow": idMatricula
					});
				}
				if (idPropiedad) {
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "INPRP",
						"valueHigh": "",
						"valueLow": idPropiedad
					});
				}
				if (idRuc) {
					options2.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "STCD1",
						"valueHigh": "",
						"valueLow": idRuc
					});
				}
				if (idArmador) {
					options2.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "NAME1",
						"valueHigh": "",
						"valueLow": idArmador.toUpperCase()
					});
				}

				this.primerOption = options;
				this.segundoOption = options2;

				var body = {
					"option": [

					],
					"option2": [

					],
					"options": options,
					"options2": options2,
					"p_user": "BUSQEMB",
					//"p_pag": "1" //por defecto la primera parte
				};

				fetch(`${this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Emba: ", data);
						embarcaciones = data.data;

						this.getModel("listMareas").setProperty("/embarcaciones", embarcaciones);
						this.getModel("listMareas").refresh();

						if (!isNaN(data.p_totalpag)) {
							if (Number(data.p_totalpag) > 0) {
								sap.ui.getCore().byId("goFirstPag").setEnabled(true);
								sap.ui.getCore().byId("goPreviousPag").setEnabled(true);
								sap.ui.getCore().byId("comboPaginacion").setEnabled(true);
								sap.ui.getCore().byId("goLastPag").setEnabled(true);
								sap.ui.getCore().byId("goNextPag").setEnabled(true);
								var tituloTablaEmba = "Página 1/" + Number(data.p_totalpag);
								this.getModel("listMareas").setProperty("/TituloEmba", tituloTablaEmba);
								var numPag = Number(data.p_totalpag) + 1;
								var paginas = [];
								for (let index = 1; index < numPag; index++) {
									paginas.push({
										numero: index
									});
								}
								this.getModel("listMareas").setProperty("/NumerosPaginacion", paginas);
								sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
								this.currentPage = "1";
								this.lastPage = data.p_totalpag;
							} else {
								var tituloTablaEmba = "Página 1/1";
								this.getModel("listMareas").setProperty("/TituloEmba", tituloTablaEmba);
								this.getModel("listMareas").setProperty("/NumerosPaginacion", []);
								sap.ui.getCore().byId("goFirstPag").setEnabled(false);
								sap.ui.getCore().byId("goPreviousPag").setEnabled(false);
								sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
								sap.ui.getCore().byId("goLastPag").setEnabled(false);
								sap.ui.getCore().byId("goNextPag").setEnabled(false);
								this.currentPage = "1";
								this.lastPage = data.p_totalpag;
							}
						}


						//sap.ui.getCore().byId("comboPaginacion").setVisible(true);

						BusyIndicator.hide();
					}).catch(error => console.log(error));
			},

			onChangePag: function (evt) {
				var id = evt.getSource().getId();
				var oControl = sap.ui.getCore().byId(id);
				var pagina = oControl.getSelectedKey();
				this.currentPage = pagina;
				this.onNavPage();
			},

			onSetCurrentPage: function (evt) {
				var id = evt.getSource().getId();
				if (id == "goFirstPag") {
					this.currentPage = "1";
				} else if (id == "goPreviousPag") {
					if (!isNaN(this.currentPage)) {
						if (this.currentPage != "1") {
							var previousPage = Number(this.currentPage) - 1;
							this.currentPage = previousPage.toString();
						}
					}
				} else if (id == "goNextPag") {
					if (!isNaN(this.currentPage)) {
						if (this.currentPage != this.lastPage) {
							var nextPage = Number(this.currentPage) + 1;
							this.currentPage = nextPage.toString();
						}
					}
				} else if (id == "goLastPag") {
					this.currentPage = this.lastPage;
				}
				this.onNavPage();
			},

			onNavPage: function () {
				BusyIndicator.show(0);
				let embarcaciones = [];
				var body = {
					"option": [

					],
					"option2": [

					],
					"options": this.primerOption,
					"options2": this.segundoOption,
					"p_user": "BUSQEMB",
					"p_pag": this.currentPage
				};

				fetch(`${this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Emba: ", data);
						embarcaciones = data.data;

						this.getModel("listMareas").setProperty("/embarcaciones", embarcaciones);
						this.getModel("listMareas").refresh();
						var tituloTablaEmba = "Página " + this.currentPage + "/" + Number(data.p_totalpag);
						this.getModel("listMareas").setProperty("/TituloEmba", tituloTablaEmba);
						sap.ui.getCore().byId("comboPaginacion").setSelectedKey(this.currentPage);
						BusyIndicator.hide();
					}).catch(error => console.log(error));
			},

			onOpenEmba: function () {
				this.getDialog().open();
			},

			onCerrarEmba: function () {
				this.getDialog().close();
			},

			getDialog: function () {
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment("com.tasa.reportetdcchd.view.Embarcacion", this);
					this.getView().addDependent(this.oDialog);
				}
				return this.oDialog;
			},

			clearFields: function () {
				this.byId("marea").setValue(null);
				this.byId("planta").setValue(null);
				this.byId("inputId0_R").setValue(null);
				//this.byId("idDateRangeSelec").setValue(null);
				this.getModel("listMareas").setProperty("/items", []);
				this.getModel("listMareas").refresh();
				this.byId("fechaProdIni").setValue(null);
				this.byId("fechaProdFin").setValue(null);
				var cantidadRegistros="Lista de registros: 0";
				this.byId("idListaReg").setText(cantidadRegistros);
			},

			clearFilterEmba: function () {
				sap.ui.getCore().byId("idEmba").setValue(null);
				sap.ui.getCore().byId("idNombEmba").setValue(null);
				sap.ui.getCore().byId("idRucArmador").setValue(null);
				sap.ui.getCore().byId("idMatricula").setValue(null);
				sap.ui.getCore().byId("indicadorPropiedad").setSelectedKey(null);
				sap.ui.getCore().byId("idDescArmador").setValue(null);
				//sap.ui.getCore().byId("comboPaginacion").setVisible(false);
				this.getModel("listMareas").setProperty("/embarcaciones", []);
				this.getModel("listMareas").setProperty("/NumerosPaginacion", []);
				this.getModel("listMareas").refresh();
			},

			getCurrentUser: function () {
				return this.userOperation; //utilities.getCurrentUser();
			},
			onSearchHelp:function(oEvent){
				let sIdInput = oEvent.getSource().getId(),
				oModel = this.getModel(),
				nameComponent="busqembarcaciones",
				idComponent="busqembarcaciones",
				urlComponent=this.HOST_HELP+".AyudasBusqueda.busqembarcaciones-1.0.0",
				oView = this.getView(),
		
					oInput = this.getView().byId(sIdInput);	
				
				
				oModel.setProperty("/input",oInput);
	
				if(!this.DialogComponent){
					this.DialogComponent = new sap.m.Dialog({
						title:"Búsqueda de embarcaciones",
						icon:"sap-icon://search",
						state:"Information",
						endButton:new sap.m.Button({
							icon:"sap-icon://decline",
							text:"Cerrar",
							type:"Reject",
							press:function(oEvent){
								this.onCloseDialog(oEvent);
							}.bind(this)
						})
					});
					oView.addDependent(this.DialogComponent);
					oModel.setProperty("/idDialogComp",this.DialogComponent.getId());
				}
	
				let comCreateOk = function(oEvent){
					BusyIndicator.hide();
				};
	
				
				if(this.DialogComponent.getContent().length===0){
					BusyIndicator.show(0);
					let oComponent = new sap.ui.core.ComponentContainer({
						id:idComponent,
						name:nameComponent,
						url:urlComponent,
						settings:{},
						componentData:{},
						propagateModel:true,
						componentCreated:comCreateOk,
						height:'100%',
						// manifest:true,
						async:false
					});
	
					this.DialogComponent.addContent(oComponent);
				}
				
				this.DialogComponent.open();
			},
			onCloseDialog:function(oEvent){
				oEvent.getSource().getParent().close();
			}

		});
	});
