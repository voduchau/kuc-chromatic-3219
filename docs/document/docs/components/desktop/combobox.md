---
id: combobox
title: Combobox
sidebar_label: Combobox
---

## Overview

The Combobox component allows the user to find an item among many choices.

<div class="sample-container" id="combobox">
  <div id="sample-container__components"></div>
</div>
<script src="/js/samples/desktop/combobox.js"></script>

---

## Specification

### Property

Here is a list of properties that can be used for modifying the component:

| Name   | Type | Default | Description | Remark |
| :--- | :--- | :--- | :--- | :--- |
| className | string | ""  | Component class name | |
| error | string | ""  | Text to be displayed in error | Error will not be displayed if unspecified or empty |
| id | string | ""  | Component id name | |
| label | string | ""  | Label for the component | Label is not displayed if unspecified or empty |
| value | string | ""  | Component value | No option will be selected if the value is unspecified<br>Will result an error if the value is not a string |
| disabled | boolean | false | Enable/Disable the component | |
| requiredIcon | boolean | false | Show/Hide the required icon | |
| visible | boolean | true | Show/Hide the component | |
| items | Array\<Item\> | []  | List of options to display | Will result an error if the value of items is not an array |
| Item.label | string | null | Text label for each option | If `Item.label` is unspecified, the value of `Item.value` is displayed on the UI |
| Item.value | string | null | Value of each option | Will result an error if setting duplicated value in `Item.value` |

### Event

Here is a list of events that can be specified:

| Name | Type | Description | Remark |
| :--- | :--- | :--- | :--- |
| change | function | Event handler when the value has been changed | It will pass the event object as the argument<br><br>You can receive the following values when used in event.detail<br>event.detail.oldValue : Value before the change<br>event.detail.value : Value after the change |

### Constructor

Combobox(options)<br>
Here is a list of available constructors:

#### Parameter

| Name | Type | Default | Description | Remark |
| :--- | :--- | :--- | :--- | :--- |
| options | object | {} | Object that includes component properties | |

---

## Sample Code

> Please check the [package installation](../../getting-started/quick-start.md#installation) method first.

Here is a sample code when all parameters are specified:

```javascript
const Kuc = Kucs['1.x.x'];

const space = kintone.app.record.getSpaceElement('space');

const combobox = new Kuc.Combobox({
  label: 'Fruit',
  items: [
    { label: 'Banana', value: 'banana' },
    { label: 'Orange', value: 'orange' },
    { label: 'Apple', value: 'apple' },
  ],
  value:  'orange',
  requiredIcon: true,
  error: 'Error occurred!',
  className: 'options-class',
  id: 'options-id',
  visible: true,
  disabled: false
});
space.appendChild(combobox);

combobox.addEventListener('change', event => {
  console.log(event);
});
```
