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

				// this.router = this.getRouter().getTarget("TargetMain").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				this.router = sap.ui.core.UIComponent.getRouterFor(this);
				this.router.getRoute("RouteMain").attachPatternMatched(this.handleRouteMatched, this)
			},
			handleRouteMatched: function () { },
			searchData: function () {
				let option = [];
				let options = [];
				let commands = [];
				let marea = this.byId("marea").getValue();
				let planta = this.byId("planta").getValue();
				let embarcacion = this.byId("embarcacion").getValue();
				let fechaInicio = this.byId("fechaInicio").getValue();
				let fechaFin = this.byId("fechaFin").getValue();
				let numAciertos = this.byId("numAciertos").getValue();

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
					p_user: 'FGARCIA',
					rowcount: numAciertos
				};

				fetch(`${mainUrlServices}reportepesca/ConsultarMareas`, {
					method: 'POST',
					body: JSON.stringify(body)
				})
					.then(resp => resp.json())
					.then(data => {
						this.getModel("listMareas").setProperty("/items", data.s_marea);
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
				const tableItemsBinding = table.getBinding('items');
				const dataTable = table.getBinding('items').oList;
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
					fileName: 'Reporte de TDC CHR.xlsx',
					worker: false // We need to disable worker because we are using a Mockserver as OData Service
				};

				oSheet = new Spreadsheet(oSettings);
				oSheet.build().finally(function () {
					oSheet.destroy();
				});
			}
		});
	});
