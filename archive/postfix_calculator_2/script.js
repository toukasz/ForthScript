const output_html		= document.getElementById('output');
const input_html		= document.getElementById('input');
const cursor_html		= document.getElementById('cursor');
const autofocus_html	= document.getElementById('autofocus');

const index				= [];
const stack				= [];
const return_stack		= [];
const output_text		= [];
const words				= [];
const memory			= Array(64000);
let	error 				= false;
let object				= {};

// START UP
const space = '\u00a0';
let startup_spacing = ''; for (let i = 0; i < 14; i++) startup_spacing += space;
output_text.push(`${startup_spacing}==== WEB-BASED FORTH-SCRIPT v1.0 ====`);
output_text.push(`${startup_spacing}==== OPEN SOURCE 2024 BY T.SZULC ====`);
error = true; output_print(); error = false;

// READ UI INTERACTIONS
input_html.addEventListener('keyup', function (event) {
	if (event.key === "Enter") 		{ scroll_reset(); input_submit(); };
	if (event.key === "ArrowUp")	scroll_up();
	if (event.key === "ArrowDown")	scroll_down();
	if (event.key === "Escape")		input_html.value = '';
	update_cursor();
});
autofocus_html.addEventListener('click', function () {
	input_html.focus(); update_cursor();
});

// CURSOR BEHAVIOR
function update_cursor() {
	let string = ''; for (let i = 0; i < input_html.selectionStart; i++) string += space;
	cursor_html.innerText = string + '\u2588';	// block character
};
setInterval(cursor_blinker, 500);
let blinker = true;
function cursor_blinker() {
	if (blinker && document.activeElement == input_html)
		cursor_html.style.display = 'block'
	else cursor_html.style.display = 'none';
	blinker = !blinker;
};

// INPUT HISTORY
let scroll_index = 0;
const input_history = [''];
function scroll_reset() {
	input_history.unshift(input_html.value.split(/\n/).join(''));
	while (input_history.length > 42) input_history.pop();
	scroll_index = 0;
};
function scroll_up() {
	input_html.value = input_history[scroll_index];
	if (scroll_index === input_history.length - 1) return; scroll_index++;
};
function scroll_down() {
	if (scroll_index === 0) { input_html.value = ''; return; };
	scroll_index--; input_html.value = input_history[scroll_index];
};

// INPUT PARSER
function input_submit() {
	const input_array = input_html.value.split(/[ \n]/);
	output_text.push(input_array.join(space));
	input_html.value = '';
	parse_array(input_array);
	output_print();
};

function output_print()	{
	while (output_text.length >= 42) output_text.shift();
	if (!error) output_text[output_text.length - 1]
		+= space + 'OK';
	output_html.innerText = '';
	output_text.forEach(string =>
		output_html.innerText += `${string}\n`);
};

function index_init()	{ index.push(0); };
function index_pop()	{ index.pop(); };
function index_fetch()	{ return index[index.length - 1]; };
function index_inc()	{ index[index.length - 1] = index_fetch() + 1; };

function parse_array(value) {
	index_init();
	error = false;
	while (index_fetch() !== value.length)	{
		if (error) break;
		interpret_word(value[index_fetch()], value);
		index_inc();
	};
	index_pop();
};

function interpret_word(word, array) {
	if (word === '') return;
	if (is_userVocabulary(word, array)) return;
	if (is_forthVocabulary(word, array)) return;
	if (is_number(word)) return;
	init_error0(word);
};

function is_userVocabulary(word) {};

const instructions = [
// STACK INSTRUCTIONS
	'DUP','DROP','SWAP','OVER','ROT','-DUP','>R','R>','R',
	'+','-','*','/','%','MAX','MIN','ABS','MINUS',
	'AND','OR','XOR','<','>','=','0<','0=','W"','S"',
// INPUT OUTPUT INSTRUCTIONS
	'.','.S','.R','CR','SPACE','SPACES','."',
	'DUMP','TYPE','KEY','EXPECT',
// MEMORY AND DICTIONARY INSTRUCTIONS
	'@','!','C@','C!','?','+!',
	'MOVE','FILL','ERASE', 'BLANKS',
	'HERE','PAD','ALLOT',',',"'", 'FORGET','WORDS','SEE',
// DEFINING AND CONTROL STRUCTURE INSTRUCTIONS
	':',';','VAR','CONST','FUNC',':CODE',';CODE','DO','LOOP',
	'+LOOP','I','LEAVE','IF','ELSE','THEN','BEGIN','UNTIL',
	'REPEAT','WHILE',
// MISCELLANEOUS INSTRUCTIONS
	'(','ABORT','SP@'
];

