import Scene from "../canvas/Scene";
import { deg2rad } from "../utils/MathUtils";
import { RotatingArc } from "../canvas/shapes/arcs";

export default class Scenario extends Scene {
  constructor(id) {
    super(id);

    // gradations
    this.drawGradation();

    // arcs
    this.arcs = [];
    this.nArcs = 2;
    for (let i = 0; i < this.nArcs; i++) {
      const arc_ = new RotatingArc(
        this.width / 2,
        this.height / 2,
        this.mainRadius + (i - this.nArcs / 2) * this.deltaRadius,
        i != 0 && i != this.nArcs - 1 ? deg2rad(Math.random() * 360) : 0,
        i != 0 && i != this.nArcs - 1
          ? deg2rad(Math.random() * 360)
          : deg2rad(360)
      );
      this.arcs.push(arc_);
    }

    // debug
    this.params["line-width"] = 2;
    this.params.speed = 1;
    this.params.color = "#ffffff";
    if (this.debug.active) {
      this.debugFolder
        .add(this.params, "line-width", 1, 10)
        .onChange(() => this.drawUpdate());
      this.debugFolder.add(this.params, "speed", -2, 2, 0.25);
      this.debugFolder.addColor(this.params, "color");
    }

    // Add a customTime property
    this.customTime = null;
  }

  setHour(hour) {
    if (!this.customTime) {
      this.customTime = new Date();
    }
    this.customTime.setHours(hour);
  }

  setMinute(minute) {
    if (!this.customTime) {
      this.customTime = new Date();
    }
    this.customTime.setMinutes(minute);
  }

  setSecond(second) {
    if (!this.customTime) {
      this.customTime = new Date();
    }
    this.customTime.setSeconds(second);
  }

  drawLine(x, y, length, angle) {
    this.context.save();
    this.context.beginPath();

    this.context.translate(x, y);
    this.context.rotate(angle); // ! radian

    this.context.moveTo(-length / 2, 0);
    this.context.lineTo(length / 2, 0);
    this.context.stroke();

    this.context.closePath();
    this.context.restore();
  }

  resize() {
    super.resize();

    this.mainRadius = this.width < this.height ? this.width : this.height;
    this.mainRadius *= 0.5;
    this.mainRadius *= 0.65;
    this.deltaRadius = this.mainRadius * 0.075;

    if (!!this.arcs) {
      this.arcs.forEach((e, index) => {
        e.x = this.width / 2;
        e.y = this.height / 2;
        e.radius =
          this.mainRadius + (index - this.arcs.length / 2) * this.deltaRadius;
      });
    }

    this.drawUpdate();
  }

  update() {
    if (!super.update()) return;
    this.drawUpdate();
  }

  drawUpdate() {
    this.clear();

    this.context.lineCap = "round";
    this.context.strokeStyle = this.params.color;
    this.context.lineWidth = this.params["line-width"];

    this.drawGradation();
    if (!!this.arcs) {
      this.arcs.forEach((arc) => {
        if (this.params["is-update"])
          arc.update(this.globalContext.time.delta / 1000, this.params.speed);
        arc.draw(this.context);
      });

      this.drawTime();
      this.drawClockHands();
    }
  }

  drawGradation() {
    const nGradation_ = 12;
    for (let i = 0; i < nGradation_; i++) {
      const angle_ = (2 * Math.PI * i) / nGradation_ + Math.PI / 2;
      const x_ =
        this.width / 2 +
        (this.mainRadius - this.deltaRadius / 2) * Math.cos(angle_);
      const y_ =
        this.height / 2 +
        (this.mainRadius - this.deltaRadius / 2) * Math.sin(angle_);
      const length_ = this.deltaRadius * (this.nArcs - 1);
      this.drawLine(x_, y_, length_, angle_);
    }
  }

  drawTime() {
    const now = new Date().toLocaleString("en-US", {
      timeZone: this.debug.timezone,
    });
    const time = new Date(now);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    const timeStr = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    this.context.font = "30px Arial";
    this.context.fillStyle = "white";

    this.context.fillText(timeStr, 10, 50);
  }

  drawLineWithArrow(x, y, length, angle) {
    this.context.save();
    this.context.beginPath();

    this.context.translate(x, y);
    this.context.rotate(angle);

    this.context.moveTo(0, 0);
    this.context.lineTo(length, 0);

    this.context.stroke();

    this.context.closePath();
    this.context.restore();
  }

  drawClockHands() {
    const now = this.customTime
      ? this.customTime
      : new Date().toLocaleString("en-US", { timeZone: this.debug.timezone });
    const time = new Date(now);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    const secondAngle = Math.PI * 2 * (seconds / 60) - Math.PI / 2;
    const minuteAngle = Math.PI * 2 * (minutes / 60) - Math.PI / 2;
    const hourAngle = Math.PI * 2 * ((hours % 12) / 12) - Math.PI / 2;

    this.context.strokeStyle = "white";
    this.drawLineWithArrow(
      this.width / 2,
      this.height / 2,
      this.mainRadius * 0.9,
      secondAngle
    );

    this.context.strokeStyle = "white";
    this.drawLineWithArrow(
      this.width / 2,
      this.height / 2,
      this.mainRadius * 0.8,
      minuteAngle
    );

    this.context.strokeStyle = "white";
    this.drawLineWithArrow(
      this.width / 2,
      this.height / 2,
      this.mainRadius * 0.5,
      hourAngle
    );
  }
}
