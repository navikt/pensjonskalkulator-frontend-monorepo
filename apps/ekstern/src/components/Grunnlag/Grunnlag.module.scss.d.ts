import globalClassNames from "../../style.d";
declare const classNames: typeof globalClassNames & {
  readonly section: "section";
  readonly "navds-accordion__item": "navds-accordion__item";
  readonly "navds-accordion__item--open": "navds-accordion__item--open";
  readonly sectionHeader: "sectionHeader";
  readonly description: "description";
};
export = classNames;
