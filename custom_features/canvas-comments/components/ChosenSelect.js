Vue.component("chosen-select",{
  props:{
    value: [String, Array],
    multiple: Boolean,
    default: String,
  },
  template:`<select :multiple="multiple"><slot></slot></select>`,
  mounted(){
    if (this.default !== undefined) {
      this.value.push(this.default);
    }
    $(this.$el)
      .val(this.value)
      .chosen()
      .on("change", e => this.$emit('input', $(this.$el).val()))
    $(this.$el).chosen({allow_single_deselect: true});
  },
  watch:{
    value(val){
       $(this.$el).val(val).trigger('chosen:updated');
    }
  },
  destroyed() {
      $(this.$el).chosen('destroy');
  }
})