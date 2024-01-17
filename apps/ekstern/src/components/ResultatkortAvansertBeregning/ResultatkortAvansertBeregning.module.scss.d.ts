import globalClassNames from "../../style.d";
declare const classNames: typeof globalClassNames & {
  readonly card: "card";
  readonly list: "list";
  readonly listTitle: "listTitle";
  readonly listDescription: "listDescription";
  readonly button: "button";
};
export = classNames;
