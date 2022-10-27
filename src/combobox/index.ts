import { html, PropertyValues, svg } from "lit";
import { property, state, queryAll, query } from "lit/decorators.js";
import {
  KucBase,
  generateGUID,
  dispatchCustomEvent,
  createStyleOnHeader,
} from "../base/kuc-base";
import { visiblePropConverter } from "../base/converter";
import { getWidthElmByContext } from "../base/context";
import {
  validateProps,
  validateItems,
  validateValueString,
  validateDuplicatedValues,
  throwErrorAfterUpdateComplete,
} from "../base/validator";
import { ERROR_MESSAGE } from "../base/constant";
import { ComboboxItem, ComboboxProps, ComboboxChangeEventDetail } from "./type";
import { COMBOBOX_CSS } from "./style";
import "../base/label";
import "../base/error";

let exportCombobox;
(() => {
  exportCombobox = window.customElements.get("kuc-combobox");
  if (exportCombobox) {
    return;
  }

  class KucCombobox extends KucBase {
    @property({ type: String, reflect: true, attribute: "class" }) className =
      "";
    @property({ type: String }) error = "";
    @property({ type: String, reflect: true, attribute: "id" }) id = "";
    @property({ type: String }) label = "";
    @property({ type: String }) value = "";
    @property({ type: Boolean }) disabled = false;
    @property({ type: Boolean }) requiredIcon = false;
    @property({
      type: Boolean,
      attribute: "hidden",
      reflect: true,
      converter: visiblePropConverter,
    })
    visible = true;
    @property({ type: Array }) items: ComboboxItem[] = [];

    @state()
    private _selectorVisible = false;

    @query(".kuc-combobox__group")
    private _groupEl!: HTMLDivElement;

    @query(".kuc-combobox__group__toggle")
    private _toggleEl!: HTMLDivElement;

    @query(".kuc-combobox__group__toggle__input")
    private _inputEl!: HTMLInputElement;

    @query(".kuc-combobox__group__select-menu")
    private _menuEl!: HTMLUListElement;

    @queryAll(".kuc-combobox__group__select-menu__item")
    private _itemsEl!: HTMLLIElement[];

    @query("button.kuc-combobox__group__toggle__button")
    private _buttonEl!: HTMLButtonElement;

    @query(".kuc-combobox__group__label")
    private _labelEl!: HTMLDivElement;

    @query(".kuc-combobox__group__select-menu__item")
    private _firstItemEl!: HTMLLIElement;

    @query(".kuc-combobox__group__select-menu__item:last-child")
    private _lastItemEl!: HTMLLIElement;

    @query(".kuc-combobox__group__select-menu__item[aria-selected=true]")
    private _selectedItemEl!: HTMLLIElement;

    @query(".kuc-combobox__group__select-menu__highlight")
    private _highlightItemEl!: HTMLLIElement;

    @query(".kuc-base-error__error")
    private _errorEl!: HTMLDivElement;

    private _timeoutID!: number | null;

    private _GUID: string;

    @state()
    private _searchText = "";

    private _query = "";
    private _matchingItems: ComboboxItem[] = [];

    constructor(props?: ComboboxProps) {
      super();
      this._GUID = generateGUID();
      const validProps = validateProps(props);
      this._handleClickDocument = this._handleClickDocument.bind(this);
      Object.assign(this, validProps);
    }

    shouldUpdate(changedProperties: PropertyValues): boolean {
      if (changedProperties.has("items")) {
        if (!validateItems(this.items)) {
          throwErrorAfterUpdateComplete(this, ERROR_MESSAGE.ITEMS.IS_NOT_ARRAY);
          return false;
        }

        const itemsValues = this.items.map((item) => item.value);
        if (!validateDuplicatedValues(itemsValues)) {
          throwErrorAfterUpdateComplete(
            this,
            ERROR_MESSAGE.ITEMS.IS_DUPLICATED
          );
          return false;
        }
      }

      if (changedProperties.has("value")) {
        if (!validateValueString(this.value)) {
          throwErrorAfterUpdateComplete(
            this,
            ERROR_MESSAGE.VALUE.IS_NOT_STRING
          );
          return false;
        }
      }

      return true;
    }

    willUpdate(changedProperties: PropertyValues) {
      if (changedProperties.has("value")) {
        const selectedLabel = this._getSelectedLabel();
        this._searchText = selectedLabel ? selectedLabel : "";
      }
    }

    render() {
      return html`
        <div class="kuc-combobox__group">
          <div
            class="kuc-combobox__group__label"
            id="${this._GUID}-label"
            ?hidden="${!this.label}"
          >
            <kuc-base-label
              .text="${this.label}"
              .requiredIcon="${this.requiredIcon}"
            ></kuc-base-label>
          </div>
          <div class="kuc-combobox__group__toggle">
            <input
              class="kuc-combobox__group__toggle__input"
              role="combobox"
              type="text"
              .value="${this._searchText}"
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-labelledby="${this._GUID}-label"
              aria-expanded="${this._selectorVisible}"
              aria-required="${this.requiredIcon}"
              ?disabled="${this.disabled}"
              @change="${this._handleChangeComboboxInput}"
              @input="${this._handleInputComboboxInput}"
              @keydown="${this._handleKeyDownComboboxInput}"
              @click="${this._handleClickComboboxInput}"
              @blur="${this._handleBlurComboboxInput}"
            />
            <div class="kuc-combobox__group__toggle__button-icon">
              <button
                class="kuc-combobox__group__toggle__button"
                tabindex="-1"
                type="button"
                ?disabled="${this.disabled}"
                @click="${this._handleClickToggleButton}"
              >
                <span class="kuc-combobox__group__toggle__icon">
                  ${this._getToggleIconSvgTemplate()}
                </span>
              </button>
            </div>
          </div>
          <ul
            class="kuc-combobox__group__select-menu"
            role="listbox"
            aria-hidden="${!this._selectorVisible}"
            ?hidden="${!this._selectorVisible}"
            @mouseleave="${this._handleMouseLeaveMenu}"
            @mousedown="${this._handleMouseDownMenu}"
          >
            ${this._matchingItems.map((item, number) =>
              this._getItemTemplate(item, number)
            )}
          </ul>
          <kuc-base-error
            .text="${this.error}"
            .guid="${this._GUID}"
            ?hidden="${!this.error}"
            ariaLive="assertive"
          ></kuc-base-error>
        </div>
      `;
    }

    firstUpdated() {
      window.addEventListener("resize", () => {
        this._actionResizeScrollWindow();
      });

      window.addEventListener("scroll", () => {
        this._actionResizeScrollWindow();
      });
    }

    async updated(changedProperties: PropertyValues) {
      super.updated(changedProperties);

      await this.updateComplete;
      this._updateContainerWidth();
      if (this._selectorVisible) {
        this._setMenuPosition();
        this._scrollToView();
        if (this._selectedItemEl === null) {
          this._actionClearAllHighlightMenuItem();
        } else {
          this._setHighlightAndActiveDescendantMenu(this._selectedItemEl);
        }

        setTimeout(() => {
          document.addEventListener("click", this._handleClickDocument, true);
        }, 1);
      } else {
        setTimeout(() => {
          document.removeEventListener(
            "click",
            this._handleClickDocument,
            true
          );
        }, 1);
      }
    }

    private _getToggleIconSvgTemplate() {
      return svg`
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M24.2122 15.6665L25 16.1392L19.7332 21.4998H18.2668L13 16.1392L13.7878 15.6665L18.765 20.6866H19.235L24.2122 15.6665Z"
          fill="#3498db"/>
      </svg>
    `;
    }

    private _getItemTemplate(item: ComboboxItem, index: number) {
      const isCheckedItem = this._isCheckedItem(item);
      const text = item.label === undefined ? item.value : item.label;
      let newText = html`${text}`;
      if (this._query && text) {
        const queryIndex = text.indexOf(this._query);
        newText = html`
          ${text.slice(0, queryIndex)}<b>${this._query}</b>${text.slice(
            queryIndex + this._query.length
          )}
        `;
      }

      return html`
        <li
          class="kuc-combobox__group__select-menu__item"
          role="option"
          aria-selected="${isCheckedItem ? "true" : "false"}"
          value="${item.value !== undefined ? item.value : ""}"
          id="${this._GUID}-menuitem-${index}"
          @mousedown="${this._handleMouseDownComboboxItem}"
          @mouseover="${this._handleMouseOverComboboxItem}"
        >
          ${this._getComboboxIconSvgTemplate(isCheckedItem)} ${newText}
        </li>
      `;
    }

    private _getComboboxIconSvgTemplate(checked: boolean) {
      return svg`
      ${
        checked
          ? svg`<svg
          class="kuc-combobox__group__select-menu__item__icon"
          width="11"
          height="9"
          viewBox="0 0 11 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 5L1.5 3L4.5 5.5L9.5 0L11 1.5L4.5 8.5L0 5Z"
            fill="#3498db"/>
        </svg>`
          : ""
      }`;
    }

    private _handleMouseDownComboboxItem(event: MouseEvent) {
      const itemEl = event.target as HTMLLIElement;
      const value = itemEl.getAttribute("value") as string;
      this._actionUpdateValue(value);
    }

    private _handleMouseOverComboboxItem(event: Event) {
      const itemEl = event.target as HTMLLIElement;
      this._actionHighlightMenuItem(itemEl);
    }

    private _handleMouseLeaveMenu() {
      this._actionClearAllHighlightMenuItem();
    }

    private _handleMouseDownMenu(event: MouseEvent) {
      event.preventDefault();
    }

    private _handleClickToggleButton(event: MouseEvent): void {
      event.preventDefault();
      this._inputEl.focus();
      this._inputEl.select();
      this._resetToggleInputValue();
      this._actionToggleMenu();
    }

    private _handleInputComboboxInput(event: Event) {
      event.stopPropagation();

      this._searchText = this._inputEl.value;
      this._query = this._inputEl.value;
      this._setMatchingItems();
    }

    private _handleClickComboboxInput(event: Event) {
      event.stopPropagation();
      this._inputEl.select();
      this._setMatchingItems();
    }

    private _handleChangeComboboxInput(event: Event) {
      event.stopPropagation();
    }

    private _handleBlurComboboxInput(event: Event) {
      this._resetToggleInputValue();
    }

    private _handleClickDocument(event: MouseEvent) {
      if (
        event.target === this._toggleEl ||
        this._toggleEl.contains(event.target as HTMLElement)
      ) {
        event.stopPropagation();
      }
      this._actionHideMenu();
    }

    private _handleKeyDownComboboxInput(event: KeyboardEvent) {
      switch (event.key) {
        case "Up": // IE/Edge specific value
        case "ArrowUp": {
          event.preventDefault();
          if (!this._selectorVisible) {
            this._actionShowMenu();
            break;
          }
          this._actionHighlightPrevMenuItem();
          break;
        }
        case "Tab":
          if (this._selectorVisible) {
            this._actionHideMenu();
          }
          break;
        case "Down": // IE/Edge specific value
        case "ArrowDown": {
          event.preventDefault();
          if (!this._selectorVisible) {
            this._actionShowMenu();
            break;
          }
          this._actionHighlightNextMenuItem();
          break;
        }
        case "Enter": {
          event.preventDefault();
          const itemEl = this._highlightItemEl as HTMLLIElement;
          if (itemEl === null) break;

          const value = itemEl.getAttribute("value") as string;
          this._actionUpdateValue(value);
          this._actionHideMenu();
          break;
        }
        case "Escape": {
          event.preventDefault();
          if (this._selectorVisible) {
            event.stopPropagation();
          }
          this._resetToggleInputValue();
          this._actionHideMenu();
          break;
        }
        case "Home": {
          if (this._selectorVisible) {
            event.preventDefault();
            this._actionHighlightFirstMenuItem();
          }
          break;
        }
        case "End": {
          if (this._selectorVisible) {
            event.preventDefault();
            this._actionHighlightLastMenuItem();
          }
          break;
        }
        default:
          break;
      }
    }

    private _getSelectedLabel() {
      const items = this.items.filter((item, index) =>
        this._isCheckedItem(item)
      );
      if (items.length === 0) return "";
      return items[0].label === undefined ? items[0].value : items[0].label;
    }

    private _actionShowMenu() {
      this._inputEl.focus();
      this._selectorVisible = true;

      if (this._query === "") {
        this._matchingItems = this.items;
      }
    }

    private _actionHideMenu() {
      this._selectorVisible = false;
      this._actionRemoveActiveDescendant();
    }

    private _actionToggleMenu() {
      if (this._selectorVisible) {
        this._actionHideMenu();
        return;
      }

      this._actionShowMenu();
    }

    private _actionHighlightFirstMenuItem() {
      this._setHighlightAndActiveDescendantMenu(this._firstItemEl);
    }

    private _actionHighlightLastMenuItem() {
      this._setHighlightAndActiveDescendantMenu(this._lastItemEl);
    }

    private _actionHighlightPrevMenuItem() {
      let prevItem = null;
      if (this._highlightItemEl !== null) {
        prevItem = this._highlightItemEl
          .previousElementSibling as HTMLLIElement;
        this._highlightItemEl.classList.remove(
          "kuc-combobox__group__select-menu__highlight"
        );
      }

      if (prevItem === null) {
        prevItem = this._lastItemEl;
      }

      this._setHighlightAndActiveDescendantMenu(prevItem);
    }

    private _actionHighlightNextMenuItem() {
      let nextItem = null;
      if (this._highlightItemEl !== null) {
        nextItem = this._highlightItemEl.nextElementSibling as HTMLLIElement;
        this._highlightItemEl.classList.remove(
          "kuc-combobox__group__select-menu__highlight"
        );
      }

      if (nextItem === null) {
        nextItem = this._firstItemEl;
      }

      this._setHighlightAndActiveDescendantMenu(nextItem);
    }

    private _actionClearAllHighlightMenuItem() {
      this._itemsEl.forEach((itemEl: HTMLLIElement) => {
        itemEl.classList.remove("kuc-combobox__group__select-menu__highlight");
      });
      this._actionRemoveActiveDescendant();
    }

    private _setHighlightAndActiveDescendantMenu(
      selectedItemEl: HTMLLIElement
    ) {
      this._actionHighlightMenuItem(selectedItemEl);
      this._actionSetActiveDescendant(selectedItemEl.id);
      this._scrollToView();
    }

    private _actionHighlightMenuItem(item: HTMLLIElement) {
      this._actionClearAllHighlightMenuItem();
      item.classList.add("kuc-combobox__group__select-menu__highlight");
    }

    private _actionUpdateValue(value: string) {
      if (this.value === value) {
        this._resetToggleInputValue();
        return;
      }
      const detail: ComboboxChangeEventDetail = {
        oldValue: this.value,
        value: value,
      };
      this.value = value;
      this._query = "";
      dispatchCustomEvent(this, "change", detail);
    }

    private _actionSetActiveDescendant(value?: string) {
      if (value !== undefined && this._inputEl !== null) {
        this._inputEl.setAttribute("aria-activedescendant", value);
      }
    }

    private _actionRemoveActiveDescendant() {
      this._inputEl.removeAttribute("aria-activedescendant");
    }

    private _setMatchingItems() {
      const regex = new RegExp(this._query, "gi");
      const matchingItems = this.items.filter((item) => {
        if (item.label) {
          return item.label.match(regex);
        } else if (item.value) {
          return item.value.match(regex);
        }
        return false;
      });

      if (matchingItems.length === 0) {
        this._matchingItems = [];
        this._actionHideMenu();
      } else {
        this._matchingItems = matchingItems;
        this._actionShowMenu();
      }
    }

    private _updateContainerWidth() {
      const MIN_WIDTH = 180;
      let labelWidth = this._labelEl.getBoundingClientRect().width;
      if (labelWidth === 0) labelWidth = getWidthElmByContext(this._labelEl);
      labelWidth = labelWidth > MIN_WIDTH ? labelWidth : MIN_WIDTH;
      this._groupEl.style.width = labelWidth + "px";
    }

    private _getScrollbarWidthHeight() {
      const scrollDiv = document.createElement("div");
      scrollDiv.style.cssText =
        "overflow: scroll; position: absolute; top: -9999px;";
      document.body.appendChild(scrollDiv);
      const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      const scrollbarHeight = scrollDiv.offsetHeight - scrollDiv.clientHeight;
      document.body.removeChild(scrollDiv);
      return { scrollbarWidth, scrollbarHeight };
    }

    private _getDistanceToggleButton() {
      const { scrollbarWidth, scrollbarHeight } =
        this._getScrollbarWidthHeight();

      const isWindowRightScrollbarShow =
        document.body.scrollHeight > window.innerHeight;
      const isWindowBottomScrollbarShow =
        document.body.scrollWidth > window.innerWidth;

      const toTop = this._toggleEl.getBoundingClientRect().top;
      const toBottom =
        window.innerHeight -
        this._toggleEl.getBoundingClientRect().bottom -
        (isWindowBottomScrollbarShow ? scrollbarHeight : 0);
      const toLeft = this._toggleEl.getBoundingClientRect().left;
      const toRight =
        window.innerWidth -
        this._toggleEl.getBoundingClientRect().left -
        (isWindowRightScrollbarShow ? scrollbarWidth : 0);

      return { toTop, toBottom, toLeft, toRight };
    }

    private _setMenuPositionAboveOrBelow() {
      this._menuEl.style.height = "auto";
      this._menuEl.style.bottom = "auto";
      this._menuEl.style.overflowY = "";

      const menuHeight = this._menuEl.getBoundingClientRect().height;
      const distanceToggleButton = this._getDistanceToggleButton();
      if (distanceToggleButton.toBottom >= menuHeight) return;

      if (distanceToggleButton.toBottom < distanceToggleButton.toTop) {
        // Above
        const errorHeight = this._errorEl.offsetHeight
          ? this._errorEl.offsetHeight + 16
          : 0;
        this._menuEl.style.bottom = `${
          this._toggleEl.offsetHeight + errorHeight
        }px`;
        if (distanceToggleButton.toTop >= menuHeight) return;
        this._menuEl.style.height = `${distanceToggleButton.toTop}px`;
        this._menuEl.style.overflowY = "scroll";
      } else {
        // Below
        this._menuEl.style.height = `${distanceToggleButton.toBottom}px`;
        this._menuEl.style.overflowY = "scroll";
      }
    }

    private _setMenuPositionLeftOrRight() {
      this._menuEl.style.right = "auto";

      const menuWidth = this._menuEl.getBoundingClientRect().width;
      const distanceToggleButton = this._getDistanceToggleButton();
      if (
        // Right
        distanceToggleButton.toRight >= menuWidth ||
        distanceToggleButton.toLeft < menuWidth ||
        distanceToggleButton.toRight < 0
      )
        return;

      // Left
      const right = this._toggleEl.offsetWidth - distanceToggleButton.toRight;
      this._menuEl.style.right = right > 0 ? `${right}px` : "0px";
    }

    private _setMenuPosition() {
      this._setMenuPositionAboveOrBelow();
      this._setMenuPositionLeftOrRight();
    }

    private _scrollToView() {
      if (!this._highlightItemEl || !this._menuEl) return;

      const menuElClientRect = this._menuEl.getBoundingClientRect();
      const highlightItemClientRect =
        this._highlightItemEl.getBoundingClientRect();

      if (highlightItemClientRect.top < menuElClientRect.top) {
        this._menuEl.scrollTop -=
          menuElClientRect.top - highlightItemClientRect.top;
      }

      if (menuElClientRect.bottom < highlightItemClientRect.bottom) {
        this._menuEl.scrollTop +=
          highlightItemClientRect.bottom - menuElClientRect.bottom;
      }
    }

    private _actionResizeScrollWindow() {
      if (this._timeoutID || !this._selectorVisible) return;
      this._timeoutID = window.setTimeout(() => {
        this._timeoutID = null;
        this._setMenuPosition();
      }, 50);
    }

    private _isCheckedItem(item: ComboboxItem) {
      return item.value === this.value;
    }

    private _resetToggleInputValue() {
      const selectedLabel = this._getSelectedLabel();
      if (this._searchText !== selectedLabel) {
        this._searchText = selectedLabel ? selectedLabel : "";
      }

      this._query = "";
    }
  }
  window.customElements.define("kuc-combobox", KucCombobox);
  createStyleOnHeader(COMBOBOX_CSS);
  exportCombobox = KucCombobox;
})();

const Combobox = exportCombobox as any;
export { Combobox };
