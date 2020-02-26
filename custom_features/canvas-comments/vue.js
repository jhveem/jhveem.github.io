let vueString = `<div id="vue-app" style="left: 0; top: 0;">
  <h3 class="collaborator-menu-header">{{header}}</h3>
  <div v-for="(item, x) in menuItems" :key="x"><button @click="item.action()">CLICK</button>{{item.name}}</div>
  </div>
</div>`;
$('#main').css("margin-right", "200px");
$('#main').append('<div id="canvas-collaborator-container" style="display: block; position: absolute; top: 0%; right: -200px; width: 200px;"></div>');
$("#canvas-collaborator-container").append(vueString);
console.log($("#vue-app"))
class MenuItem {
  constructor(name, action, submenu='') {
    this.name = name;
    this.action = action;
    this.collapsed = true;
    this.submenu = submenu;
  }
}
let APP = new Vue({
  el: '#vue-app',
  created: function() {
    this.menuItems = this.menus.main;
  },
  data: function() { 
    let APP = this;
    return {
      header: 'collaborator',
      menuItems: [],
      menus: {
        main: [
          new MenuItem('Projects', function(){APP.goto('projects')}),
          new MenuItem('Settings', function(){APP.goto('projects')}),
        ],
        projects: [
          new MenuItem('New Project', function(){}),
        ],
      }
    }
  },
  methods: {
    goto: function(menuName) {
      this.menuItems = this.menus[menuName];
      this.header = menuName;
    },
    shout: function() {
      console.log("SHOUT");
    }
  },
});