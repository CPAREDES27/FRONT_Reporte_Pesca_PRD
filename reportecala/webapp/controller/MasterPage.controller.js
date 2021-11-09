sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"sap/ui/core/BusyIndicator"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, Controller, JSONModel, formatter, Filter, FilterOperator, exportLibrary, Spreadsheet, BusyIndicator) {
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

				this.primerOption = [];
				this.segundoOption = [];
				this.currentPage = "";
				this.lastPage = "";
			},
			loadData: function () {
				BusyIndicator.show(0);
				let ubicaciones = null;
				let zdoZinprpDom = null;
				let zdoTipoMareaDom = null;
				let centros = [];

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

					const bodyAyudaBusqueda = {
						"nombreAyuda": "BSQPLANTAS",
						"p_user": this.getCurrentUser()
					};
				
					fetch(`${mainUrlServices}General/AyudasBusqueda/`,
					{
						method: 'POST',
						body: JSON.stringify(bodyAyudaBusqueda)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Busqueda: ", data);
						centros = data.data;
						this.getModel("reporteCala").setProperty("/centros", centros);
						BusyIndicator.hide();
					}).catch(error => console.log(error));
			},
			loadReporteCalas: function () {
				BusyIndicator.show(0);
				let options = [];
				let commands = [];
				let centro = this.byId("txtCentro").getValue();
				let ubicacion = this.byId("cbUbicaciones").getSelectedKey();
				let embarcacion = this.byId("embarcacion").getValue();
				let indicadorPropiedad = this.byId("cbIndicadorPropiedad").getSelectedKey();
				let tipoMarea = this.byId("cbTipoMarea").getSelectedKey();
				/*let fechaInicioStart = this.byId("dpFechaInicioMareaStart").getValue();
				let fechaInicioEnd = this.byId("dpFechaInicioMareaEnd").getValue();
				let fechaFinStart = this.byId("dpFechaFinMareaStart").getValue();
				let fechaFinEnd = this.byId("dpFechaFinMareaEnd").getValue();*/
				let cantidad = this.byId("txtCantidad").getValue();

				let fechaInicioStart = null;
				let fechaInicioEnd = null;
				var valueDateRange = this.byId("idDateRangeIniMar").getValue();
				if(valueDateRange){
					var valDtrIni = valueDateRange.split("-")[0].trim();
					var valDtrFin = valueDateRange.split("-")[1].trim();
					if(valDtrIni && valDtrFin){
						fechaInicioStart = valDtrIni.split("/")[2].concat(valDtrIni.split("/")[1], valDtrIni.split("/")[0]);
						fechaInicioEnd = valDtrFin.split("/")[2].concat(valDtrFin.split("/")[1], valDtrFin.split("/")[0]);
					}
				}

				let fechaFinStart = null;
				let fechaFinEnd = null;
				var valueDateRange = this.byId("idDateRangeFinMar").getValue();
				if(valueDateRange){
					var valDtrIni = valueDateRange.split("-")[0].trim();
					var valDtrFin = valueDateRange.split("-")[1].trim();
					if(valDtrIni && valDtrFin){
						fechaFinStart = valDtrIni.split("/")[2].concat(valDtrIni.split("/")[1], valDtrIni.split("/")[0]);
						fechaFinEnd = valDtrFin.split("/")[2].concat(valDtrFin.split("/")[1], valDtrFin.split("/")[0]);
					}
				}

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
						valueHigh: isRange ? fechaInicioEnd : "",
						valueLow: isRange ? fechaInicioStart : fecha
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
					p_user: this.getCurrentUser(),
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
						BusyIndicator.hide();
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
				const table = this.byId('tableReporteCalas');
				let tableColumns = table.getColumns();
				const dataTable = table.getBinding('rows').oList;
				console.log(tableColumns);

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
				oRowBinding = oTable.getBinding('rows');
				aCols = this.getColumnsConfig();

				oSettings = {
					workbook: { 
						columns: aCols,
						context: {
							sheetName: "REPORTE DE CALAS"
						} 
					},
					dataSource: oRowBinding,
					fileName: 'Reporte de calas.xlsx',
					worker: false // We need to disable worker because we are using a Mockserver as OData Service
				};

				oSheet = new Spreadsheet(oSettings);
				oSheet.build().finally(function () {
					oSheet.destroy();
				});
			},

			clearFields: function(){
				this.byId("txtCentro").setValue(null);
				this.byId("cbUbicaciones").setSelectedKey(null);
				this.byId("embarcacion").setValue(null);
				this.byId("cbIndicadorPropiedad").setSelectedKey(null);
				this.byId("cbTipoMarea").setSelectedKey(null);
				this.byId("idDateRangeIniMar").setValue(null);
				this.byId("idDateRangeFinMar").setValue(null);
				this.getModel("reporteCala").setProperty("/items", []);
				this.getModel("reporteCala").refresh();
			},

			onAbrirAyudaEmbarcacion: function(){
				this.getDialog().open();
			},

			onCerrarEmba: function(){
				this.getDialog().close();
			},

			onSelectEmba: function(evt){
				var objeto = evt.getParameter("rowContext").getObject();
				if(objeto){
					var cdemb = objeto.CDEMB;
					this.byId("embarcacion").setValue(cdemb);
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

						this.getModel("reporteCala").setProperty("/embarcaciones", embarcaciones);
						this.getModel("reporteCala").refresh();

						if (!isNaN(data.p_totalpag)) {
							if (Number(data.p_totalpag) > 0) {
								sap.ui.getCore().byId("goFirstPag").setEnabled(true);
								sap.ui.getCore().byId("goPreviousPag").setEnabled(true);
								sap.ui.getCore().byId("comboPaginacion").setEnabled(true);
								sap.ui.getCore().byId("goLastPag").setEnabled(true);
								sap.ui.getCore().byId("goNextPag").setEnabled(true);
								var tituloTablaEmba = "Página 1/" + Number(data.p_totalpag);
								this.getModel("reporteCala").setProperty("/TituloEmba", tituloTablaEmba);
								var numPag = Number(data.p_totalpag) + 1;
								var paginas = [];
								for (let index = 1; index < numPag; index++) {
									paginas.push({
										numero: index
									});
								}
								this.getModel("reporteCala").setProperty("/NumerosPaginacion", paginas);
								sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
								this.currentPage = "1";
								this.lastPage = data.p_totalpag;
							} else {
								var tituloTablaEmba = "Página 1/1";
								this.getModel("reporteCala").setProperty("/TituloEmba", tituloTablaEmba);
								this.getModel("reporteCala").setProperty("/NumerosPaginacion", []);
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

						this.getModel("reporteCala").setProperty("/embarcaciones", embarcaciones);
						this.getModel("reporteCala").refresh();
						var tituloTablaEmba = "Página " + this.currentPage + "/" + Number(data.p_totalpag);
						this.getModel("reporteCala").setProperty("/TituloEmba", tituloTablaEmba);
						sap.ui.getCore().byId("comboPaginacion").setSelectedKey(this.currentPage);
						BusyIndicator.hide();
					}).catch(error => console.log(error));
			},

			getDialog: function(){
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment("com.tasa.reportecala.view.Embarcacion", this);
					this.getView().addDependent(this.oDialog);
				}
				return this.oDialog;
			},

			getColumnsConfig: function(){
				var aColumns = [
					{
						label: "CO_RCPE",
  						property: "NRMAR",
						type: "number"
					},
					{
						label: "FE_INI_RCPE",
  						property: "FIEVN"
					},
					{
						label: "FE_FIN_RCPE",
  						property: "FFEVN"
					},
					{
						label: "HR_INI_RCPE",
  						property: "HIEVN"
					},
					{
						label: "HR_FIN_RCPE",
  						property: "HFEVN"
					},
					{
						label: "LA_RCPE",
  						property: "LTGEO"
					},
					{
						label: "LO_RCPE",
  						property: "LNGEO"
					},
					{
						label: "LATIT",
  						property: "LATSG",
						type: "number",
						scale: 2
					},
					{
						label: "LONGI",
  						property: "LOGSG",
						type: "number",
						scale: 2
					},
					{
						label: "TE_RCPE",
  						property: "TEMAR",
						type: "number",
						scale: 2
					},
					{
						label: "QT_PES_RCPE",
  						property: "CNPCM",
						type: "number",
						scale: 2
					},
					{
						label: "FG_PLAN",
  						property: "INPRP"
					},
					{
						label: "CO_EMBA",
  						property: "CDEMB"
					},
					{
						label: "CO_ESPE",
  						property: "CDSPC"
					},
					{
						label: "NO_EMBA",
  						property: "NMEMB"
					},
					{
						label: "QT_CBOD",
  						property: "CPPMS",
						type: "number",
						scale: 2
					},
					{
						label: "DE_ARTI",
  						property: "DSSPC"
					},
					{
						label: "CO_LOCA",
  						property: "CDZPC"
					},
					{
						label: "PERIODO",
  						property: "DTCAL"
					},
					{
						label: "MODA",
  						property: "ZMODA",
						type: "number",
						scale: 2
					},
					{
						label: "MATRICULA",
  						property: "MREMB"
					},
					{
						label: "CENTRO",
  						property: "WERKS"
					},
					{
						label: "Zona de Pesca",
  						property: "DSZPC"
					},
					{
						label: "Planta",
  						property: "DESCR"
					},
					{
						label: "Fech Producc",
  						property: "FECCONMOV"
					},
					{
						label: "Num Descarga",
  						property: "NRDES"
					},
					{
						label: "Tipo Marea",
  						property: "DESC_TIPOMAREA"
					},
					{
						label: "Observaciones",
  						property: "OBSER"
					},
					{
						label: "JUREL - PESCA DECLARADA",
  						property: "CNPJU",
						type: "number"
					},
					{
						label: "JUREL - MODA",
  						property: "ZMOJU",
						type: "number"
					},
					{
						label: "JUREL - % INCIDENCIA",
  						property: "PORJU",
						type: "number"
					},
					{
						label: "CABALLA - PESCA DECLARADA",
  						property: "CNPCA",
						type: "number"
					},
					{
						label: "CABALLA - MODA",
  						property: "ZMOCA",
						type: "number"
					},
					{
						label: "CABALLA - % INCIDENCIA",
  						property: "PORCA",
						type: "number"
					},
					{
						label: "OTRAS ESPECIES - PESCA DECLARADA",
  						property: "CNPOT",
						type: "number"
					},
					{
						label: "OTRAS ESPECIES - MODA",
  						property: "ZMOOT",
						type: "number"
					},
					{
						label: "OTRAS ESPECIES - % INCIDENCIA",
  						property: "POROT",
						type: "number"
					},
					{
						label: "Fecha Inicio Cala",
  						property: "FICAL"
					},
					{
						label: "Hora Inicio Cala",
  						property: "HICAL"
					},
					{
						label: "Fecha Fin Cala",
  						property: "FFCAL"
					},
					{
						label: "Hora Fin Cala",
  						property: "HFCAL"
					}
				];
				return aColumns;
			},
			
			clearFilterEmba: function(){
				sap.ui.getCore().byId("idEmba").setValue(null);
				sap.ui.getCore().byId("idNombEmba").setValue(null);
				sap.ui.getCore().byId("idRucArmador").setValue(null);
				sap.ui.getCore().byId("idMatricula").setValue(null);
				sap.ui.getCore().byId("indicadorPropiedad").setSelectedKey(null);
				sap.ui.getCore().byId("idDescArmador").setValue(null);
				//sap.ui.getCore().byId("comboPaginacion").setVisible(false);
				this.getModel("reporteCala").setProperty("/embarcaciones", []);
				this.getModel("reporteCala").setProperty("/NumerosPaginacion", []);
				this.getModel("reporteCala").refresh();
			},

			onSelectWerks: function (evt) {
				var objeto = evt.getParameter("selectedRow").getBindingContext("reporteCala").getObject();
				if (objeto) {
					this.getView().byId("txtCentro").setValue(objeto.WERKS);
				}
			},

			getCurrentUser: function(){
				return "FGARCIA";
			}
		});
	});