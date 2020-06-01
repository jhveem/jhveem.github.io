<template>
  <div>
    <span class='btech-close' id='btech-close'>&times;</span>
    <h3 style='text-align: center;'>Report</h3>
    <h5 style='text-align: center;'>Click on column headers to sort by that column.</h5>
    <h5 style='text-align: center;'>Hover over column headers for a description of the information displayed in that
      column.</h5>
    <div id='btech-report-options'></div>
    <table class='sortable' border='1' id='btech-report-table'>

    </table>
    <thead border='1' id='btech-report-table-head'>
      <tr>
        <th v-for='column in columns'>test</th>
      </tr>
    </thead>
    <tbody border='1' id='btech-report-table-body'>

    </tbody>
    <tfoot border='1' id='btech-report-table-foot'>

    </tfoot>
  </div>
</template>