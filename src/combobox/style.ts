export const COMBOBOX_CSS = `
  kuc-combobox,
  kuc-combobox *,
  kuc-combobox:lang(en),
  kuc-combobox:lang(en) * {
    font-family: "HelveticaNeueW02-45Ligh", Arial,
      "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
  }
  kuc-combobox:lang(ja),
  kuc-combobox:lang(ja) * {
    font-family: "メイリオ", "Hiragino Kaku Gothic ProN", Meiryo,
      sans-serif;
  }
  kuc-combobox:lang(zh),
  kuc-combobox:lang(zh) * {
    font-family: "微软雅黑", "Microsoft YaHei", "新宋体", NSimSun, STHeiti,
      Hei, "Heiti SC", sans-serif;
  }
  kuc-combobox:lang(zh-TW),
  kuc-combobox:lang(zh-TW) * {
    font-family: "微軟正黑體", "Microsoft JhengHei", "新宋体", NSimSun, STHeiti, Hei, "Heiti SC", sans-serif;
  }
  kuc-combobox {
    position: relative;
    display: inline-block;
    font-size: 14px;
    color: #333333;
    width: 168px;
    line-height: 1.5;
  }
  kuc-combobox[hidden] {
    display: none;
  }
  .kuc-combobox__group {
    border: none;
    padding: 0px;
    height: auto;
    display: inline-block;
    width: 100%;
    margin: 0px;
    position: relative;
  }
  .kuc-combobox__group__label {
    padding: 4px 0px 8px 0px;
    display: inline-block;
    white-space: nowrap;
  }
  .kuc-combobox__group__label[hidden] {
    display: none;
  }
  .kuc-combobox__group__toggle {
    position: relative;
    display: flex;
  }
  .kuc-combobox__group__toggle__input {
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    box-shadow: 2px 2px 4px #f5f5f5 inset, -2px -2px 4px #f5f5f5 inset;
    border: 1px solid #e3e7e8;
    background-color: #ffffff;
    color: #000000;
    font-size: 14px;
    line-height: 1.5;
    padding: 0 40px 0 8px;
    margin: 0;
  }
  .kuc-combobox__group__toggle__input:focus {
    outline: none;
    border: 1px solid #3498db;
    background-color: #e2f2fe;
    box-shadow: none;
  }
  .kuc-combobox__group__toggle__input:disabled,
  .kuc-combobox__group__toggle__button:disabled {
    background-color: #d4d7d7;
    box-shadow: none;
    cursor: not-allowed;
    color: #888888;
  }
  .kuc-combobox__group__toggle__button-icon {
    position: absolute;
    right: 0px;
    top: 2px;
    border-left: 1px solid #e3e7e8;
  }
  .kuc-combobox__group__toggle__button {
    width: 40px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
    border-style: none;
    background-color: transparent;
    cursor: pointer;
  }
  .kuc-combobox__group__toggle__icon {
    display: inline-block;
    font-size: 0;
  }
  .kuc-combobox__group__select-menu {
    min-width: 280px;
    padding: 8px 0;
    border: 1px solid #e3e7e8;
    box-sizing: border-box;
    background-color: #ffffff;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    position: absolute;
    z-index: 2000;
    margin: 0;
    list-style: none;
  }
  .kuc-combobox__group__select-menu[hidden] {
    display: none;
  }
  .kuc-combobox__group__select-menu__item {
    padding: 8px 16px 8px 24px;
    line-height: 1;
    position: relative;
    cursor: pointer;
    white-space: nowrap;
  }
  .kuc-combobox__group__select-menu__item__icon {
    position: absolute;
    top: 50%;
    left: 6px;
    margin-top: -5px;
  }
  .kuc-combobox__group__select-menu__item[aria-selected="true"] {
    color: #3498db;
  }
  .kuc-combobox__group__select-menu__highlight[role="option"] {
    background-color: #e2f2fe;
  }
`;
