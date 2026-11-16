const display = document.getElementById('display');
const expression = document.getElementById('expression');
const keypad = document.querySelector('.keypad');
const themeChoices = document.querySelectorAll('.theme-choice');
// The display starts at zero.
let current = '0';
let previous = null;
let operator = null;
let shouldReset = false;
function updateDisplay() {
  display.textContent = current;
  expression.textContent = previous !== null && operator
    ? `${previous} ${operator === '*' ? '×' : operator === '/' ? '÷' : operator}`
    : '';
}
function enterNumber(value) {
  if (shouldReset || current === 'Error') {
    current = '0';
    shouldReset = false;
  }
  if (value === '.') {
    if (!current.includes('.')) current += '.';
  } else {
    if (current.replace(/[-.]/g, '').length >= 12) return;
    current = current === '0' ? value : current + value;
  }
  updateDisplay();
}
function calculate(a, b, op) {
  const x = Number(a);
  const y = Number(b);
  let result;
  switch (op) {
    case '+': result = x + y; break;
    case '-': result = x - y; break;
    case '*': result = x * y; break;
    case '/': result = y === 0 ? NaN : x / y; break;
    default: return b;
  }
  return Number.isFinite(result) ? String(Number(result.toPrecision(11))) : 'Error';
}
function chooseOperator(nextOperator) {
  if (current === 'Error') return;
  if (operator && !shouldReset) {
    current = calculate(previous, current, operator);
    if (current === 'Error') {
      previous = null;
      operator = null;
      updateDisplay();
      return;
    }
  }
  previous = current;
  operator = nextOperator;
  shouldReset = true;
  updateDisplay();
}
function equals() {
  if (!operator || previous === null || shouldReset) return;
  current = calculate(previous, current, operator);
  previous = null;
  operator = null;
  shouldReset = true;
  updateDisplay();
}
function reset() {
  current = '0';
  previous = null;
  operator = null;
  shouldReset = false;
  updateDisplay();
}
// Remove the last digit without changing the rest.
function deleteLast() {
  if (current === 'Error') {
    current = '0';
    shouldReset = false;
  } else if (shouldReset) {
    // DEL cancels a pending operator rather than editing the previous number.
    operator = null;
    previous = null;
    shouldReset = false;
  } else {
    current = current.length > 1 ? current.slice(0, -1) : '0';
    if (current === '-') current = '0';
  }
  updateDisplay();
}
function handleInput(value, action) {
  if (action === 'reset') reset();
  else if (action === 'delete') deleteLast();
  else if (action === 'equals') equals();
  else if ('+-*/'.includes(value) && value) chooseOperator(value);
  else if (/^[0-9.]$/.test(value)) enterNumber(value);
}
keypad.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  handleInput(button.dataset.value, button.dataset.action);
});
document.addEventListener('keydown', (event) => {
  if (/^[0-9.]$/.test(event.key)) handleInput(event.key);
  else if (['+', '-', '*', '/'].includes(event.key)) {
    event.preventDefault();
    handleInput(event.key);
  } else if (event.key === 'Enter' || event.key === '=') handleInput(null, 'equals');
  else if (event.key === 'Backspace') handleInput(null, 'delete');
  else if (event.key === 'Escape') handleInput(null, 'reset');
});
themeChoices.forEach((button) => {
  button.addEventListener('click', () => {
    document.body.dataset.theme = button.dataset.theme;
    themeChoices.forEach((choice) => {
      const selected = choice === button;
      choice.classList.toggle('active', selected);
      choice.setAttribute('aria-pressed', String(selected));
    });
  });
});
updateDisplay();