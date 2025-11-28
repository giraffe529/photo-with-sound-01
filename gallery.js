// ====== トップページ ======


const items = [
  {
    title: "愛宕神社",
    src: "atago/1.jpg",
    page: "shrines/atago.html"
  },
  {
    title: "宮地嶽神宮",
    src: "miyajidake/1.jpg",
    page: "shrines/miyajidake.html"
  },
  {
    title: "紅葉八幡宮",
    src: "momiji/1.jpg",
    page: "shrines/momiji.html"
  },
  {
    title: "高住神社",
    src: "takasumi/1.jpg",
    page: "shrines/takasumi.html"
  },
  {
    title: "高祖神社",
    src: "takaso/1.jpg",
    page: "shrines/takaso.html"
  },
  {
    title: "宗像大社",
    src: "munakata/1.jpg",
    page: "shrines/munakata.html"
  },
  {
    title: "太宰府天満宮",
    src: "dazaifu/1.jpg",
    page: "shrines/dazaifu.html"
  },
  {
    title: "志賀海神社",
    src: "sikaumi/1.jpg",
    page: "shrines/sikaumi.html"
  }
];

const gallery = document.getElementById("gallery");




items.forEach((item) => {

  const fig = document.createElement("figure");
  fig.className = "tile";

  const img = document.createElement("img");
  img.src = item.src;
  img.alt = item.title;

  const caption = document.createElement("figcaption");
  caption.textContent = item.title;


  fig.addEventListener("click", () => {
    window.location.href = item.page;
  });

  fig.appendChild(img);
  fig.appendChild(caption);
  gallery.appendChild(fig);

 
  img.onload = () => {
    fig.classList.add("loaded");
  };
});


  
  /* ==============================
     2) プリロード & Audio Cache
  ============================== */
  function preloadImages(list){
    list.forEach(it=>{
      const img = new Image();
      img.src = it.src;
    });
  }
  preloadImages(ITEMS);
  
  const audioMap = new Map();
  function getAudio(path){
    if(!audioMap.has(path)){
      const a = new Audio(path);
      a.preload = "auto";
      audioMap.set(path, a);
    }
    return audioMap.get(path);
  }
  
  /* ==============================
     3) Utility
  ============================== */
  function shuffle(array){
    for(let i=array.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  const $gallery = document.getElementById('gallery');
  const state = { playingKey: null };
  
  function stopCurrent(){
    if(state.playingKey){
      const a = audioMap.get(state.playingKey);
      if(a){ a.pause(); }
      const playingTile = document.querySelector('.tile.playing');
      if(playingTile){ playingTile.classList.remove('playing'); }
      state.playingKey = null;
    }
  }
  
  /* ==============================
     4) Render Tiles
  ============================== */
  function render(items){
    $gallery.innerHTML = '';
    items.forEach((item, idx)=>{
      const fig = document.createElement('figure');
      fig.className = 'tile';
      fig.dataset.audio = item.audio || '';
  
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = item.label ?? `photo-${idx+1}`;
      img.src = item.src;
  
      img.addEventListener('load', ()=> fig.classList.add('loaded'));
  
      const cap = document.createElement('figcaption');
      cap.textContent = item.label ?? '';
  
      const badge = document.createElement('div');
      badge.className = 'badge';
  
      const onEnter = ()=>{
        if(!item.audio) return;
        try{
          const a = getAudio(item.audio);
          stopCurrent();
          const p = a.play();
          if(p?.then){
            p.then(()=>{
              state.playingKey = item.audio;
              fig.classList.add('playing');
            });
          }else{
            state.playingKey = item.audio;
            fig.classList.add('playing');
          }
        }catch(e){}
      };
  
      const onLeave = ()=>{
        const key = item.audio;
        if(!key) return;
        const a = audioMap.get(key);
        if(a) a.pause();
        if(state.playingKey === key) state.playingKey = null;
        fig.classList.remove('playing');
      };
  
      fig.addEventListener('mouseenter', onEnter);
      fig.addEventListener('mouseleave', onLeave);
      fig.addEventListener('touchstart', onEnter, {passive:true});
      fig.addEventListener('touchend', onLeave);
      fig.addEventListener('touchcancel', onLeave);
  
      fig.appendChild(img);
      fig.appendChild(cap);
      fig.appendChild(badge);
      $gallery.appendChild(fig);
    });
  }
  
  /* ==============================
     5) InView fade
  ============================== */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('loaded');
        io.unobserve(e.target);
      }
    });
  },{rootMargin:'100px'});
  
  function observeTiles(){
    document.querySelectorAll('.tile').forEach(tile=> io.observe(tile));
  }
  
  /* ==============================
     6) Init
  ============================== */
  const initial = shuffle([...ITEMS]);
  render(initial);
  requestAnimationFrame(observeTiles);
  
  /* ==============================
     7) Shuffle Button
  ============================== */
  document.getElementById('shuffle').addEventListener('click', ()=>{
    const currentItems = [...document.querySelectorAll('.tile img')].map((img,i)=>{
      const audio = img.closest('figure')?.dataset.audio || '';
      return { src: img.src, audio, label: img.alt ?? `photo-${i+1}` };
    });
    render(shuffle(currentItems));
    requestAnimationFrame(observeTiles);
  });
  
  /* ==============================
     8) Column Slider
  ============================== */
  const cols = document.getElementById('cols');
  const colsOut = document.getElementById('colsOut');
  
  function applyCols(n){
    document.querySelector('.masonry').style.columnCount = n;
    colsOut.textContent = n;
  }
  cols.addEventListener('input', e=> applyCols(e.target.value));
  
  const q = new URLSearchParams(location.search);
  if(q.has('cols')){
    const n = Math.max(1, Math.min(6, parseInt(q.get('cols'),10)||4));
    cols.value = n;
    applyCols(n);
  }
  
  
  /* ==============================
     11) Simple Self Test
  ============================== */
  (function(){
    try{
      console.assert(typeof ITEMS !== 'undefined');
      const tiles = document.querySelectorAll('.tile');
      console.assert(tiles.length === ITEMS.length);
      if(ITEMS[0]?.audio){
        const a = getAudio(ITEMS[0].audio);
        console.assert(a instanceof HTMLAudioElement);
      }
      const s = shuffle([...ITEMS]);
      console.assert(s.length === ITEMS.length);
      console.info('%cSelf tests passed','color:#8bc34a');
    }catch(e){
      console.error('Self tests failed', e);
    }
  })();
  