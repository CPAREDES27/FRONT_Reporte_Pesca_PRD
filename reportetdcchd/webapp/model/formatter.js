sap.ui.define([], function () {
    "use strict";
    return {
        formatDate: function (d) {
            const date = new Date(d);
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd/MM/yyyy" });

            return oDateFormat.format(date);
        },
        formatDateTime: function (d) {
            const date = new Date(d);
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd/MM/yyyy HH:mm:ss" });

            return oDateFormat.format(date);
        },
        calcularHoras: function (fecha1, hora1, fecha2, hora2) {
            return this.calcularHoras(fecha1, hora1, fecha2, hora2);
        },
        calcularMinutos: function (fecha1, hora1, fecha2, hora2) {
            return (this.calcularHoras(fecha1, hora1, fecha2, hora2) * 24).toFixed(2);
        },
        generateCommand: function (param, value1, value2) {
            const isRange = value1 && value2;
            const valueSelected = !isRange ? value1 ? value1 : value2 : null;
            const valuesType = typeof value1;
            const operator = isRange ? `BETWEEN '${value1}' AND '${value2}'` : `EQ '${valueSelected}'`;

            return `(${param} ${operator})`;
        },
        formatBodegNumber: function (bodeg) {
            const num1 = parseInt(bodeg.CDBOD);
            const num2 = parseInt(bodeg.CAPES);

            return `${num1}(${num2})`;
        }
    };
});
