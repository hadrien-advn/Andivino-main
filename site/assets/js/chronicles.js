document.querySelectorAll('.cat-btn').forEach(b=>{
  b.addEventListener('click', function(){
    document.querySelectorAll('.cat-btn').forEach(x=>x.classList.remove('active'));
    this.classList.add('active');
    const cat=this.dataset.cat;
    const cards=document.querySelectorAll('#chronGrid .ccard');
    let visible=0;
    cards.forEach(card=>{
      const show=cat==='all'||card.dataset.cat===cat;
      card.style.display=show?'':'none';
      if(show)visible++;
    });
    let empty=document.getElementById('emptyChron');
    if(!visible){
      if(!empty){
        empty=document.createElement('div');
        empty.className='empty-chron';
        empty.id='emptyChron';
        empty.textContent='Aucune chronique dans cette catégorie.';
        document.getElementById('chronGrid').appendChild(empty);
      }
    } else if(empty){
      empty.remove();
    }
  });
});
