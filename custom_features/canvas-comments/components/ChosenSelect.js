Vue.component('select-2', {
  template: '<select v-bind:name="name" class="form-control" v-bind:multiple="multiple"></select>',
  props: {
    placeholder: '',
    newTags: {
      Boolean,
      default: false
    },
    name: '',
    options: {
      Object
    },
    value: null,
    multiple: {
      Boolean,
      default: false

    },
    outputDictionary: Object
  },
  data() {
    return {
      select2data: []
    }
  },
  mounted() {
    this.formatOptions()
    let vm = this
    let select = $(this.$el)
    select
      .select2({
        createTag: function(tag) {
          let key = tag.term.toLowerCase();
          if (!(key in vm.options)) {
            vm.options[key] = key;
          }
          return {
            id: key,
            text: key,
            isNew: true
          }
        },
        placeholder: vm.placeholder,
        tags: vm.newTags,
        theme: 'bootstrap',
        width: '100%',
        allowClear: true,
        data: vm.select2data
      })
      .on('change', function () {
      vm.$emit('input', select.val())
    })
    select.val(this.value).trigger('change')
  },
  methods: {
    formatOptions() {
      console.log(this.options);
      console.log(typeof(this.options));
      this.select2data.push({ id: '', text: 'Select' })
      for (let key in this.options) {
        let text=this.options[key];
        if (this.outputDictionary !== undefined) {
          key = text;
          text = this.outputDictionary[text];
          //maybe give yourself a way to convert keys to text if your keys are from an array
        }
        this.select2data.push({ id: key, text: text})
      }
    }
  },
  destroyed: function () {
    $(this.$el).off().select2('destroy')
  }
});