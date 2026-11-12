const id=document.body.dataset.app;
const groups={design:['palette-studio','contrast-check','gradient-lab','pixel-studio','flow-field','l-system'],science:['life-lab','pathfinder','sorting-lab','wave-mixer','rc-lab','resistor-lab'],utilities:['text-desk','json-desk','csv-desk','focus-clock','decision-wheel','typing-lab'],games:['merge-2048','memory-garden','lights-out','snake-orbit','reaction-lab','minefield']};
const group=Object.keys(groups).find(k=>groups[k].includes(id));
try{const module=await import(`./modules/${group}.mjs`);await module.mount(id,document.querySelector('#app'));}catch(error){const p=document.createElement('p');p.className='panel error';p.textContent=`Could not start this experiment: ${error.message}`;document.querySelector('#app').append(p);console.error(error);}
