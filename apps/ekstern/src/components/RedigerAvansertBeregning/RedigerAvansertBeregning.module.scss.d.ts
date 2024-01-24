import globalClassNames from "../../style.d";
declare const classNames: typeof globalClassNames & {
  readonly container: "container";
  readonly container__hasMobilePadding: "container__hasMobilePadding";
  readonly form: "form";
  readonly separator: "separator";
  readonly spacer: "spacer";
  readonly label: "label";
  readonly description: "description";
  readonly descriptionText: "descriptionText";
  readonly ingress: "ingress";
  readonly button: "button";
};
export = classNames;
