// Set up canvas and constants
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const TILE_SIZE = 40, GRID = 10;
const TILE = { PATH:0, WALL:1, SWORD:2, GOAL:3, ENEMY:4, TRAP:5, SAKE:6 };
let map = [], player = { x:0,y:0, frame:0 }, swords = 3, hearts = 3, gameOver = false;

// Load images
const images = { zoro: new Image(), wall: new Image(), sword: new Image(),
  goal: new Image(), enemy: new Image(), trap: new Image(), sake: new Image(), heart: new Image() };
let loaded = 0, total = Object.keys(images).length;
for (let k in images) {
  images[k].src = `${k}.png`;
  images[k].onload = () => { if (++loaded === total) { generateMap(); draw(); } };
}

// Background music
const bgm = new Audio('music.mp3');
bgm.loop = true;
bgm.volume = 0.4;
bgm.play().catch(() => {});

// Map generator
function generateMap() {
  map = Array.from({length:GRID}, () => Array.from({length:GRID}, () => {
    let r=Math.random();
    return r<0.4 ? TILE.WALL : r<0.45 ? TILE.SWORD :
           r<0.5 ? TILE.ENEMY : r<0.55 ? TILE.TRAP :
           r<0.6 ? TILE.SAKE : TILE.PATH;
  }));
  player = { x:0, y:0, frame:0 };
  map[0][0] = TILE.PATH;
  let gx, gy;
  do { gx = Math.floor(Math.random()*GRID); gy = Math.floor(Math.random()*GRID); }
  while ((gx===0&&gy===0)|| map[gy][gx] === TILE.WALL);
  map[gy][gx] = TILE.GOAL;
}

// Animated draw
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (let y=0; y<GRID; y++) for (let x=0; x<GRID; x++) {
    const tile = map[y][x], img = [null,images.wall,images.sword,images.goal,images.enemy,images.trap,images.sake][tile];
    if (img) ctx.drawImage(img, x*TILE_SIZE, y*TILE_SIZE+40, TILE_SIZE, TILE_SIZE);
  }
  const sx = player.frame%2 * TILE_SIZE;
  ctx.drawImage(images.zoro, sx, 0, TILE_SIZE, TILE_SIZE, player.x*TILE_SIZE, player.y*TILE_SIZE+40, TILE_SIZE, TILE_SIZE);
  player.frame++;
  for (let i=0;i<hearts;i++) ctx.drawImage(images.heart, i*30,5,28,28);
  ctx.fillStyle='#0f0'; ctx.font='16px monospace';
  ctx.fillText(`⚔️: ${swords}`, canvas.width - 70, 25);
}

// Movement logic
function moveZoro(dir) {
  if (gameOver) return;
  const deltas={ up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
  const [dx,dy] = deltas[dir]||[0,0];
  const nx = player.x + dx, ny = player.y + dy;
  if (nx<0||ny<0||nx>=GRID||ny>=GRID) return;
  const tile = map[ny][nx];
  if (tile===TILE.WALL) return;
  player.x = nx; player.y = ny;
  if (Math.random()<0.3) setTimeout(() => moveZoro(['up','down','left','right'][Math.floor(Math.random()*4)]), 200);
  if (tile===TILE.SWORD) { swords++; map[ny][nx]=TILE.PATH; }
  if (tile===TILE.SAKE && hearts<3) { hearts++; map[ny][nx]=TILE.PATH; }
  if (tile===TILE.ENEMY) { hearts--; map[ny][nx]=TILE.PATH; if (hearts<=0) { alert("💀 Zoro defeated!"); gameOver = true; } }
  if (tile===TILE.TRAP) { alert("⚠️ Trap! Back to start."); player={x:0,y:0,frame:player.frame}; }
  if (tile===TILE.GOAL) { alert("🎉 Zoro wins!"); gameOver = true; }
  draw();
}

// Use sword
function useSword() {
  if (swords<=0) { alert("❌ No swords!"); return; }
  const dirs=[[0,-1],[0,1],[-1,0],[1,0]];
  let cut=false;
  for (const [dx,dy] of dirs) {
    const tx = player.x + dx, ty = player.y + dy;
    if (tx>=0 && ty>=0 && tx<GRID && ty<GRID && map[ty][tx]===TILE.WALL) {
      map[ty][tx] = TILE.PATH; cut = true;
    }
  }
  if (cut) { swords--; draw(); }
  else alert("❌ No walls nearby.");
}

// Keyboard
document.addEventListener("keydown", e => {
  if (e.key.startsWith("Arrow")) moveZoro(e.key.slice(5).toLowerCase());
  if (e.code==="Space") useSword();
});

// Mobile buttons
["up","down","left","right"].forEach(dir => {
  document.getElementById(dir).addEventListener("touchstart", ()=>moveZoro(dir));
});
document.getElementById("swing").addEventListener("touchstart", useSword);
