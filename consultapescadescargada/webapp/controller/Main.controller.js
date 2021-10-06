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
	'sap/ui/export/Spreadsheet'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, JSONModel, Fragment, formatter, BusyIndicator, MessageBox, Filter, FilterOperator, exportLibrary, Spreadsheet) {
		"use strict";

		var EdmType = exportLibrary.EdmType;

		const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';

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
						control: comboBox,
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
					p_user: "FGARCIA"
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
			},
			filterGlobally: function (oEvent) {
				let sQuery = oEvent.getSource().getValue();
				const table = this.byId('tableData');
				const tableItemsBinding = table.getBinding('items');
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
				oRowBinding = oTable.getBinding('items');
				aCols = this.createColumnConfig();

				oSettings = {
					workbook: { columns: aCols },
					dataSource: oRowBinding,
					fileName: 'Consulta de pesca descargada.xlsx',
					worker: false // We need to disable worker because we are using a Mockserver as OData Service
				};

				oSheet = new Spreadsheet(oSettings);
				oSheet.build().finally(function () {
					oSheet.destroy();
				});
			}
		});
	});
