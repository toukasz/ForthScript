const output_html = document.getElementById('output');
const input_html = document.getElementById('input');
const cursor_html = document.getElementById('cursor');

const index = [];
const stack = [];
const dictionary_forth = [];
const dictionary_user = [];
let error = false;

const space = '\u00a0';
let startup_spacing = '';
for (let i = 0; i < 14; i++) startup_spacing += space;
const output_text = [];
output_text.push(`${startup_spacing}==== WEB-BASED FORTH-SCRIPT v1.0 ====`);
output_text.push(`${startup_spacing}==== OPEN SOURCE 2024 BY T.SZULC ====`);
error = true; output_print(); error = false;

input_html.addEventListener("keydown", function (event) {
	cursor_html.style.display = 'block';
	if (event.key === "Enter")	input_submit();
	if (event.key === "Escape")	console.log('Escape!');
});

input_html.addEventListener('click', update_cursor);
input_html.addEventListener('keyup', update_cursor);
function update_cursor() {
	if (event.key === "Enter") input_html.value = '';
	let string = '';
	for (let i = 0; i < input_html.selectionStart; i++)
		string += space;
	cursor_html.innerText = string + '\u2588';
};
setInterval(cursor_blinker, 50);
let blinker = true;
function cursor_blinker() {
	if (blinker)	cursor_html.style.display = 'none';
	if (!blinker)	cursor_html.style.display = 'block';
	blinker = !blinker;
};

function input_submit() {
	const input_array = input_html.value.split(/[ \n]/);
	output_text.push(input_array.join(space));
	input_html.value = '';
	parse_array(input_array);
	output_print();
};

function output_print()	{
	while (output_text.length >= 41) output_text.shift();
	if (!error) output_text[output_text.length - 1]
	+= space + 'OK';
	output_html.innerText = '';
	output_text.forEach(string =>
		output_html.innerText += `${string}\n`);
};

function index_init()	{ index.push(0); };
function index_pop()	{ index.pop(); };
function index_fetch()	{ return index[index.length - 1]; };
function index_inc() {
	index[index.length - 1] = index_fetch() + 1;
};

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
	init_error_0(word);
};

function init_error_0(word) {
	output_text.push(`UNDEFINED WORD`);
	output_text.push(`:= ${word} =:`);
	while (stack.length !== 0 ) stack.pop();
	error = true;
};

function is_userVocabulary(word) {};

const stack_instructions = [
	'DUP','DROP','SWAP','OVER','ROT','-DUP','>R','R>','R'
	,'+','-','*','/','%','MAX','MIN','ABS','MINUS'
	,'AND','OR','XOR','<','>','=','0<','0='
];
const io_instructions = [
	'.','.S','.R','CR','SPACE','SPACES','."'
	,'DUMP','TYPE','KEY','EMIT','EXPECT'
];
const memory_instructions = [
	'@','!','C@','C!','?','+!'
	,'MOVE','CMOVE','FILL','ERASE', 'BLANKS'
	,'HERE','PAD','ALLOT',',',"'", 'FORGET','WORDS','SEE'
];
const control_instructions = [
	':',';','VAR','CONST','FUNC',':CODE',';CODE','DO','LOOP'
	,'+LOOP','I','LEAVE','IF','ELSE','THEN','BEGIN','UNTIL'
	,'REPEAT','WHILE'
];
const misc_instructions = [
	'(','ABORT','SP@'
];

function is_forthVocabulary(word, array) {
	word = word.toUpperCase();
	if (stack_instructions.includes(word)) {
		exec_stack_instr(word, array); return true;
	}; if (io_instructions.includes(word)) {
		exec_io_instr(word, array); return true;
	}; if (memory_instructions.includes(word)) {
		return true;
	}; if (control_instructions.includes(word)) {
		return true;
	}; if (misc_instructions.includes(word)) {
		return true;
	}; return false;
};

function is_number(word) {
	if (isNaN(word)) return false;
	stack.push(parseFloat(word)); return true;
};

function exec_stack_instr(word, array) { switch(word) {
	case 'DUP':
		stack.push(stack[stack.length - 1]); break;
	case 'DROP':
		stack.pop(); break;
	case 'SWAP':
		stack.splice(stack.length - 2, 0, stack.pop()); break;
	case 'OVER':
		stack.push(stack.slice(
			stack.length - 2, stack.length - 1)); break;
	case 'ROT':
		stack.push(stack.splice(stack.length - 3, 1)); break;
	case '-DUP':
		const item = stack[stack.length - 1];
		if (item === 0) break;
		stack.push(item); break;
//	case '>R':
//	case 'R>':
//	case 'R':
	case '+': stack.push(stack.pop() + stack.pop()); break;
	case '-': stack.push(-stack.pop() + stack.pop()); break;
	case '*': stack.push(stack.pop() * stack.pop()); break;
	case '/': stack.push(1/stack.pop() * stack.pop()); break;
	case '%':
		stack.push(stack.slice(stack.length - 2
		, stack.length - 1) % stack.pop()); break;
	case 'MAX':
		stack.push(Math.max(stack.pop(), stack.pop())); break;
	case 'MIN':
		stack.push(Math.min(stack.pop(), stack.pop())); break;
	case 'ABS': stack.push(Math.abs(stack.pop())); break;
	case 'MINUS': stack.push(-stack.pop()); break;
	case 'AND': stack.push(stack.pop() && stack.pop()); break;
	case 'OR': stack.push(stack.pop() || stack.pop()); break;
	case 'XOR': stack.push(stack.pop() ^ stack.pop()); break;
	case '<': stack.push(stack.pop() > stack.pop()); break;
	case '>': stack.push(stack.pop() < stack.pop()); break;
	case '=': stack.push(stack.pop() == stack.pop()); break;
	case '0<': stack.push(stack.pop() < 0); break;
	case '0=': stack.push(stack.pop() == 0); break;
}; };

function exec_io_instr(word, array) {
	if (word === '.') {
		output_text[output_text.length - 1]
		+= stack.pop() + space; return;
	};
	if (word === '.S') {
		let string = `<${stack.length}> ${stack.join(', ')}`;
		output_text[output_text.length - 1]
		+= string + space; return;
	};
	if (word === '.R') {
		let string = '';
		const count = stack.pop();
		for (let i = 0; i < count; i++) string += space;
		output_text[output_text.length - 1]
		+= string + stack.pop() + space; return;
	};
	if (word === 'CR') {
		output_text.push(''); return;
	};
	if (word === 'SPACE') {
		output_text[output_text.length - 1] += space; return;
	};
	if (word === 'SPACES') {
		let string = '';
		const count = stack.pop();
		for (let i = 0; i < count; i++) string += space;
		output_text[output_text.length - 1]
		+= string; return;
	};
	if (word === '."') {
		let i = index[index.length - 1] + 1;
		let string = '';
		while (array[i] !== '"') {
			if (i === array.length) { i--; break; };
			string += array[i] + space; i++;
		};
		index[index.length - 1] = i;
		output_text[output_text.length - 1]
		+= string; return
	};
//	if (word === 'DUMP') { };
//	if (word === 'TYPE') { };
//	if (word === 'KEY') { };
//	if (word === 'EMIT') { };
//	if (word === 'EXPECT') { };
};
