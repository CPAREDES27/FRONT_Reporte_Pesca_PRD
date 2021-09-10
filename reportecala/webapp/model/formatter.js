sap.ui.define([], function () {
    "use strict";
    return {
        formatDate: function (d) {
            const date = new Date(d);
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd/MM/yyyy" });

            return oDateFormat.format(date);
        },
        generateCommand: function (value1, value2) {

        }
    };
});