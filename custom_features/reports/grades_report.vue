<template>
  <div class='btech-modal' style='display: inline-block;'> <!-- ERASE THE DISPLAY PIECE BEFORE GOING LIVE -->
    <div class='btech-modal-content'>
      <span class='btech-close' id='btech-close'>&times;</span>
      <h3 style='text-align: center;'>Report</h3>
      <h5 style='text-align: center;'>Click on column headers to sort by that column.</h5>
      <h5 style='text-align: center;'>Hover over column headers for a description of the information displayed in that
        column.</h5>
      <div>
        <div v-for='column in columns' :key='column.name' :class='column.sortable_type'>{{column.name}}</div>
      </div>
      <div>
        <report-row v-for='(student,  id) in students'
          :name='student.name'
        ></report-row>
      </div>
  </div>
</template>