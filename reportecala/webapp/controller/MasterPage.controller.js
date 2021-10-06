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
		let reporteCalas = [];

		return BaseController.extend("com.tasa.reportecala.controller.MasterPage", {
			formatter: formatter,
			dataTableKeys: [
				'DSZPC',
				'WERKS',
				'DESCR',
				'FECCONMOV',
				'NRMAR',
				'NRDES',
				'CDMMA',
				'NMEMB',
				'MREMB',
				'CPPMS',
				'FIEVN',
				'HIEVN',
				'FFEVN',
				'HFEVN',
				'FIEVN',
				'HIEVN',
				'FFEVN',
				'HFEVN',
				'LTGEO',
				'LNGEO',
				'TEMAR',
				'CNPCM',
				'DTCAL',
				'DSSPC',
				'ZMODA',
				'OBSER',
				'CNPJU',
				'ZMOJU',
				'PORJU',
				'CNPCA',
				'ZMOCA',
				'PORCA',
				'CNPOT',
				'ZMOOT',
				'POROT'
			],
			onInit: function () {
				console.log("prueba 1");
				let oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("tableReporteCalas");

				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				this._oTable = oTable;

				let numCalas = 0;

				this.loadReporteCalas();

				oViewModel = new JSONModel();
				oViewModel.setProperty("/numCalas", numCalas);

				this.setModel(oViewModel, "reporteCala");

				oTable.attachEventOnce("updateFinished", function () {
					oViewModel.setModel("/tableBusyDelay", iOriginalBusyDelay);
				});

				this.loadData()
			},
			loadData: function () {
				let ubicaciones = null;
				let zdoZinprpDom = null;
				let zdoTipoMareaDom = null;

				const bodyDominio = {
					dominios: [
						{
							domname: "UBICPLANTA",
							status: "A"
						},
						{
							domname: "ZINPRP",
							status: "A"
						},
						{
							domname: "ZDO_TIPOMAREA",
							status: "A"
						}
					]
				};

				fetch(`${mainUrlServices}dominios/Listar`,
					{
						method: 'POST',
						body: JSON.stringify(bodyDominio)
					})
					.then(resp => resp.json()).then(data => {
						console.log(data);
						ubicaciones = data.data.find(d => d.dominio == "UBICPLANTA").data;
						zdoZinprpDom = data.data.find(d => d.dominio == "ZINPRP").data;
						zdoTipoMareaDom = data.data.find(d => d.dominio == "ZDO_TIPOMAREA").data;
						this.getModel("reporteCala").setProperty("/zdoZinprpDom", zdoZinprpDom);
						this.getModel("reporteCala").setProperty("/zdoTipoMareaDom", zdoTipoMareaDom);
						this.getModel("reporteCala").setProperty("/ubicaciones", ubicaciones);
					}).catch(error => console.log(error));
			},
			loadReporteCalas: function (event) {
				let options = [];
				let commands = [];
				let centro = this.byId("txtCentro").getValue();
				let ubicacion = this.byId("cbUbicaciones").getSelectedKey();
				let embarcacion = this.byId("txtEmbarcacion").getValue();
				let indicadorPropiedad = this.byId("cbIndicadorPropiedad").getSelectedKey();
				let tipoMarea = this.byId("cbTipoMarea").getSelectedKey();
				let fechaInicioStart = this.byId("dpFechaInicioMareaStart").getValue();
				let fechaInicioEnd = this.byId("dpFechaInicioMareaEnd").getValue();
				let fechaFinStart = this.byId("dpFechaFinMareaStart").getValue();
				let fechaFinEnd = this.byId("dpFechaFinMareaEnd").getValue();
				let cantidad = this.byId("txtCantidad").getValue();

				const input = 'INPUT';
				const multiinput = 'MULTIINPUT';
				const comboBox = "COMBOBOX";
				const multiComboBox = "MULTICOMBOBOX";

				/* if (centro) {
					commands.push(`(WERKS LIKE '${centro}')`);
				}

				if (ubicacion) {
					commands.push(`(CDUPT LIKE '${ubicacion}')`);
				}

				if (embarcacion) {
					commands.push(`(CDEMB LIKE '${embarcacion}')`);
				}

				if (indicadorPropiedad) {
					commands.push(`(INPRP LIKE '${indicadorPropiedad}')`);
				}

				if (tipoMarea) {
					commands.push(`(CDMMA LIKE '${tipoMarea}')`);
				}

				if (fechaInicioStart || fechaInicioEnd) {
					const isRange = fechaInicioStart && fechaInicioEnd;
					const fecha = !isRange ? fechaInicioStart ? fechaInicioStart : fechaInicioEnd : null;
					const operator = isRange ? `BETWEEN '${fechaInicioStart}' AND '${fechaInicioEnd}'` : `LIKE '${fecha}'`;

					commands.push(`(FIMAR ${operator})`);
				}

				if (fechaFinStart || fechaFinEnd) {
					const isRange = fechaFinStart && fechaFinEnd;
					const fecha = !isRange ? fechaFinStart ? fechaFinStart : fechaFinEnd : null;
					const operator = isRange ? `BETWEEN '${fechaFinStart}' AND '${fechaFinEnd}'` : `LIKE '${fecha}'`;

					commands.push(`(FFMAR ${operator})`);
				}

				options = commands.map((c, i) => {
					const option = {
						wa: i > 0 ? `AND ${c}` : c
					};

					return option;
				}); */

				if (centro) {
					options.push({
						cantidad: '10',
						control: input,
						key: 'WERKS',
						valueHigh: '',
						valueLow: centro
					});
				}

				if (ubicacion) {
					options.push({
						cantidad: '10',
						control: comboBox,
						key: 'CDUPT',
						valueHigh: '',
						valueLow: ubicacion
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

				if (fechaInicioStart || fechaInicioEnd) {
					const isRange = fechaInicioStart && fechaInicioEnd;
					const fecha = !isRange ? fechaInicioStart ? fechaInicioStart : fechaInicioEnd : null;

					options.push({
						cantidad: '10',
						control: multiinput,
						key: 'FIMAR',
						valueHigh: isRange ? fechaFinEnd : "",
						valueLow: isRange ? fechaFinStart : fecha
					});
				}

				if (fechaFinStart || fechaFinEnd) {
					const isRange = fechaFinStart && fechaFinEnd;
					const fecha = !isRange ? fechaFinStart ? fechaFinStart : fechaFinEnd : null;

					options.push({
						cantidad: '10',
						control: multiinput,
						key: 'FFMAR',
						valueHigh: isRange ? fechaFinEnd : "",
						valueLow: isRange ? fechaFinStart : fecha
					});
				}

				console.log(options);

				let body = {
					option: [],
					options: options,
					p_user: 'FGARCIA',
					rowcount: cantidad
				};
				let request = fetch(`${mainUrlServices}reportepesca/ConsultarCalas`, {
					method: 'POST',
					body: JSON.stringify(body),
				})
					.then((resp) => resp.json())
					.then((data) => {
						console.log(data);
						reporteCalas = data.s_cala;
						this.getModel("reporteCala").setProperty("/items", reporteCalas);
						this.getModel("reporteCala").setProperty("/numCalas", data.s_cala.length);
					})
					.catch((error) => {
						console.error('Error found: ' + error);
					});
			},
			exportBiometriaToExcel: function (event) {
				if (reporteCalas.length > 0) {
					let tipoMarea = this.byId("cbTipoMarea").getSelectedKey();
					const listNumMareas = reporteCalas.map(n => {
						return {
							NRMAR: n.NRMAR
						};
					});

					const body = {
						ip_cdmma: tipoMarea,
						ip_oper: '',
						it_marea: listNumMareas
					};

					fetch(`${mainUrlServices}reportepesca/ReporteBiometria`, {
						method: 'POST',
						body: JSON.stringify(body)
					})
						.then(resp => resp.json())
						.then(data => {
							const content = data.base64;
							const contentType = 'application/vnd.ms-excel';
							const sliceSize = 512;
							let byteCharacters = window.atob(
								content);
							let byteArrays = [];
							const fileName = 'Reporte_Biometria.xls';

							/**
							 * Convertir base64 a Blob
							 */
							for (let offset = 0; offset < byteCharacters.length; offset +=
								sliceSize) {
								let slice = byteCharacters.slice(offset, offset + sliceSize);
								let byteNumbers = new Array(slice.length);
								for (let i = 0; i < slice.length; i++) {
									byteNumbers[i] = slice.charCodeAt(i);
								}
								let byteArray = new Uint8Array(byteNumbers);
								byteArrays.push(byteArray);
							}
							let blob = new Blob(byteArrays, {
								type: contentType
							});

							/**
							 * Exportar a Excel
							 */
							if (navigator.msSaveBlob) {
								navigator.msSaveBlob(blob, fileName);
							} else {
								let link = document.createElement("a");
								if (link.download !== undefined) {
									let url = URL.createObjectURL(blob);
									link.setAttribute("href", url);
									link.setAttribute("download", fileName);
									link.style.visibility = 'hidden';
									document.body.appendChild(link);
									link.click();
									document.body.removeChild(link);
								}
							}
						})
						.catch(error => console.error(error))
				}
			},
			filterGlobally: function (oEvent) {
				let sQuery = oEvent.getSource().getValue();
				const table = this.byId('tableReporteCalas');
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
				const table = this.byId('tableReporteCalas');
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
				title.splice(10, 1);

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
					this._oTable = this.byId('tableReporteCalas');
				}

				oTable = this._oTable;
				oRowBinding = oTable.getBinding('items');
				aCols = this.createColumnConfig();

				oSettings = {
					workbook: { columns: aCols },
					dataSource: oRowBinding,
					fileName: 'Reporte de calas.xlsx',
					worker: false // We need to disable worker because we are using a Mockserver as OData Service
				};

				oSheet = new Spreadsheet(oSettings);
				oSheet.build().finally(function () {
					oSheet.destroy();
				});
			}
		});
	});
