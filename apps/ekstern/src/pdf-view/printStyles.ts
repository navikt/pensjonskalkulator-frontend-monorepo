// Shared print styles for both iframe and @media print approaches
export const PRINT_STYLES = `
  @page { margin: 1cm; }
  body { color: #23262A; font-family: 'Source Sans 3', 'Source Sans Pro', Arial, sans-serif; font-size: 16px; line-height: 1.4; margin: 0; padding: 20px; }
  h1 { margin: 0; padding-left: 0; text-align: left; }
  h2 { margin-top: 1em; }
  h4 { padding: 1.5em 0 0.5em; }
  h4.utenlandsopphold-title { padding: 0; }
  table { width: 100%; border-collapse: collapse; table-layout: auto; margin: 0; }
  th, tr, .afp-grunnlag-title { border-bottom: 1px solid rgb(128 128 128); }
  thead th { border-bottom: 2px solid rgb(128 128 128); font-weight: bold; text-align: center; white-space: nowrap; }
  th, td { padding: 12px 8px; }
  tr td { margin-right: 10px; text-align: center; }
  tr.header-with-logo { border: none; margin: 0; }
  tr.header-with-logo td { padding: 0; }
  .pdf-table-wrapper-row, .pdf-table-type2 tbody > tr:last-child { border-bottom: none; }
  .pdf-table-type2 tbody > tr:last-child { font-weight: bold; }
  td.pdf-td-type2 { vertical-align: top; width: 33%; padding-top: 0; padding-right: 8px; }
  table.alert-box { border: 2px solid #0214317d; border-radius: 8px; }
  div.pdf-metadata { margin-top: -1em; }
  div.utenlandsopphold-land-item { border: 1px solid rgb(2 20 49 / 49%); border-radius: 8px; padding: 8px; margin-bottom: 1em; }
  .display-inline { display: inline; }
  .nowrap { white-space: nowrap; }
  .logoContainer svg { width: 72px; height: auto; padding: 0; margin: 0; }
  .infoIconContainer svg { width: 16px; height: 16px; }
  .print-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(39, 39, 39, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-family: 'Source Sans 3', Arial, sans-serif;
    font-size: 18px;
    color: #ffffff;
  }
  @media print {
    .print-overlay { display: none; }
  }
`
