sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
    "./utilities"
], function (JSONModel, Device, utilities) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createMareaModel: function(){
			var sData = {
				Cabecera: {
                    INDICADOR: "",
					NRMAR: "",
                    CDMMA: "",
                    OBMAR: "",
                    CDEMB: "",
                    NMEMB: "",
                    MREMB: "",
                    CDPTA: "",
                    CDEMP: "",
                    NAME1: "",
                    INPRP: "",
                    WERKS: "",
                    CNVPS: "",
                    FCVPS: "",
                    LIFNR: "",
                    CPPMS: "",
                    TCBPS: "",
                    CBODP: 0,
                    ESCMA: "",
                    FCCRE: "",
                    HRCRE: "",
                    ATCRE: "",
                    FCMOD: "",
                    HRMOD: "",
                    ATMOD: "",
                    CDTEV: "",
                    DESC_CDTEV: "",
                    FIEVN: "",
                    DESC_CDMMA: "",
                    TXTNOTIF: "",
                    TXTNOTIF1: "",
                    TERRORES: false,
                    VEDAVERIF: false,
                    FECVEDMAX: "",
                    NUEVOARM: "",
                    OBSCOMB: "",
                    CantTotalPescDecla: ""
				},
                DatosGenerales: {
					CDEMB: "",
                    NMEMB: "",
                    CDEMP: "",
                    NAME1: "",
                    CDSPE: "",
                    DSSPE: "",
                    CDMMA: "",
                    CDPTA: "",
                    INUBC: "",
                    ESMAR: "",
                    FEARR: "",
                    HEARR: "",
                    FIMAR: "",
                    HIMAR: "",
                    FFMAR: "",
                    HFMAR: "",
                    FEMAR: "",
                    HAMAR: "",
                    WERKS: "",
                    NuevoArmador: {
                        RUC: "",
                        RAZON: "",
                        CALLE: "",
                        DISTRITO: "",
                        PROVINCIA: "",
                        DEPARTAMENTO: ""
                    }
				},
                Eventos: {
					TituloEventos: "",
                    Lista: [],
                    LeadSelEvento: 0
				},
                Incidental: [],
                Biometria: [],
                DetalleReserva: {
                    NRRSV: "",
                    DESC_ESRSV: "",
                    CDEMB: "",
                    NMEMB: "",
                    NRMAR: "",
                    DESC_CDMMA: "",
                    DESC_CDTEV: "",
                    FHRSV: "",
                    Lista: []
                },
                Suministro: [],
                ReservasCombustible: [],
                ConfigReservas: {
                    BWART: "",
                    MATNR: "",
                    WERKS: "",
                    Almacenes: []
                },
                EmbaComb: {
                    CDTAN: "",
                    MANDT: "",
                    CDEMB: "",
                    CPSDM: "",
                    CVPMS: "",
                    CPPMS: "",
                    CVADM: "",
                    STCMB: ""
                },
                VentaCombustible: {},
                DistribFlota: {
                    Indicador: "",
                    CDPTA: "",
                    DESCR: "",
                    CDPTO: "",
                    DSPTO: "",
                    LTGEO: "",
                    IntLatPuerto: 0,
                    LNGEO: "",
                    IntLonPuerto: 0,
                    FEARR: "",
                    HEARR: "",
                    EMPLA: "",
                    WKSPT: "",
                    CDUPT: "",
                    DSEMP: "",
                    INPRP: ""
                },
                MareaAnterior:{
                    NRMAR: "",
                    ESMAR: "",
                    CDMMA: "",
                    FEMAR: "",
                    HAMAR: "",
                    FXMAR: "",
                    HXMAR: "",
                    FIMAR: "",
                    HIMAR: "",
                    FFMAR: "",
                    HFMAR: "",
                    ESCMA: "",
                    DESC_CDMMA: "",
                    EventoMarAnt: {
                        NREVN: "",
                        CDTEV: "",
                        DESC_CDTEV: "",
                        FIEVN: "",
                        HIEVN: "",
                        FFEVN: "",
                        HFEVN: ""
                    }
                },
                EsperaMareaAnt: {

                },
                MareaCLH: {
                    NRMAR: "",
                    EventoCLH:{
                        FIEVN: "",
                        HIEVN: "",
                        NREVN: "",
                        CDTEV: "",
                        HorometrosCLH:[]
                    }
                },
                Config: {
					visibleArmadorComercial: true,
                    visibleLinkCrearArmador: true,
                    visibleLinkSelecArmador: false,
                    visibleArmadorRuc: false,
                    visibleArmadorRazon: false,
                    visibleArmadorCalle: false,
                    visibleArmadorDistrito: false,
                    visibleArmadorProvincia: false,
                    visibleArmadorDepartamento: false,
                    visibleMotMarea: true,
                    visibleUbiPesca: true,
                    visibleEstMarea: true,
                    visibleFecHoEta: true,
                    visibleFechIni: true,
                    visibleFechFin: true,
                    visibleTabReserva: true,
                    visibleTabVenta: true,
                    visibleTabSepComb: true,
                    readOnlyFechIni: true,
                    readOnlyEstaMar: true,
                    visibleReserva1: false,
                    visibleReserva2: false,
                    visibleReserva3: false,
                    visibleBtnNuevaReserva: false,
                    visibleCheckReserva: true,
                    visibleAnulaReserva: true,
					datosCombo: {
                        Departamentos: [],
                        MotivosMarea: [],
                        UbicPesca: [],
                        EstMar: [],
                        TipoEventos: [],
                        Plantas: []
                    }
				},
                FormNewMarea: {
                    Planta: "",
                    Embarcacion: "",
                    EmbarcacionDesc: ""
                },
                DataSession:{
                    User: "FGARCIA", // utilities.getCurrentUser(),
                    IsAllOk: false,
                    IsRollngComb: false,
                    IsRolRadOpe: false,
                    MareaReabierta: false,
                    RolFlota: "",
                    SoloLectura: false,
                    Type: ""
                },
                RolesFlota:{
                    RolRadOpe: [
                        "pcd:portal_content/com.tasa.SistemaFlota/com.tasa.Roles/com.tasa.flota_ro",
                        "pcd:portal_content/com.tasa.SistemaFlota/com.tasa.Roles/com.tasa.flota_rcp",
                        "pcd:portal_content/com.tasa.SistemaFlota/com.tasa.Roles/com.tasa.flota_ro_protesto"
                    ],
                    RolIngCom: [
                        "pcd:portal_content/com.tasa.SistemaFlota/com.tasa.Roles/com.tasa.flota_acc"
                    ]
                },
                Utils:{
                    VedaVerificada: true,
                    BtnEnabled: false,
                    TextoConfirmacion: "",
                    VisibleEstCierre: false,
                    VisibleObsvComb: false,
                    OpSistFrio : false,
                    TipoEvento : "1",
                    FlagVistaBiometria : false,
                    NroEvento_Incidental : "",
                    NroEvento_Biometria : "",
                    TipoConsulta:"",
                    MessageItemsDM: [],
                    MessageItemsEP: []
                },
                InputsDescargas :{
                    CentPlanta : "",
                    DescEmbarcacion : "",
                    DescPlanta : "",
                    Embarcacion : "",
                    Estado : "",
                    FechInicio : "",
                    HoraInicio : "",
                    Matricula : "",
                    Planta : "",
                    TipoPesca : ""
                },
                calendarioPescaCHD :[],
                calendarioPescaCHI :[],
                calendarioPescaVED :[],
                Constantes:{
                    CodUbicSur: "",
                    PorcCalRangComb: "",
                    ValMaxFlujPanga: 250
                }
			};
			var oModel = new JSONModel(sData);
			return oModel;
		},

        createConstantsUtility: function(){
            var data = {
                CARACTERNUEVO: "N",
                CARACTEREDITAR: "E",
                CARACTERBORRAR: "D"
            };
            var oModel = new JSONModel(data);
			return oModel;
        }

	};
});