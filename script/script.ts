class WaterContainer {
  waterContainer: HTMLElement;


  constructor(waterContainer: HTMLElement) {
    this.waterContainer = waterContainer;
    console.log(waterContainer);
}

  changeWaterLevel(waterLevel: number) {

    this.waterContainer.style.height = waterLevel + "%";

    console.log(this.waterContainer);

  }
}

class Manometr {
  arrow: HTMLElement;

  constructor(arrow: HTMLElement) {
    this.arrow = arrow;
  }

  animateArrow(arrowDeg: number) {
    console.log("ArrowDeg =" + arrowDeg);
    this.arrow.style.transform = `rotate(${arrowDeg}deg)`;
  }
}

class Visualization {
  startButton: HTMLElement;
  arrow: Manometr;
  liquids: WaterContainer[];
  manometrInerval: number;
  elektroValve: HTMLElement;
  pump: HTMLElement;
  coilHeater: HTMLElement;
  valve_V102: HTMLElement;
  flow: HTMLElement;
  waterValue: HTMLInputElement;
  WaterLevelInterval: number;
  tempHeatValue: HTMLInputElement;
  tempHealValueInterval: number;

  constructor(
    startButton: HTMLElement,
    arrow: HTMLElement,
    liquids: NodeListOf<HTMLElement>,
    elektroValve: HTMLElement,
    pump: HTMLElement,
    coilHeater: HTMLElement,
    valve_V102: HTMLElement,
    flow: HTMLElement,
    waterValue: HTMLInputElement,
    tempHeatValue: HTMLInputElement
  ) {
    this.startButton = startButton;
    this.arrow = new Manometr(arrow);
    this.liquids = [].map.call(liquids, (liquid) => new WaterContainer(liquid));
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

  selectData(): void {
      setInterval(() => {
        const httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = (data) => {
          // Check if connect has been sucessful
          if (httpRequest.readyState == 4) {
            if (httpRequest.status == 200) {
              console.log("Połączanie zostało nawiązne");
              // Parsing - getting data as JSON file from data.html
              const dataPLC = JSON.parse(httpRequest.response);
               // Saving data as variables to pass them to the code      // + means conversion to the Number type
               // Logical states of the valves
              this.checkElectroValve(+dataPLC.elektrovalve_Logical_State);
              this.checkcoilHeater(+dataPLC.coilHeater_Logical_State);
              this.checkFlow(+dataPLC.flow__Logical_State);
              this.checkPump(+dataPLC.pump_Logical_State);
              this.checkValve_V102(+dataPLC.valveV102_Logical_State);
              // liquid levels in tanks and displayed value
              this.displayWaterLevel(dataPLC.tanks_Analog_Value);
              this.changeWaterLevel(+dataPLC.tanks_Analog_Value);
              // temperature value heater on tank 2
              this.dipslayTempHeatValue(dataPLC.heater_Value);
              // manometer analog value (Pressure)
              this.changeArrowDeg(+dataPLC.manometr_Analog_Value);
            } else
              console.log(
                "There was an error loading the item (TIP - Validate the transferred values)"              );
          }
        };

        httpRequest.open("GET", "data.html", true);
        httpRequest.send();
      }, 2000);
  }

  // check stanow elements in PLC singal ( 0 (inactive) or 1(active) )
  checkElectroValve(elektrovalvePLCLogicalState: number): void {
    if (elektrovalvePLCLogicalState === 1) {
      this.elektroValve.classList.add("--active");
      this.elektroValve.classList.remove("--inactive");
    } else {
      this.elektroValve.classList.add("--inactive");
      this.elektroValve.classList.remove("--active");
    }
  }

  checkPump(pumpPLCLogicalState: number): void {
    
      if (pumpPLCLogicalState === 1) {
        this.pump.classList.add("--active");
        this.pump.classList.remove("--inactive");
      } else {
        this.pump.classList.add("--inactive");
        this.pump.classList.remove("--active");
      }
    
  }

  checkValve_V102(valveV102LogicalState: number): void {
    
      if (valveV102LogicalState === 1) {
        this.valve_V102.classList.add("--active");
        this.valve_V102.classList.remove("--inactive");
      } else {
        this.valve_V102.classList.add("--inactive");
        this.valve_V102.classList.remove("--active");
      }
    }

  checkcoilHeater(coilHeaterPLCLogicalState :number): void {
   
      if ( coilHeaterPLCLogicalState === 1) {
        this.coilHeater.classList.add("--active");
        this.coilHeater.classList.remove("--inactive");
      } else {
        this.coilHeater.classList.add("--inactive");
        this.coilHeater.classList.remove("--active");
      }
    
  }

  checkFlow(flowPLCLogicalState :number): void {
    
      if (flowPLCLogicalState === 1) {
        this.flow.classList.add("--active");
        this.flow.classList.remove("--inactive");
      } else {
        this.flow.classList.add("--inactive");
        this.flow.classList.remove("--active");
      }
  }

  // clear all styles when start simulation
  allDevicesClearStyle(): void {
    const allDevices = [];
    allDevices.push(elektroValve, pump, coilHeater, valve_V102, flow);
    console.log(allDevices);

    for (const device of allDevices) {
      device.classList.remove("--active");
      device.classList.remove("--inactive");
    }
  }

  // display real number with water level in subtitle on continer

  displayWaterLevel(analogValueTank1Inscription: string): void {
 
      this.waterValue.value = analogValueTank1Inscription;
   
  }
 
  dipslayTempHeatValue(tempeHeatValueTank2Inscription: string) :void {

      this.tempHeatValue.value = tempeHeatValueTank2Inscription.toString();
  }

  addListeners(): void {
    this.startButton.addEventListener("click", this.isActiveProces.bind(this));
  }


  changeWaterLevel(analogValuePLC1Number: number) {
    // this.liquids.forEach((liquid) => { // Rozdzielenie tank1 i tank 2   

      this.liquids[0].changeWaterLevel(analogValuePLC1Number);
      let waterLevelTank2Coperation = 100 - analogValuePLC1Number ;
      this.liquids[1].changeWaterLevel(waterLevelTank2Coperation);
    // });
  }

  changeArrowDeg(analogValuePressureManometer: number) {
    console.log("analogValuePressureManometer = " + analogValuePressureManometer);
    this.arrow.animateArrow(analogValuePressureManometer);
  }

  stopInterval() {
    // clearInterval(this.waterLevelInterval);
    clearInterval(this.manometrInerval);
  }

  interval() {
 
    this.manometrInerval = setInterval(this.changeArrowDeg.bind(this), 4000);
  }

  activateButton() {
    this.startButton.classList.add("container-button__button--active");
  }

  // check the element have class and start proces 

  isActiveProces() {
    this.startButton.classList.contains("container-button__button--active")
      ? this.stopProces()
      : this.startProces();
  }

  desactivateButton() {
    this.startButton.classList.remove("container-button__button--active");
  }

  // functions start or stop symulate proces and start button active

  startProces() {
    this.selectData();
    this.interval();
    this.activateButton();
  }

  stopProces() {
    this.stopInterval();
    this.desactivateButton();
    this.allDevicesClearStyle();
    clearInterval(this.WaterLevelInterval);
    clearInterval(this.tempHealValueInterval);
  }
}

const startButton = <HTMLElement>(
  document.querySelector(".container-button__button")
);
const arrow = <HTMLElement>document.querySelector(".manometr__arrow");
const liquids = <NodeListOf<HTMLElement>>(
  document.querySelectorAll(".tank__liquid")
);
const elektroValve = <HTMLElement>document.querySelector(".elektoroValve");
const pump = <HTMLElement>document.querySelector(".pump");
const coilHeater = <HTMLElement>document.querySelector(".coilHeater");
const valve_V102 = <HTMLElement>document.querySelector(".valve_V102");
const flow = <HTMLElement>document.querySelector(".flow");
const waterValue = <HTMLInputElement>(
  document.querySelector(".WaterLevelTank__value")
);
const tempHeatValue = <HTMLInputElement>(
  document.querySelector(".tempHeat__value")
);

const visualization1 = new Visualization(
  startButton,
  arrow,
  liquids,
  elektroValve,
  pump,
  coilHeater,
  valve_V102,
  flow,
  waterValue,
  tempHeatValue
);


  