function is_forthVocabulary(word, array) {
	word = word.toUpperCase();
	if (instructions.includes(word)) {
		exec_instructions(word, array); return true;
	}; return false;
};

function is_number(word) {
	if (isNaN(word)) return false;
	stack.push(parseFloat(word)); return true;
};

function exec_instructions(word, array) {
// STACK INSTRUCTIONS
	if (word === 'DUP')		{ stack.push(stack[stack.length - 1]); return; };
	if (word === 'DROP')	{ stack.pop(); return; };
	if (word === 'SWAP')	{ stack.splice(stack.length - 2, 0, stack.pop()); return; };
	if (word === 'OVER')	{ stack.push(stack.slice(stack.length - 2, stack.length - 1).pop()); return; };
	if (word === 'ROT')		{ stack.push(stack.splice(stack.length - 3, 1)); return; };
	if (word === '-DUP')	{ const item = stack[stack.length - 1];
							if (item === 0) return; stack.push(item); return; };
	if (word === '>R')		{ return_stack.push(stack.pop()); return; };
	if (word === 'R>')		{ stack.push(return_stack.pop()); return; };
	if (word === 'R')		{ stack.push(return_stack[return_stack.length - 1]); return; };
	if (word === '+')		{ const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 + n2); return; };
	if (word === '-')		{ stack.push(-stack.pop() + stack.pop()); return; };
	if (word === '*')		{ stack.push(stack.pop() * stack.pop()); return; };
	if (word === '/')		{ stack.push(1/stack.pop() * stack.pop()); return; };
	if (word === '%')		{ stack.push(stack.splice(stack.length - 2 , 1).pop() % stack.pop()); return; };
	if (word === 'MAX')		{ stack.push(Math.max(stack.pop(), stack.pop())); return; };
	if (word === 'MIN')		{ stack.push(Math.min(stack.pop(), stack.pop())); return; };
	if (word === 'ABS')		{ stack.push(Math.abs(stack.pop())); return; };
	if (word === 'MINUS')	{ stack.push(-stack.pop()); return; };
	if (word === 'AND')		{ const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 && n2); return; };
	if (word === 'OR')		{ const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 || n2); return; };
	if (word === 'XOR')		{ stack.push(stack.pop() ^ stack.pop()); return; };
	if (word === '<')		{ stack.push(stack.pop() > stack.pop()); return; };
	if (word === '>')		{ stack.push(stack.pop() < stack.pop()); return; };
	if (word === '=')		{ stack.push(stack.pop() == stack.pop()); return; };
	if (word === '0<')		{ stack.push(stack.pop() < 0); return; };
	if (word === '0=')		{ stack.push(stack.pop() == 0); return; };
	if (word === 'W"')		{ let i = index[index.length - 1] + 1;
							while (array[i] === '') i++;
							stack.push(array[i]);
							index[index.length - 1] = i; return; };
	if (word === 'S"')		{ let i = index[index.length - 1] + 1;
							let string = []; array.pop();
							while (array[i] !== '"') {
								if (i === array.length) { i--; break; };
								if (array[i] === '') string[string.length - 1] += ' '
								else string.push(array[i]); i++;
							};
							index[index.length - 1] = i;
							stack.push(string.join(' ')); return; };
// INPUT OUTPUT INSTRUCTIONS
	if (word === '.')		{ output_text[output_text.length - 1] += stack.pop() + space; return; };
	if (word === '.S')		{ let string = `<${stack.length}> ${stack.join(', ')}`;
							output_text[output_text.length - 1] += string + space; return; };
	if (word === '.R')		{ let string = ''; const count = stack.pop();
							for (let i = 0; i < count; i++) string += space;
							output_text[output_text.length - 1]
							+= string + stack.pop() + space; return; };
	if (word === 'CR')		{ output_text.push(''); return; };
	if (word === 'SPACE')	{ output_text[output_text.length - 1] += space; return; };
	if (word === 'SPACES')	{ let string = ''; const count = stack.pop();
							for (let i = 0; i < count; i++) string += space;
							output_text[output_text.length - 1] += string; return; };
	if (word === '."')		{ let i = index[index.length - 1] + 1; let string = '';
							while (array[i] !== '"') {
								if (i === array.length) { i--; break; };
								string += array[i] + space; i++;
							};
							index[index.length - 1] = i;
							output_text[output_text.length - 1] += string; return; };
	if (word === 'DUMP')	{const [u, addr] = [stack.pop(), stack.pop()];
							for (let i = addr; i < addr + u; i++)
								output_text.push(`${i}: ${memory[i]} - ${typeof memory[i]}`);
							output_text.push(''); return; };
	if (word === 'TYPE')	{const [u, addr] = [stack.pop(), stack.pop()];
							for (let i = addr; i < addr + u; i++)
								output_text[output_text.length - 1]
								+= memory[i]; return; };
