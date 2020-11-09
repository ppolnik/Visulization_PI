var WaterContainer = /** @class */ (function () {
    function WaterContainer(waterContainer) {
        this.waterContainer = waterContainer;
        console.log(waterContainer);
    }
    WaterContainer.prototype.changeWaterLevel = function (waterLevel) {
        this.waterContainer.style.height = waterLevel + "%";
        console.log(this.waterContainer);
    };
    return WaterContainer;
}());
var Manometr = /** @class */ (function () {
    function Manometr(arrow) {
        this.arrow = arrow;
    }
    Manometr.prototype.animateArrow = function (arrowDeg) {
        console.log("ArrowDeg =" + arrowDeg);
        this.arrow.style.transform = "rotate(" + arrowDeg + "deg)";
    };
    return Manometr;
}());
var Visualization = /** @class */ (function () {
    function Visualization(startButton, arrow, liquids, elektroValve, pump, coilHeater, valve_V102, flow, waterValue, tempHeatValue) {
        this.startButton = startButton;
        this.arrow = new Manometr(arrow);
        this.liquids = [].map.call(liquids, function (liquid) { return new WaterContainer(liquid); });
        this.elektroValve = elektroValve;
        this.pump = pump;
        this.coilHeater = coilHeater;
        this.valve_V102 = valve_V102;
        this.flow = flow;
        this.waterValue = waterValue;
        this.tempHeatValue = tempHeatValue;
        this.addListeners();
    }
    // click button and start simulation
    Visualization.prototype.selectData = function () {
        var _this = this;
        setInterval(function () {
            var httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = function (data) {
                // Sprawdzenie czy połączenie zostało nawiązane i przebieglo pomyslnie
                if (httpRequest.readyState == 4) {
                    if (httpRequest.status == 200) {
                        console.log("Połączanie zostało nawiązne");
                        // Parsownie - uzyskiwanie danych w postaci pliku JSON z pliku data.html
                        var dataPLC = JSON.parse(httpRequest.response);
                        // Zapisywanie danych w postaci zmiennych aby przekazac je do kodu              // + oznacza kowersje na typ Number
                        // Stany logiczne zaworow
                        _this.checkElectroValve(+dataPLC.elektrovalve_Logical_State);
                        _this.checkcoilHeater(+dataPLC.coilHeater_Logical_State);
                        _this.checkFlow(+dataPLC.flow__Logical_State);
                        _this.checkPump(+dataPLC.pump_Logical_State);
                        _this.checkValve_V102(+dataPLC.valveV102_Logical_State);
                        // poziomy cieczy w zbiornikach i wyswietlana wartosc
                        _this.displayWaterLevel(dataPLC.tanks_Analog_Value);
                        _this.changeWaterLevel(+dataPLC.tanks_Analog_Value);
                        // wartosc temperatury grzalki w zbiorniku
                        _this.dipslayTempHeatValue(dataPLC.heater_Value);
                        // wartosc cisnienia manometru z sygnalu anaogowego
                        _this.changeArrowDeg(+dataPLC.manometr_Analog_Value);
                    }
                    else
                        console.log("Wystąpił błąd podczas ładowania elemntu ( TIP - Sprawdz poprawność przekazywanych wartosci )");
                }
            };
            httpRequest.open("GET", "data.html", true);
            httpRequest.send();
        }, 2000);
    };
    // check stanow elements in PLC singal ( 0 (inactive) or 1(active) )
    Visualization.prototype.checkElectroValve = function (elektrovalvePLCLogicalState) {
        if (elektrovalvePLCLogicalState === 1) {
            this.elektroValve.classList.add("--active");
            this.elektroValve.classList.remove("--inactive");
        }
        else {
            this.elektroValve.classList.add("--inactive");
            this.elektroValve.classList.remove("--active");
        }
    };
    Visualization.prototype.checkPump = function (pumpPLCLogicalState) {
        if (pumpPLCLogicalState === 1) {
            this.pump.classList.add("--active");
            this.pump.classList.remove("--inactive");
        }
        else {
            this.pump.classList.add("--inactive");
            this.pump.classList.remove("--active");
        }
    };
    Visualization.prototype.checkValve_V102 = function (valveV102LogicalState) {
        if (valveV102LogicalState === 1) {
            this.valve_V102.classList.add("--active");
            this.valve_V102.classList.remove("--inactive");
        }
        else {
            this.valve_V102.classList.add("--inactive");
            this.valve_V102.classList.remove("--active");
        }
    };
    Visualization.prototype.checkcoilHeater = function (coilHeaterPLCLogicalState) {
        if (coilHeaterPLCLogicalState === 1) {
            this.coilHeater.classList.add("--active");
            this.coilHeater.classList.remove("--inactive");
        }
        else {
            this.coilHeater.classList.add("--inactive");
            this.coilHeater.classList.remove("--active");
        }
    };
    Visualization.prototype.checkFlow = function (flowPLCLogicalState) {
        if (flowPLCLogicalState === 1) {
            this.flow.classList.add("--active");
            this.flow.classList.remove("--inactive");
        }
        else {
            this.flow.classList.add("--inactive");
            this.flow.classList.remove("--active");
        }
    };
    // clear all styles when start simulation
    Visualization.prototype.allDevicesClearStyle = function () {
        var allDevices = [];
        allDevices.push(elektroValve, pump, coilHeater, valve_V102, flow);
        console.log(allDevices);
        for (var _i = 0, allDevices_1 = allDevices; _i < allDevices_1.length; _i++) {
            var device = allDevices_1[_i];
            device.classList.remove("--active");
            device.classList.remove("--inactive");
        }
    };
    // display real number with water level in subtitle on continer
    Visualization.prototype.displayWaterLevel = function (analogValueTank1Inscription) {
        this.waterValue.value = analogValueTank1Inscription;
    };
    Visualization.prototype.dipslayTempHeatValue = function (tempeHeatValueTank2Inscription) {
        this.tempHeatValue.value = tempeHeatValueTank2Inscription.toString();
    };
    Visualization.prototype.addListeners = function () {
        this.startButton.addEventListener("click", this.isActiveProces.bind(this));
    };
    Visualization.prototype.getRandomNumber = function () {
        return Math.floor(Math.random() * 100 + 1);
    };
    Visualization.prototype.getRandomNumberWithRange = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    Visualization.prototype.changeWaterLevel = function (analogValuePLC1Number) {
        // this.liquids.forEach((liquid) => { // Rozdzielenie tank1 i tank 2   
        this.liquids[0].changeWaterLevel(analogValuePLC1Number);
        var waterLevelTank2Coperation = 100 - analogValuePLC1Number;
        this.liquids[1].changeWaterLevel(waterLevelTank2Coperation);
        // });
    };
    Visualization.prototype.changeArrowDeg = function (analogValuePressureManometer) {
        console.log("analogValuePressureManometer = " + analogValuePressureManometer);
        this.arrow.animateArrow(analogValuePressureManometer);
    };
    Visualization.prototype.stopInterval = function () {
        // clearInterval(this.waterLevelInterval);
        clearInterval(this.manometrInerval);
    };
    Visualization.prototype.interval = function () {
        // this.waterLevelInterval = setInterval(
        //   this.changeWaterLevel.bind(this),
        //   5000
        // );
        this.manometrInerval = setInterval(this.changeArrowDeg.bind(this), 4000);
    };
    Visualization.prototype.activateButton = function () {
        this.startButton.classList.add("container-button__button--active");
    };
    // check the element have class and start proces or
    Visualization.prototype.isActiveProces = function () {
        this.startButton.classList.contains("container-button__button--active")
            ? this.stopProces()
            : this.startProces();
    };
    Visualization.prototype.desactivateButton = function () {
        this.startButton.classList.remove("container-button__button--active");
    };
    // functions start or stop symulate proces and start button active
    Visualization.prototype.startProces = function () {
        this.selectData();
        this.interval();
        this.activateButton();
    };
    Visualization.prototype.stopProces = function () {
        this.stopInterval();
        this.desactivateButton();
        this.allDevicesClearStyle();
        clearInterval(this.WaterLevelInterval);
        clearInterval(this.tempHealValueInterval);
    };
    return Visualization;
}());
var startButton = (document.querySelector(".container-button__button"));
var arrow = document.querySelector(".manometr__arrow");
var liquids = (document.querySelectorAll(".tank__liquid"));
var elektroValve = document.querySelector(".elektoroValve");
var pump = document.querySelector(".pump");
var coilHeater = document.querySelector(".coilHeater");
var valve_V102 = document.querySelector(".valve_V102");
var flow = document.querySelector(".flow");
var waterValue = (document.querySelector(".WaterLevelTank__value"));
var tempHeatValue = (document.querySelector(".tempHeat__value"));
var visualization1 = new Visualization(startButton, arrow, liquids, elektroValve, pump, coilHeater, valve_V102, flow, waterValue, tempHeatValue);
