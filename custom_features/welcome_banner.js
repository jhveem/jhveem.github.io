if (window.location.pathname === "/") {
  console.log("WELCOME!");
  let main = $("#main");
  main.prepend(`
<div style="text-align: center; width: 100%; padding: 15px; background: var(--ic-brand-global-nav-bgd); color: #FFFFFF; font-size: 1.25em;">Welcome to Bridgerland. If you need help getting started, visit the <a href="/courses/480103" target="_blank" style="color: #FFF; cursor: pointer; text-decoration: underline;">Student Orientation</a> course.</div>
`);
}