//	if (word === 'KEY')		{ return; };
//	if (word === 'EXPECT')	{ return; };
// MEMORY AND DICTIONARY INSTRUCTIONS
	if (word === '@')		{ stack.push(memory[stack.pop()]); return; };
	if (word === '!')		{ memory[stack.pop()] = stack.pop(); return; };
	if (word === '?')		{ output_text[output_text.length - 1]
							+= memory[stack.pop()]; return; };
	if (word === '+!')		{ memory[stack.pop()] += stack.pop(); return; };
	if (word === 'MOVE')	{ const [u, to, from] = [stack.pop(), stack.pop(), stack.pop()];
							const temp = memory.slice(from, from + u);
							memory.splice(to, u, ...temp); return; };
	if (word === 'FILL')	{ const [b, u, addr] = [stack.pop(), stack.pop(), stack.pop()];
							for (let i = addr; i < addr + u; i++)
								memory[i] = b; return; };
	if (word === 'ERASE')	{ const [u, addr] = [stack.pop(), stack.pop()];
							for (let i = addr; i < addr + u; i++)
								memory[i] = 0; return; };
	if (word === 'BLANKS')	{ const [u, addr] = [stack.pop(), stack.pop()];
							for (let i = addr; i < addr + u; i++)
								memory[i] = undefined; return; };
	if (word === 'HERE')	{ let addr = 0;
							while (typeof memory[addr] !== 'undefined') addr++;
							stack.push(addr); return; };
	if (word === 'ALLOT')	{ let addr = 0; u = stack.pop();
							while (typeof memory[addr] !== 'undefined') addr++;
							for (let i = addr; i < addr + u; i++)
								memory[i] = null; return; };
	if (word === ',')		{ let addr = 0;
							while (typeof memory[addr] !== 'undefined') addr++;
							memory[addr] = stack.pop(); return; };
	if (word === "'")		{ let addr = 0; console.log('hello!')
							while (typeof memory[addr] !== 'string'
								&& addr < memory.length) addr++;
							stack.push(addr); console.log(addr); return; };
//	if (word === 'FORGET')
	if (word === 'WORDS')	{ output_text.push('');
							for (let i = 0; i < words.length; i++) {
								if (output_text[output_text.length - 1].length > 20)
									output_text.push('');
								output_text[output_text.length - 1] += words[i].name;
							}; return; };
//	if (word === 'SEE')
// DEFINING AND CONTROL STRUCTURE INSTRUCTIONS
	if (word === ':')		{ let i = index[index.length - 1] + 1;
							const object = {};
							object.name = array[i];
							object.content = []; i++;
							while (array[i] !== ';') {
								if (i >= array.length) { init_error1(); return; };
								object.content.push(array[i]); i++;
							};
							index[index.length - 1] = i;
							const word_index = words.findIndex(word => word.name = object.name);
							if (word_index >= 0) words.splice(word_index, 1);
							words.push(object); return; };
//	if (word === 'VAR')		{ };
/*
	if (word === 'CONST')
	if (word === 'FUNC')
	if (word === ':CODE')
	if (word === ';CODE')
	if (word === 'DO')
	if (word === 'LOOP')
	if (word === '+LOOP')
	if (word === 'I')
	if (word === 'LEAVE')
	if (word === 'IF')
	if (word === 'ELSE')
	if (word === 'THEN')
	if (word === 'BEGIN')
	if (word === 'UNTIL')
	if (word === 'REPEAT')
	if (word === 'WHILE')
// MISCELLANEOUS INSTRUCTIONS
	if (word === '(')
	if (word === 'ABORT')
	if (word === 'SP@')
*/
};

function init_error0(word) {
	output_text.push(`UNDEFINED WORD`);
	output_text.push(`:= ${word} =:`);
	while (stack.length !== 0) stack.pop();
	while (return_stack.length !== 0) return_stack.pop();
	error = true;
};
function init_error1() {
	output_text.push(`NO CLOSING TAG`);
	output_text.push(`:= ; =:`)
	while (stack.length !== 0) stack.pop();
	while (return_stack.length !== 0) return_stack.pop();
	error = true;
};
