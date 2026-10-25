
window.addEventListener('DOMContentLoaded',()=>{
  // 箋紙卡片點擊效果
  document.querySelectorAll('.card,.portal').forEach(el=>{
    el.addEventListener('click',e=>{
      const link=el.querySelector('a');
      if(link && !e.target.closest('a')){ /* noop */ }
    });
  });
});
