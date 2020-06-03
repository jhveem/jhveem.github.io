<template>
  <div class='btech-modal' style='display: inline-block;'>
    <!-- ERASE THE DISPLAY PIECE BEFORE GOING LIVE -->
    <div class='btech-modal-content'>
      <span class='btech-close' id='btech-close'>&times;</span>
      <h3 style='text-align: center;'>Report</h3>
      <h5 style='text-align: center;'>Click on column headers to sort by that column.</h5>
      <h5 style='text-align: center;'>Hover over column headers for a description of the information displayed in that
        column.</h5>
      <div id='btech-report-options'>
        <div style='display: inline-block;' v-for='column in columns' :key='column.name'><input type="checkbox" v-model="column.visible"><label>{{column.name}}</label></div>
      </div>
      <table class='sortable' border='1' id='btech-report-table'>
        <thead border='1'>
          <tr>
            <th v-for='column in visibleColumns' :key='column.name' :class='column.sortable_type'>{{column.name}}</th>
          </tr>
        </thead>
        <tbody border='1'>
          <tr v-if="loading">
            <td :colspan='visibleColumns.length'>Loading Results...</td>
          </tr>
          <tr v-for='(student, id) in students'>
            <td v-for='column in visibleColumns' :key='column.name'
              v-bind:style="{'background-color': getDaysSinceLastSubmissionColor(column.name, student[column.name.toLowerCase().replace(/ /g, '_')])}">
              {{getColumnText(column, student[column.name.toLowerCase().replace(/ /g, "_")])}}</td>
          </tr>
        </tbody>
        <tfoot border='1'>

        </tfoot>
      </table>
    </div>
  </div>
</template>