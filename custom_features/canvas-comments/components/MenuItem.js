'use strict';
let menuItem = {
  template: `<div>
      {{text}}
    </div>`,
  props: [
    'text'
  ],
  methods: {

  }
};

Vue.component('menu-body', {
  template:  `<div>
    <div v-for="(item, x) in menuItems">{{item}}</div>
  </div>`,
  props: [
    'menuItems'
  ],
  components: {
    menuItem
  },
  methods: {

  }
})