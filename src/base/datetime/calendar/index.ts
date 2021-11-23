import { html, PropertyValues } from "lit";
import { state, property, query } from "lit/decorators.js";
import { KucBase } from "../../kuc-base";
import "./header";
import "./body";
import "./footer";

export class BaseDateTimeCalendar extends KucBase {
  @property({ type: String }) language = "en";
  @property({ type: String, reflect: true }) value = "";

  @query(".kuc-base-datetime-calendar__group")
  private _baseCalendarGroupEl!: HTMLDivElement;

  @state() _month = 1;
  @state() _year = 2021;

  render() {
    return html`
      ${this._getStyleTagTemplate()}
      <div class="kuc-base-datetime-calendar__group">
        <kuc-base-datetime-calendar-header
          .year="${this._year}"
          .month="${this._month}"
          .language="${this.language}"
          @kuc:calendar-header-change="${this._handleCalendarHeaderChange}"
        ></kuc-base-datetime-calendar-header>
        <kuc-base-datetime-calendar-body
          .year="${this._year}"
          .month="${this._month}"
          .value="${this.value}"
          .language="${this.language}"
          @kuc:calendar-body-change-date="${this._handleCalendarBodyChangeDate}"
        ></kuc-base-datetime-calendar-body>
        <kuc-base-datetime-calendar-footer
          .language="${this.language}"
        ></kuc-base-datetime-calendar-footer>
      </div>
    `;
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has("value")) this._updateValue();
    this._calculateBodyCalendarPosition();
    super.updated(changedProperties);
  }

  private _calculateBodyCalendarPosition() {
    const dateTimePickerEl = this._baseCalendarGroupEl.closest(
      ".kuc-date-picker__group"
    ) as HTMLDivElement;
    if (!dateTimePickerEl) return;

    const dateInputEl = dateTimePickerEl.querySelector(
      ".kuc-base-date__input"
    ) as HTMLInputElement;
    if (!dateInputEl) return;

    const dateHeight = dateTimePickerEl.offsetHeight;
    const dateInputTop = dateInputEl.offsetTop;
    let dateTop = dateInputTop + dateInputEl.offsetHeight;
    if (dateInputEl.getBoundingClientRect().top > dateHeight) {
      dateTop = dateInputTop - dateHeight;
    }

    const baseDatetimeCalendarEl = this._baseCalendarGroupEl.parentElement;
    if (!baseDatetimeCalendarEl) return;
    baseDatetimeCalendarEl.style.top = dateTop + "px";
    baseDatetimeCalendarEl.style.left = dateInputEl.offsetLeft + "px";
  }

  private _getStyleTagTemplate() {
    return html`
      <style>
        .kuc-base-datetime-calendar__group {
          display: inline-block;
          box-sizing: border-box;
          width: 336px;
          padding: 32px 32px 24px;
          background: #ffffff;
          box-shadow: 0 0 8px 2px rgb(0 0 0 / 10%);
          text-align: center;
          font-size: 13px;
        }
      </style>
    `;
  }

  private _handleCalendarHeaderChange(event: CustomEvent) {
    const { year, month } = this._separateValue(event.detail.value);
    this._year = year;
    this._month = month;
  }

  private _handleCalendarBodyChangeDate(event: CustomEvent) {
    const { year, month } = this._separateValue(event.detail.value);
    this._year = year;
    this._month = month;
  }

  private _updateValue() {
    if (this.value === "") return;

    const { year, month } = this._separateValue(this.value);
    this._year = year;
    this._month = month;
  }

  private _separateValue(value: string) {
    const dateParts = value.split("-");
    return {
      year: parseInt(dateParts[0], 10),
      month: parseInt(dateParts[1], 10)
    };
  }
}

if (!window.customElements.get("kuc-base-datetime-calendar")) {
  window.customElements.define(
    "kuc-base-datetime-calendar",
    BaseDateTimeCalendar
  );
}
