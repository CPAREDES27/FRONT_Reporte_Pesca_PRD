sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, Controller, JSONModel, formatter, Filter, FilterOperator, exportLibrary, Spreadsheet) {
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

				this.setModel(oViewModel, "consultaMareas");
				this.loadData();

			},
			handleSelectionChange: function (event) {
				console.log(event.getParameter("changedItem"));
			},
			handleSelectionFinish: function (event) {
				let selectedItems = event.getParameter("selectedItems");
				console.log(selectedItems);

			},
			loadData: function () {
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
						this.getModel("consultaMareas").setProperty("/zinprpDom", zinprpDom);
						this.getModel("consultaMareas").setProperty("/zcdmmaDom", zcdmmaDom);
					}).catch(error => console.log(error));
			},
			searchData: function (event) {
				let options = [];
				let commands = [];
				let mareaLow = parseInt(this.byId("mareaLow").getValue());
				let mareaHigh = parseInt(this.byId("mareaHigh").getValue());
				let plantaLow = this.byId("plantaLow").getValue();
				let plantaHigh = this.byId("plantaHigh").getValue();
				let embarcacionLow = this.byId("embarcacionLow").getValue();
				let embarcacionHigh = this.byId("embarcacionHigh").getValue();
				let propiedad = this.byId("propiedad").getSelectedKey();
				let motivos = this.byId("motivos").getSelectedKeys();
				let fechaInicio = this.byId("fechaInicio").getValue();
				let fechaFin = this.byId("fechaFin").getValue();
				let numRegistros = this.byId("numRegistros").getValue();

				const input = 'INPUT';
				const multiinput = 'MULTIINPUT';
				const comboBox = "COMBOBOX";
				const multiComboBox = "MULTICOMBOBOX";

				console.log(motivos);

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
						key: "WERKS",
						valueHigh: isMulti ? plantaHigh : "",
						valueLow: isMulti ? plantaLow : planta
					});
				}

				if (embarcacionLow || embarcacionHigh) {
					const isMulti = embarcacionHigh && embarcacionLow;
					const embarcacion = isMulti ? embarcacionLow ? embarcacionLow : embarcacionHigh : null;

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

				/* if ((mareaLow || mareaLow === 0) || (mareaHigh || mareaHigh === 0)) {
					commands.push(formatter.generateCommand("NRMAR", mareaLow, mareaHigh));
				}

				if (motivoIni || motivoFin) {
					commands.push(formatter.generateCommand("CDMMA", motivoIni, motivoFin));
				}

				if (plantaLow || plantaHigh) {
					commands.push(formatter.generateCommand("WERKS", plantaLow, plantaHigh));
				}

				if (embarcacionLow || embarcacionHigh) {
					commands.push(formatter.generateCommand("CDEMB", embarcacionLow, embarcacionHigh));
				}

				if (propiedad) {
					commands.push(formatter.generateCommand("INPRP", propiedad));
				}

				if (fechaInicio || fechaFin) {
					commands.push(formatter.generateCommand("FIMAR", fechaInicio, fechaFin));
				}

				options = commands.map((c, i) => {
					const option = {
						wa: i > 0 ? `AND ${c}` : c
					};

					return option;
				}); */

				console.log(options);

				let body = {
					option: [],
					options: options,
					p_user: "FGARCIA",
					rowcount: numRegistros
				};

				fetch(`${mainUrlServices}reportepesca/ConsultarMareas`, {
					method: 'POST',
					body: JSON.stringify(body)
				})
					.then(resp => resp.json())
					.then(data => {

						console.log(data);

						this.getModel("consultaMareas").setProperty("/items", data.s_marea);
						this.getModel("consultaMareas").setProperty("/numCalas", data.s_marea.length);

					})
					.catch(error => console.error(error))
			},
			detalleMarea: function (event) {
				console.log(event);
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
				oRowBinding = oTable.getBinding('items');
				aCols = this.createColumnConfig();

				oSettings = {
					workbook: { columns: aCols },
					dataSource: oRowBinding,
					fileName: 'Consulta de mareas.xlsx',
					worker: false // We need to disable worker because we are using a Mockserver as OData Service
				};

				oSheet = new Spreadsheet(oSettings);
				oSheet.build().finally(function () {
					oSheet.destroy();
				});
			}
		});
	});
