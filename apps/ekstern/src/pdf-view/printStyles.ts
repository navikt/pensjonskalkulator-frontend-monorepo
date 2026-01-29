// Shared print styles for both desktop popup and mobile print approaches
export const PRINT_STYLES = `
  @font-face {
    font-family: 'Source Sans 3';
    src: url('https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @page { margin: 1cm; }
  html { font-size: 16px; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  body { color: #23262A; font-family: 'Source Sans 3', 'Source Sans Pro', Arial, sans-serif; font-size: 16px; line-height: 1.4; margin: 0; padding: 20px; }
  h1 { font-size: 24px; font-weight: 600; margin: 0; padding-left: 0; text-align: left; }
  h2 { font-size: 20px; font-weight: 600; margin-top: 1em; }
  h3 { font-size: 18px; font-weight: 600; }
  h4 { font-size: 16px; font-weight: 600; padding: 1.5em 0 0; }
  h4.utenlandsopphold-title { padding: 0; }
  hr {margin: 0.5em 0; color: rgb(128, 128, 128);}
  p, li { font-size: 16px; line-height: 1.5; width: 75%;}
  th, td { font-size: 14px; }
  table { width: 100%; border-collapse: collapse; table-layout: auto; margin: 0; }
  th, tr, .afp-grunnlag-title { border-bottom: 1px solid rgb(128 128 128); }
  thead th { border-bottom: 2px solid rgb(128 128 128); font-weight: bold; text-align: center; white-space: nowrap; }
  th, td { padding: 12px 8px; }
  tr td { margin-right: 10px; text-align: center; }
  tr.header-with-logo { border: none; margin: 0; }
  tr.header-with-logo td { padding: 0; }
  table.pdf-chart-table {
    margin: 0 0 24px 0;
  }
  p.pdf-h3-paragraph, p.pdf-h4-paragraph {margin-top: -16px;}
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
    a[href]:after { content: none; }
  }
`
