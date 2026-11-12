const ring = document.querySelector('#ring');
const time = document.querySelector('#time');
const status = document.querySelector('#status');
const toggle = document.querySelector('#toggle');
const message = document.querySelector('#message');
const modes = [...document.querySelectorAll('.mode')];
const circumference = 2 * Math.PI * 108;
let duration = 25 * 60;
let remaining = duration;
let timer = null;
let modeName = 'Focus';
ring.style.strokeDasharray = circumference;

function render() {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  time.textContent = value;
  time.dateTime = `PT${minutes}M${seconds}S`;
  ring.style.strokeDashoffset = circumference * (1 - remaining / duration);
  status.textContent = timer ? 'IN SESSION' : remaining === 0 ? 'COMPLETE' : 'READY';
  toggle.textContent = timer ? 'Pause session' : 'Begin session';
  document.title = `${value} · Stillpoint`;
}

function pause() {
  clearInterval(timer);
  timer = null;
  render();
}

function startPause() {
  if (timer) return pause();
  if (remaining === 0) remaining = duration;
  timer = setInterval(() => {
    remaining = Math.max(0, remaining - 1);
    render();
    if (remaining === 0) {
      pause();
      status.textContent = 'COMPLETE';
      message.textContent = `${modeName} is complete. Take a breath before moving on.`;
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Stillpoint', { body: `${modeName} session complete. Take a breath.` });
      }
    }
  }, 1000);
  render();
}

function reset() {
  pause();
  remaining = duration;
  message.textContent = 'No streaks. No pressure. Just this moment.';
  render();
}

modes.forEach(button => button.addEventListener('click', () => {
  pause();
  modes.forEach(item => item.classList.toggle('active', item === button));
  modeName = button.firstChild.textContent.trim();
  duration = Number(button.dataset.minutes) * 60;
  remaining = duration;
  message.textContent = modeName === 'Focus' ? 'No streaks. No pressure. Just this moment.' : 'Rest is part of the work.';
  render();
}));

toggle.addEventListener('click', startPause);
document.querySelector('#reset').addEventListener('click', reset);
window.addEventListener('keydown', event => {
  if (event.code === 'Space' && !['BUTTON', 'INPUT'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    startPause();
  }
  if (event.key.toLowerCase() === 'r' && document.activeElement.tagName !== 'INPUT') reset();
});
render();
