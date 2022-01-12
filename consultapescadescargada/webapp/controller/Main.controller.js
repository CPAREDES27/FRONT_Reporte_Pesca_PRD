sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"../model/formatter",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"../model/utilities"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, JSONModel, Fragment, formatter, BusyIndicator, MessageBox, Filter, FilterOperator, exportLibrary, Spreadsheet, utilities) {
		"use strict";
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		var EdmType = exportLibrary.EdmType;
		//const HOST = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com";
		//const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'; //utilities.getHostService();

		return BaseController.extend("com.tasa.consultapescadescargada.controller.Main", {
			formatter: formatter,
			dataTableKeys: [
				'WERKS',
				'FECCONMOV',
				'CDMMA',
				'NRDES',
				'FCZAR',
				'HOZAR',
				'FCARR',
				'HOARR',
				'MREMB',
				'NMEMB',
				'CPPMS',
				'DSEMP',
				'CNPCM',
				'CNPDS',
				'DSSPC',
				'INPRP',
				'NMPER'
			],
			onInit: function () {
				let oViewModel = new JSONModel({});
				this.currentInputEmba = "";
				this.setModel(oViewModel, "consultaPescaDescargada");
				this.loadData();
				this.primerOption = [];
				this.segundoOption = [];
				this.currentPage = "";
				this.lastPage = "";
			},
			loadData: function () {
				BusyIndicator.show(0);
				let ubicacionesPlanta = [];
				let zinprpDom = [];
				let zdoTipoMareaDom = [];
				let centros = [];
				let embarcaciones = [];
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

				fetch(`${this.onLocation()}dominios/Listar`,
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

				const bodyAyudaBusqueda = {
					"nombreAyuda": "BSQPLANTAS",
					"p_user": this.userOperation
				};

				fetch(`${this.onLocation()}General/AyudasBusqueda/`,
					{
						method: 'POST',
						body: JSON.stringify(bodyAyudaBusqueda)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Busqueda: ", data);
						centros = data.data;
						this.getModel("consultaPescaDescargada").setProperty("/centros", centros);
						BusyIndicator.hide();
					}).catch(error => console.log(error));

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

			searchData: async function (event) {
				BusyIndicator.show(0);
				let options = [];
				let commands = [];
				let planta = this.byId("centro").getValue();
				let ubicacionPlanta = this.byId("ubicacionPlanta").getSelectedKey();
				let embarcacion = this.byId("inputId0_R").getValue();
				let indicadorPropiedad = this.byId("indicadorPropiedad").getSelectedKey();
				let tipoMarea = this.byId("tipoMarea").getSelectedKey();
				//let fechaProdIni = this.byId("fechaProdIni").getValue();
				//let fechaProdFin = this.byId("fechaProdFin").getValue();
				let numRegistros = this.byId("numRegistros").getValue();

				let fechaProdIni = null;
				let fechaProdFin = null;
				var valueDateRange = this.byId("idDateRangeSelec").getValue();
				if (valueDateRange) {
					var valDtrIni = valueDateRange.split("-")[0].trim();
					var valDtrFin = valueDateRange.split("-")[1].trim();
					if (valDtrIni && valDtrFin) {
						fechaProdIni = valDtrIni.split("/")[2].concat(valDtrIni.split("/")[1], valDtrIni.split("/")[0]);
						fechaProdFin = valDtrFin.split("/")[2].concat(valDtrFin.split("/")[1], valDtrFin.split("/")[0]);
					}
				}

				const input = 'INPUT';
				const multiinput = 'MULTIINPUT';
				const comboBox = "COMBOBOX";
				const multiComboBox = "MULTICOMBOBOX";

				if (planta) {
					options.push({
						cantidad: '10',
						control: input,
						key: 'WERKS',
						valueHigh: '',
						valueLow: planta
					});
				}

				if (ubicacionPlanta) {
					options.push({
						cantidad: '10',
						control: input,
						key: 'CDUPT',
						valueHigh: '',
						valueLow: ubicacionPlanta
					});
				}

				if (embarcacion) {
					options.push({
						cantidad: '10',
						control: input,
						key: 'CDEMB',
						valueHigh: '',
						valueLow: embarcacion
					});
				}

				if (indicadorPropiedad) {
					options.push({
						cantidad: '10',
						control: comboBox,
						key: 'INPRP',
						valueHigh: '',
						valueLow: indicadorPropiedad
					});
				}

				if (tipoMarea) {
					options.push({
						cantidad: '10',
						control: comboBox,
						key: 'CDMMA',
						valueHigh: '',
						valueLow: tipoMarea
					});
				}

				if (fechaProdIni || fechaProdFin) {
					const isRange = fechaProdIni && fechaProdFin;
					const fecha = !isRange ? fechaProdIni ? fechaProdIni : fechaProdFin : null;

					options.push({
						cantidad: '10',
						control: multiinput,
						key: 'FECCONMOV',
						valueHigh: isRange ? fechaProdFin : "",
						valueLow: isRange ? fechaProdIni : fecha
					});
				}
				/* if (planta) {
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
				}); */

				const body = {
					p_options: [],
					options: options,
					p_rows: numRegistros,
					p_user: this.userOperation
				};

				fetch(`${this.onLocation()}reportepesca/ConsultarPescaDescargada`, {
					method: 'POST',
					body: JSON.stringify(body)
				})
					.then(resp => resp.json())
					.then(data => {
						var sData = data.str_des;
						var tmpData = [];
						var sumCnpcm = 0;
						var sumCnpds = 0;
						for (let index = 0; index < sData.length; index++) {
							const element = sData[index];
							element.visibleMarea = true;
							sumCnpcm += !isNaN(element.CNPCM) ? Number(element.CNPCM) : 0;
							sumCnpds += !isNaN(element.CNPDS) ? Number(element.CNPDS) : 0;
							tmpData.push(element);
						}

						//agregar footer table
						var lastObject = tmpData[tmpData.length - 1];
						var objFooter = {}
						for (var key in lastObject) {
							if (key == "visibleMarea") {
								objFooter[key] = false;
							} else if (key == "visibleInterLoc") {
								objFooter[key] = false;
							} else if (key == "CNPCM") {
								objFooter[key] = parseFloat(sumCnpcm).toFixed(3);
							} else if (key == "CNPDS") {
								objFooter[key] = parseFloat(sumCnpds).toFixed(3);
							} else if (key == "INPRP") {
								objFooter[key] = "P";
							} else if (key == "WERKS") {
								objFooter[key] = "Total General:";
							} else {
								objFooter[key] = null;
							}
						}
						tmpData.push(objFooter);
						this.byId("titulo").setText("Lista de Registros: "+tmpData.length);
						this.getModel("consultaPescaDescargada").setProperty("/items", tmpData);
						BusyIndicator.hide();
					}).catch(error => {
						console.error(error);
						BusyIndicator.hide();
					});

			},

			openCambiarInterlocutor: async function (event) {
				this.getView().getModel().setProperty("/helpArma",{});
				
				let oContext = event.getSource().getBindingContext("consultaPescaDescargada");
				let mareaSelected = oContext.getObject();
				mareaSelected.armador = null;
				this.getModel("consultaPescaDescargada").setProperty("/mareaSelected", mareaSelected);

				//Asignar la descripción del motivo de marea
				await fetch(`${this.onLocation()}dominios/Listar`, {
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
				sap.ui.getCore().byId("idArmadorIni_R").setValue("");
			},
			cambiarInterlocutor: function (event) {
				let mareaSelected = this.getModel("consultaPescaDescargada").getProperty("/mareaSelected");
				// let armador = mareaSelected.armador;
				let armador = sap.ui.getCore().byId("idArmadorIni_R").getValue();
				console.log(armador)

				const body = {
					p_user: this.userOperation,
					p_nrmar: mareaSelected.NRMAR.toString(),
					p_lifnr: armador
				};

				console.log(body);


				fetch(`${this.onLocation()}reportepesca/AgregarInterlocutor`, {
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
					let header = tableColumns[i].getAggregation('header');
					if (header) {
						let headerColId = header.getId();
						let headerCol = sap.ui.getCore().byId(headerColId);
						let headerColValue = headerCol.getText();

						title.push(headerColValue);
					}

				}
				title.splice(title.length - 2, 1);
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
				aCols = this.getColumnsConfig();

				oSettings = {
					workbook: {
						columns: aCols,
						context: {
							sheetName: "CONSULTA DE DESCARGAS"
						}
					},
					dataSource: oRowBinding,
					fileName: 'Consulta de pesca descargada.xlsx',
					worker: false // We need to disable worker because we are using a Mockserver as OData Service
				};

				oSheet = new Spreadsheet(oSettings);
				oSheet.build().finally(function () {
					oSheet.destroy();
				});
			},

			onAbrirAyudaEmbarcacion: function (evt) {
				this.getDialog().open();
			},

			getDialog: function () {
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment("com.tasa.consultapescadescargada.view.Embarcacion", this);
					this.getView().addDependent(this.oDialog);
				}
				return this.oDialog;
			},

			onCerrarEmba: function () {
				this.getDialog().close();
			},

			onSearchEmbarcacion: function () {
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

						this.getModel("consultaPescaDescargada").setProperty("/embarcaciones", embarcaciones);
						this.getModel("consultaPescaDescargada").refresh();

						if (!isNaN(data.p_totalpag)) {
							if (Number(data.p_totalpag) > 0) {
								sap.ui.getCore().byId("goFirstPag").setEnabled(true);
								sap.ui.getCore().byId("goPreviousPag").setEnabled(true);
								sap.ui.getCore().byId("comboPaginacion").setEnabled(true);
								sap.ui.getCore().byId("goLastPag").setEnabled(true);
								sap.ui.getCore().byId("goNextPag").setEnabled(true);
								var tituloTablaEmba = "Página 1/" + Number(data.p_totalpag);
								this.getModel("consultaPescaDescargada").setProperty("/TituloEmba", tituloTablaEmba);
								var numPag = Number(data.p_totalpag) + 1;
								var paginas = [];
								for (let index = 1; index < numPag; index++) {
									paginas.push({
										numero: index
									});
								}
								this.getModel("consultaPescaDescargada").setProperty("/NumerosPaginacion", paginas);
								sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
								this.currentPage = "1";
								this.lastPage = data.p_totalpag;
							} else {
								var tituloTablaEmba = "Página 1/1";
								this.getModel("consultaPescaDescargada").setProperty("/TituloEmba", tituloTablaEmba);
								this.getModel("consultaPescaDescargada").setProperty("/NumerosPaginacion", []);
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

						this.getModel("consultaPescaDescargada").setProperty("/embarcaciones", embarcaciones);
						this.getModel("consultaPescaDescargada").refresh();
						var tituloTablaEmba = "Página " + this.currentPage + "/" + Number(data.p_totalpag);
						this.getModel("consultaPescaDescargada").setProperty("/TituloEmba", tituloTablaEmba);
						sap.ui.getCore().byId("comboPaginacion").setSelectedKey(this.currentPage);
						BusyIndicator.hide();
					}).catch(error => console.log(error));
			},

			onSelectEmba: function (evt) {
				var objeto = evt.getParameter("rowContext").getObject();
				if (objeto) {
					var cdemb = objeto.CDEMB;
					this.byId("inputId0_R").setValue(cdemb);
					this.getDialog().close();
				}
			},

			onCerrarEmba: function () {
				this.getDialog().close();
			},

			clearFields: function () {
				this.byId("centro").setValue(null);
				this.byId("ubicacionPlanta").setSelectedKey(null);
				this.byId("inputId0_R").setValue(null);
				this.byId("indicadorPropiedad").setSelectedKey(null);
				this.byId("tipoMarea").setSelectedKey(null);
				this.byId("numRegistros").setValue(null);
				this.byId("idDateRangeSelec").setValue(null);
				this.getModel("consultaPescaDescargada").setProperty("/items", []);
				this.getModel("consultaPescaDescargada").refresh();
			},

			buscarEmbaFiltro: async function (filtro) {
				BusyIndicator.show(0);
				let embarcaciones = [];
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
						var tmpEmba = [];
						for (let index = 0; index < 200; index++) {
							const element = embarcaciones[index];
							for (var key in filtro) {
								if (element.hasOwnProperty(key)) {
									if (filtro[key] == element[key]) {
										tmpEmba.push(element);
									}
								}
							}
						}
						var tabla = sap.ui.getCore().byId("tblEmbarcaciones");
						var data = {
							data: tmpEmba
						}
						var modelo = new JSONModel(data);
						tabla.setModel(modelo)
						/*this.getModel("consultaPescaDescargada").setProperty("/embarcaciones", tmpEmba);
						this.getModel("consultaPescaDescargada").refresh();*/
						BusyIndicator.hide();
					}).catch(error => console.log(error));
			},

			getColumnsConfig: function () {
				var aColumns = [
					{
						label: "Marea",
						property: "NRMAR",
						type: "number"
					},
					{
						label: "Descarga",
						property: "NRDES",
					},
					{
						label: "Lote",
						property: "NROLOTE",
					},
					{
						label: "Ticket",
						property: "TICKE",
					},
					{
						label: "Centro",
						property: "WERKS",
					},
					{
						label: "Desc. Planta",
						property: "DESCR",
					},
					{
						label: "Ubic. Planta",
						property: "DSUPT",
					},
					{
						label: "Fecha Producción",
						property: "FECCONMOV",
					},
					{
						label: "Embarcación",
						property: "CDEMB",
					},
					{
						label: "Nombre Embarcación",
						property: "NMEMB",
					},
					{
						label: "Matrícula",
						property: "MREMB",
					},
					{
						label: "CBOD",
						property: "CPPMS",
						type: "number",
						scale: 3
					},
					{
						label: "Armador",
						property: "DSEMP",
					},
					{
						label: "Ind. Propiedad",
						property: "DESC_INPRP",
					},
					{
						label: "Puerto Zarpe",
						property: "DSPZA",
					},
					{
						label: "Fecha Zarpe",
						property: "FCZAR",
					},
					{
						label: "Hora Zarpe",
						property: "HOZAR",
					},
					{
						label: "Fecha LLeg Zona",
						property: "FCLLZ",
					},
					{
						label: "Hora LLeg Zona",
						property: "HOLLZ",
					},
					{
						label: "Zona de Pesca",
						property: "CDZPC",
					},
					{
						label: "Fecha Ult Cala",
						property: "FCTCL",
					},
					{
						label: "Hora Ult Cala",
						property: "HOTCL",
					},
					{
						label: "Fecha Salida Zona",
						property: "FCSAZ",
					},
					{
						label: "Hora Salida Zona",
						property: "HOSAZ",
					},
					{
						label: "Puerto Arribo",
						property: "DSPAR",
					},
					{
						label: "Fecha Arribo",
						property: "FCARR",
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
						label: "Pesc. Decl.",
						property: "CNPCM",
						type: "number",
						scale: 3
					},
					{
						label: "Pesc. Desc.",
						property: "CNPDS",
						type: "number",
						scale: 3
					},
					{
						label: "Motivo Marea",
						property: "DESC_CDMMA",
					},
					{
						label: "Especie",
						property: "DSSPC",
					},
					{
						label: "Motivo Limitación",
						property: "DSMLM",
					},
					{
						label: "Desc. Bomba",
						property: "DSBOM",
					},
					{
						label: "Lado Descarga",
						property: "DSLDS",
					},
					{
						label: "Punto Descarga",
						property: "DSPDG",
					},
					{
						label: "Patrón",
						property: "NMPER",
					}
				];
				return aColumns;
			},

			onVerMarea: async function (evt) {
				BusyIndicator.show(0);
				var obj = evt.getSource().getParent().getBindingContext("consultaPescaDescargada").getObject()
				if (obj) {
					var cargarMarea = await this.cargarDatosMarea(obj);
					if (cargarMarea) {
						var modelo = this.getOwnerComponent().getModel("DetalleMarea");
						var modeloConsultaMarea = this.getModel("consultaPescaDescargada");
						var dataModelo = modelo.getData();
						var dataConsultaPescDesc = modeloConsultaMarea.getData();
						var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
						oStore.put("DataModelo", dataModelo);
						oStore.put("ConsultaPescaDescargada", dataConsultaPescDesc);
						oStore.put("AppOrigin", "consultapescadescargada");
						BusyIndicator.hide();
						var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
						oCrossAppNav.toExternal({
							target: {
								semanticObject: "mareaevento",
								action: "display"
							}
						});
					}else{
						BusyIndicator.hide();
					}
				}
			},

			clearFilterEmba: function () {
				sap.ui.getCore().byId("idEmba").setValue(null);
				sap.ui.getCore().byId("idNombEmba").setValue(null);
				sap.ui.getCore().byId("idRucArmador").setValue(null);
				sap.ui.getCore().byId("idMatricula").setValue(null);
				sap.ui.getCore().byId("indicadorPropiedad").setSelectedKey(null);
				sap.ui.getCore().byId("idDescArmador").setValue(null);
				//sap.ui.getCore().byId("comboPaginacion").setVisible(false);
				this.getModel("consultaPescaDescargada").setProperty("/embarcaciones", []);
				this.getModel("consultaPescaDescargada").setProperty("/NumerosPaginacion", []);
				this.getModel("consultaPescaDescargada").refresh();
			},

			onSelectWerks: function (evt) {
				var objeto = evt.getParameter("selectedRow").getBindingContext("consultaPescaDescargada").getObject();
				if (objeto) {
					this.getView().byId("centro").setValue(objeto.WERKS);
				}
			},

			getInterlocutorDialog: function () {
				if (!this.oDialogInterlocutor) {
					this.oDialogInterlocutor = sap.ui.xmlfragment("com.tasa.consultapescadescargada.view.Interlocutor", this);
					this.getView().addDependent(this.oDialogInterlocutor);
				}
				return this.oDialogInterlocutor;
			},

			openIterlocutorDialog: function () {
				this.getInterlocutorDialog().open();
			},

			cerrarInterlocutorDialog: function () {
				this.getInterlocutorDialog().close();
			},

			onSelecInterlocutor: function (evt) {
				var objeto = evt.getSource().getBindingContext("consultaPescaDescargada").getObject();
				if (objeto) {
					var cdemb = objeto.CDEMB;
					this.byId("inputId0_R").setValue(cdemb);
					this.getDialog().close();
				}
			},

			listaArmador: function () {
				BusyIndicator.show(0);
				var body = {
					"codigo": "100"
				}
				fetch(`${this.onLocation()}General/Armador`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						var dataPuerto = data.data;
						console.log(dataPuerto);
						this.getView().getModel("consultaPescaDescargada").setProperty("/listaArmador", dataPuerto)
						BusyIndicator.hide();
					}).catch(error => console.log(error)
					);
			},

			/*getCurrentUser: function () {
				return "FGARCIA"; //utilities.getCurrentUser();
			},*/

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
			},
			onShowSearchTrip: async function(oEvent){
				let sIdInput = oEvent.getSource().getId(),
				oView = this.getView(),
				oModel = this.getModel(),
				sUrl =this.HOST_HELP+".AyudasBusqueda.busqarmadores-1.0.0",
				nameComponent = "busqarmadores",
				idComponent = "busqarmadores",
				oInput = sap.ui.getCore().byId(sIdInput);
				oModel.setProperty("/input",oInput);
	
				if(!this.DialogComponent){
					this.DialogComponent = await Fragment.load({
						name:"com.tasa.consultapescadescargada.view.fragments.BusqArmadores",
						controller:this
					});
					oView.addDependent(this.DialogComponent);
				}
				oModel.setProperty("/idDialogComp",this.DialogComponent.getId());
				
				let compCreateOk = function(){
					BusyIndicator.hide()
				}
				if(this.DialogComponent.getContent().length===0){
					BusyIndicator.show(0);
					const oContainer = new sap.ui.core.ComponentContainer({
						id: idComponent,
						name: nameComponent,
						url: sUrl,
						settings: {},
						componentData: {},
						propagateModel: true,
						componentCreated: compCreateOk,
						height: '100%',
						// manifest: true,
						async: false
					});
					this.DialogComponent.addContent(oContainer);
				}
	
				this.DialogComponent.open();
			},
		});
	});
