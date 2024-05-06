import globalClassNames from "../../style.d";
declare const classNames: typeof globalClassNames & {
  readonly section: "section";
  readonly paragraph: "paragraph";
  readonly button: "button";
};
export = classNames;
