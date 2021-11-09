sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, Controller, JSONModel, formatter, Filter, FilterOperator, exportLibrary, Spreadsheet, BusyIndicator, MessageBox) {
		"use strict";

		var EdmType = exportLibrary.EdmType;

		const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';

		return BaseController.extend("com.tasa.consultamareas.controller.View1", {
			formatter: formatter,
			dataTableKeys: [
				'NRMAR',
				'WERKS',
				'DESCR',
				'DSEMP',
				'NMEMB',
				'FICAL',
				'FFCAL',
				'DSSPE',
				'DESC_INPRP',
				'DESC_CDMMA',
				'INPRP',
				'CDMMA',
				'FEMAR',
				'FXMAR',
				'FHZAR',
				'FHLLE',
				'FCSAZ',
				'FCARP',
				'FIDES',
				'FFDES',
				'CNTDS',
				'CNPDC'
			],
			onInit: function () {
				let oViewModel = new JSONModel({});
				this.currentInputEmba = "";
				this.setModel(oViewModel, "consultaMareas");
				this.loadData();
				this.primerOption = [];
				this.segundoOption = [];
				this.currentPage = "";
				this.lastPage = "";

			},
			handleSelectionChange: function (event) {
				console.log(event.getParameter("changedItem"));
			},
			handleSelectionFinish: function (event) {
				let selectedItems = event.getParameter("selectedItems");
				console.log(selectedItems);

			},
			loadData: function () {
				BusyIndicator.show(0);
				let zinprpDom = [];
				let zcdmmaDom = [];
				let plantas = [];
				let embarcaciones = [];

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
						this.getModel("consultaMareas").setProperty("/plantas", plantas);
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

				fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(objectRT)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Emba: ", data);
						embarcaciones = data.data;

						this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
						this.getModel("consultaMareas").refresh();
						BusyIndicator.hide();
					}).catch(error => console.log(error));

			},
			searchData: function (event) {
				console.log("ENTRE");
				BusyIndicator.show(0);
				let options = [];
				let commands = [];
				let mareaLow = parseInt(this.byId("mareaLow").getValue());
				let mareaHigh = parseInt(this.byId("mareaHigh").getValue());
				let plantaLow = this.byId("plantaLow").getValue();
				let plantaHigh = this.byId("plantaHigh").getValue();
				let embarcacionLow = this.byId("embarcacionLow").getValue();
				let embarcacionHigh = this.byId("embarcacionHigh").getValue();
				console.log("Emba Low: ", embarcacionLow);
				console.log("Emba high: ", embarcacionHigh);
				let propiedad = this.byId("propiedad").getSelectedKey();
				let motivos = this.byId("motivos").getSelectedKeys();
				/*let fechaInicio = this.byId("fechaInicio").getValue();
				let fechaFin = this.byId("fechaFin").getValue();*/
				let numRegistros = this.byId("numRegistros").getValue();

				let fechaInicio = null;
				let fechaFin = null;
				var valueDateRange = this.byId("idDateRangeSelec").getValue();
				if (valueDateRange) {
					var valDtrIni = valueDateRange.split("-")[0].trim();
					var valDtrFin = valueDateRange.split("-")[1].trim();
					if (valDtrIni && valDtrFin) {
						fechaInicio = valDtrIni.split("/")[2].concat(valDtrIni.split("/")[1], valDtrIni.split("/")[0]);
						fechaFin = valDtrFin.split("/")[2].concat(valDtrFin.split("/")[1], valDtrFin.split("/")[0]);
					}

					const input = 'INPUT';
					const multiinput = 'MULTIINPUT';
					const comboBox = "COMBOBOX";
					const multiComboBox = "MULTICOMBOBOX";



					if (mareaLow || mareaHigh) {
						const isMulti = mareaLow && mareaHigh;
						const marea = !isMulti ? mareaLow ? mareaLow : mareaHigh : null;
						options.push({
							cantidad: "10",
							control: multiinput,
							key: "NRMAR",
							valueHigh: isMulti ? mareaHigh : "",
							valueLow: isMulti ? mareaLow : marea
						});
					}

					if (plantaLow || plantaHigh) {
						const isMulti = plantaHigh && plantaLow;
						const planta = !isMulti ? plantaLow ? plantaLow : plantaHigh : null;

						options.push({
							cantidad: "10",
							control: multiinput,
							key: "CDPTA",
							valueHigh: isMulti ? plantaHigh : "",
							valueLow: isMulti ? plantaLow : planta
						});
					}

					
					if (embarcacionLow || embarcacionHigh) {
						const isMulti = embarcacionHigh && embarcacionLow;
						const embarcacion = !isMulti ? embarcacionLow ? embarcacionLow : embarcacionHigh : null;

						options.push({
							cantidad: "10",
							control: multiinput,
							key: "CDEMB",
							valueHigh: isMulti ? embarcacionHigh : "",
							valueLow: isMulti ? embarcacionLow : embarcacion
						});
					}

					if (propiedad) {
						options.push({
							cantidad: "10",
							control: comboBox,
							key: "INPRP",
							valueHigh: "",
							valueLow: propiedad
						});
					}

					motivos.forEach(motivo => {
						options.push({
							cantidad: "10",
							control: multiComboBox,
							key: "CDMMA",
							valueHigh: "",
							valueLow: motivo
						});
					});

					if (fechaInicio || fechaFin) {
						const isRange = fechaInicio && fechaFin;
						const fecha = !isRange ? fechaInicio ? fechaInicio : fechaFin : null;

						options.push({
							cantidad: "10",
							control: multiinput,
							key: "FIMAR",
							valueHigh: isRange ? fechaFin : "",
							valueLow: isRange ? fechaInicio : fecha
						});
					}

					let body = {
						option: [],
						options: options,
						p_user: this.getCurrentUser(),
						rowcount: numRegistros
					};
					console.log(body);
					fetch(`${mainUrlServices}reportepesca/ConsultarMareas`, {
						method: 'POST',
						body: JSON.stringify(body)
					})
						.then(resp => resp.json())
						.then(data => {
							var mssg = "Lista de Registros (" + data.s_marea.length + ")";
							this.getModel("consultaMareas").setProperty("/titulo", mssg);
							this.getModel("consultaMareas").setProperty("/items", data.s_marea);
							this.getModel("consultaMareas").refresh();
							//this.getModel("consultaMareas").setProperty("/numCalas", data.s_marea.length);
							BusyIndicator.hide();

						})
						.catch(error => console.error(error));


				} else {
					BusyIndicator.hide();
					MessageBox.error("El campo fecha es obligatorio");
				}
			},
			detalleMarea: function (event) {
				console.log(event);
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
				const dataTable = table.getBinding('items').oList;

				/**
				 * Obtener solo las opciones que se exportarán
				 */
				for (let i = 0; i < tableColumns.length; i++) {
					let header = tableColumns[i].getAggregation('header');
					if (header) {
						let headerColId = tableColumns[i].getAggregation('header').getId();
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
				})

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
				aCols = this.getColumnsConfig();

				oSettings = {
					workbook: {
						columns: aCols,
						context: {
							sheetName: "CONSULTA DE MAREAS"
						}
					},
					dataSource: oRowBinding,
					fileName: 'Consulta de mareas.xlsx',
					worker: false // We need to disable worker because we are using a Mockserver as OData Service
				};

				oSheet = new Spreadsheet(oSettings);
				oSheet.build().finally(function () {
					oSheet.destroy();
				});
			},

			

			onSelectEmba: function(evt){
				var objeto = evt.getParameter("rowContext").getObject();
				if (objeto) {
					var cdemb = objeto.CDEMB;
					if (this.currentInputEmba.includes("embarcacionLow")) {
						this.byId("embarcacionLow").setValue(cdemb);
					}else if(this.currentInputEmba.includes("embarcacionHigh")){
						this.byId("embarcacionHigh").setValue(cdemb);
					}
					this.getDialog().close();
				}
			},
	
			onSearchEmbarcacion: function(evt){
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
	
				fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Emba: ", data);
						embarcaciones = data.data;
	
						this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
						this.getModel("consultaMareas").refresh();
	
						if (!isNaN(data.p_totalpag)) {
							if (Number(data.p_totalpag) > 0) {
								sap.ui.getCore().byId("goFirstPag").setEnabled(true);
								sap.ui.getCore().byId("goPreviousPag").setEnabled(true);
								sap.ui.getCore().byId("comboPaginacion").setEnabled(true);
								sap.ui.getCore().byId("goLastPag").setEnabled(true);
								sap.ui.getCore().byId("goNextPag").setEnabled(true);
								var tituloTablaEmba = "Página 1/" + Number(data.p_totalpag);
								this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
								var numPag = Number(data.p_totalpag) + 1;
								var paginas = [];
								for (let index = 1; index < numPag; index++) {
									paginas.push({
										numero: index
									});
								}
								this.getModel("consultaMareas").setProperty("/NumerosPaginacion", paginas);
								sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
								this.currentPage = "1";
								this.lastPage = data.p_totalpag;
							} else {
								var tituloTablaEmba = "Página 1/1";
								this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
								this.getModel("consultaMareas").setProperty("/NumerosPaginacion", []);
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
	
				fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Emba: ", data);
						embarcaciones = data.data;
	
						this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
						this.getModel("consultaMareas").refresh();
						var tituloTablaEmba = "Página " + this.currentPage + "/" + Number(data.p_totalpag);
						this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
						sap.ui.getCore().byId("comboPaginacion").setSelectedKey(this.currentPage);
						BusyIndicator.hide();
					}).catch(error => console.log(error));
			},
			getDialog: function(){
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment("tasa.com.aprobacionprecios.view.Embarcacion", this);
					this.getView().addDependent(this.oDialog);
				}
				return this.oDialog;
			},
			onOpenEmba: function(evt){
				this.currentInputEmba = evt.getSource().getId();
				this.getDialog().open();
			},
	
			onCerrarEmba: function(){
				this.clearFilterEmba();
				this.getDialog().close();
				this.getModel("consultaMareas").setProperty("/embarcaciones", "");
				this.getModel("consultaMareas").setProperty("/TituloEmba", "");
				sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
				sap.ui.getCore().byId("goFirstPag").setEnabled(false);
				sap.ui.getCore().byId("goPreviousPag").setEnabled(false);
				sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
				sap.ui.getCore().byId("goLastPag").setEnabled(false);
				sap.ui.getCore().byId("goNextPag").setEnabled(false);
				sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
			},
			buscarEmbarca: function(evt){
				console.log(evt);
				var indices = evt.mParameters.listItem.oBindingContexts.consultaMareas.sPath.split("/")[2];
				console.log(indices);
			
				var data = this.getView().getModel("consultaMareas").oData.embarcaciones[indices].CDEMB;
				if (this.currentInputEmba.includes("embarcacionLow")) {
					this.byId("embarcacionLow").setValue(data);
				}else if(this.currentInputEmba.includes("embarcacionHigh")){
					this.byId("embarcacionHigh").setValue(data);
				}
				this.onCerrarEmba();
				
			},
			getColumnsConfig: function () {
				var aColumns = [
					{
						label: "Marea",
						property: "NRMAR",
						type: "number"
					},
					{
						label: "Planta",
						property: "DESCR",
					},
					{
						label: "Empresa",
						property: "DSEMP",
					},
					{
						label: "Nombre Embarcación",
						property: "NMEMB",
					},
					{
						label: "Sistema de Pesca",
						property: "DSSPE",
					},
					{
						label: "Propiedad",
						property: "DESC_INPRP",
					},
					{
						label: "Motivo",
						property: "DESC_CDMMA",
					},
					{
						label: "Fecha Inicio Marea",
						property: "FEMAR",
					},
					{
						label: "Hora Inicio Marea",
						property: "HAMAR",
					},
					{
						label: "Fecha Cierre Marea",
						property: "FXMAR",
					},
					{
						label: "Hora Cierre Marea",
						property: "HXMAR",
					},
					{
						label: "Fecha Zarpe",
						property: "FHZAR",
					},
					{
						label: "Hora Zarpe",
						property: "HRZAR",
					},
					{
						label: "Fecha Llegada Zona",
						property: "FHLLE",
					},
					{
						label: "Hora Llegada Zona",
						property: "HRLLE",
					},
					{
						label: "Fecha Inicio Envase",
						property: "FICAL",
					},
					{
						label: "Hora Inicio Envase",
						property: "HICAL",
					},
					{
						label: "Fecha Fin Envase",
						property: "FFCAL",
					},
					{
						label: "Hora Fin Envase",
						property: "HFCAL",
					},
					{
						label: "Fecha Salida Zona",
						property: "FCSAZ",
					},
					{
						label: "Hora Salida Zona",
						property: "HRSAZ",
					},
					{
						label: "Fecha Arribo",
						property: "FCARP",
					},
					{
						label: "Hora Arribo",
						property: "HOARR",
					},
					{
						label: "Fecha Ini Desc",
						property: "FIDES",
					},
					{
						label: "Hora Ini Desc",
						property: "HIDES",
					},
					{
						label: "Fecha Fin Desc",
						property: "FFDES",
					},
					{
						label: "Hora Fin Desc",
						property: "HFDES",
					},
					{
						label: "Descargada",
						property: "CNTDS",
						type: "number",
						scale: 3
					},
					{
						label: "Declarada",
						property: "CNPDC",
						type: "number",
						scale: 3
					}
				];
				return aColumns;
			},

			clearFields: function () {
				this.byId("mareaLow").setValue(null);
				this.byId("mareaHigh").setValue(null);
				this.byId("plantaLow").setValue(null);
				this.byId("plantaHigh").setValue(null);
				this.byId("embarcacionLow").setValue(null);
				this.byId("embarcacionHigh").setValue(null);
				this.byId("propiedad").setSelectedKey(null);
				this.byId("motivos").setSelectedKeys(null);
				this.byId("idDateRangeSelec").setValue(null);
				this.getModel("consultaMareas").setProperty("/items", []);
			},

			clearFilterEmba: function () {
				sap.ui.getCore().byId("idEmba").setValue(null);
				sap.ui.getCore().byId("idNombEmba").setValue(null);
				sap.ui.getCore().byId("idRucArmador").setValue(null);
				sap.ui.getCore().byId("idMatricula").setValue(null);
				sap.ui.getCore().byId("indicadorPropiedad").setSelectedKey(null);
				sap.ui.getCore().byId("idDescArmador").setValue(null);
				//sap.ui.getCore().byId("comboPaginacion").setVisible(false);
				this.getModel("consultaMareas").setProperty("/embarcaciones", []);
				this.getModel("consultaMareas").setProperty("/NumerosPaginacion", []);
				this.getModel("consultaMareas").refresh();
			},

			getDialog: function () {
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment("com.tasa.consultamareas.view.Embarcacion", this);
					this.getView().addDependent(this.oDialog);
				}
				return this.oDialog;
			},

			getCurrentUser: function () {
				return "FGARCIA"
			}

		});
	});