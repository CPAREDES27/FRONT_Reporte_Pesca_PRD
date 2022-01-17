sap.ui.define([], function () {
    "use strict";
    return {
        formatDates: function (d) {
            const date = new Date(d);
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd/MM/yyyy" });

            return oDateFormat.format(date);
        },
        generateCommand: function (value1, value2) {

        },
        formatDate: function (date) {

            var fecha=null;
            if(date){
            fecha= date.split("T")[0];
            fecha=fecha.split("-").reverse().join("/");          
            }

            return fecha;
        },
        formatHour: function (hour) {
            var hora=null;
            if(hour){
                hora= hour.split("T")[1];
                hora= hora.split(":")[0]+":"+hora.split(":")[1];     

            }
            return hora;
        }
    };
});