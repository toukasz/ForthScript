const output_html		= document.getElementById('output');
const input_html		= document.getElementById('input');
const cursor_html		= document.getElementById('cursor');
const autofocus_html	= document.getElementById('autofocus');
const stack_html		= document.getElementById('stack');

// FORTH values
const index				= [];
const stack				= [];
const return_stack		= [];
let output_text			= [];
let user_words			= [];
let user_functions		= [];
const memory			= Array(64000);
let   error 			= false;

// PRINT values
const print_rows		= 42;
let stack_toggle		= false;

// START UP
const space = '\u00a0';
let startup_spacing = ''; for (let i = 0; i < 14; i++) startup_spacing += space;
output_text.push(`${startup_spacing}==== WEB-BASED FORTH-SCRIPT v1.0 ====`);
output_text.push(`${startup_spacing}==== OPEN SOURCE 2024 BY T.SZULC ====`);
output_print(false);

// READ UI INTERACTIONS
autofocus_html.addEventListener('click', function () {
	input_html.focus();
	update_cursor();
});
input_html.addEventListener('keydown', function (event) {
	if (event.key === 'Enter')		input_submit();
	if (event.key === "ArrowUp")	scroll_up();
	if (event.key === "ArrowDown")	scroll_down();
	if (event.key === "Escape")		input_html.value = '';
//	if (event.key === "Alt")		toggle_editor();
	update_cursor();
});
input_html.addEventListener('keyup', function (event) {
	if (event.key === 'Enter') {
		scroll_reset();
		input_html.value = '';
		update_cursor();
		output_print();
		stack_update();
	};
});

// CURSOR BEHAVIOR
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function update_cursor() {
	await sleep(1);
	let cursor_position = input_html.selectionStart;
	while (cursor_position > 64) cursor_position -= 64;
	let string = []; for (let i = 0; i < cursor_position; i++) string.push(space);
	cursor_html.innerText = string.join('') + '\u2588';	// block character
};
setInterval(cursor_blinker, 400);
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

// STACK VIEWER
function stack_update() {
	let string = `<${stack.length}> ${stack.join(', ')}`;
	stack_html.innerText = string;
};
function toggle_stack() {
	if (stack_toggle) {
		stack_toggle = false;
		stack_html.style.display = 'none';
	} else {
		stack_toggle = true;
		stack_html.style.display = 'block';
	};
};

// INPUT PARSER
function input_submit() {
	const input_string = input_html.value.replace('\n', ' ');
	const input_array = input_html.value.split(/[ \n\t]+/).filter(word => word.length !== 0);
	output_text.push(input_string + ' ');
	parse_array(input_array);
	output_print(true);
};

// OUTPUT PRINTER
function output_print(ok) {
	let i = 0; while (i < output_text.length) {
		if (output_text[i].length > 64) {
			const string = output_text[i];
			output_text[i] = string.slice(0, 64);
			output_text.splice(i + 1, 0, string.slice(64));
		}; i++;
	};
	const n_rows = print_rows - stack_toggle;
	while (output_text.length >= n_rows) output_text.shift();
	if (ok && !error) output_text[output_text.length - 1] += ' OK';
	output_html.innerText = output_text.join('\n');
};

// INDEX CONTROLS
function index_init()	{ index.push(0); };
function index_pop()	{ index.pop(); };
function index_fetch()	{ return index[index.length - 1]; };
function index_inc()	{ index[index.length - 1] = index_fetch() + 1; };

// ITERATE THROUGH INSTRUCTIONS
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

// INTERPRET WORD
function interpret_word(word, array) {
	if (word.length === 0) return;
	if (is_userFunctions(word)) return;
	if (is_userVocabulary(word, array)) return;
	if (is_forthVocabulary(word, array)) return;
	if (is_number(word)) return;
	init_error0(word);
};

function is_userFunctions(word) {
	const word_index = user_functions.findIndex(object => object.name === word);
	if (word_index >= 0) { user_functions[word_index].exec(); return true; };
	return false;
};

function is_userVocabulary(word) {		// check for capitalization
	const word_index = user_words.findIndex(object => object.name === word);
	if (word_index >= 0) { parse_array(user_words[word_index].content); return true; };
	return false;
};

function is_forthVocabulary(word, array) {
	const word_index = forth_words.findIndex(object => object.name === word.toUpperCase());
	if (word_index >= 0) { forth_words[word_index].exec(array); return true; };
	return false;
};

function is_number(word) {
	if (isNaN(word)) return false;
	stack.push(parseFloat(word)); return true;
};

const forth_words = [{
// STACK INSTRUCTIONS
	name: 'DUP',
	exec: function () {
		stack.push(stack[stack.length - 1]);
	}
}, {
	name: 'DROP',
	exec: function () {
		stack.pop();
	}
}, {
	name: 'SWAP',
	exec: function () {
		stack.splice(stack.length - 2, 0, stack.pop());
	}
}, {
	name: 'OVER',
	exec: function () {
		stack.push(stack.slice(stack.length - 2, stack.length - 1).pop());
	}
}, {
	name: 'ROT',
	exec: function () {
		stack.push(stack.splice(stack.length - 3, 1).pop());
	}
}, {
	name: '?DUP',
	exec: function () {
		if (stack[stack.length - 1] !== 0) stack.push(stack[stack.length - 1]);
	}
}, {
	name: '>R',
	exec: function () {
		return_stack.push(stack.pop());
	}
}, {
	name: 'R>',
	exec: function () {
		stack.push(return_stack.pop());
	}
}, {
	name: 'R@',
	exec: function () {
		stack.push(return_stack[return_stack.length - 1]);
	}
}, {
	name: '+',
	exec: function () {
		const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 + n2);
	}
}, {
	name: '-',
	exec: function () {
		const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 - n2);
	}
}, {
	name: '*',
	exec: function () {
		const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 * n2);
	}
}, {
	name: '/',
	exec: function () {
		const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 / n2);
	}
}, {
	name: '%',
	exec: function () {
		const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 % n2);
	}
}, {
	name: 'MAX',
	exec: function () {
		stack.push(Math.max(stack.pop(), stack.pop()));
	}
}, {
	name: 'MIN',
	exec: function () {
		stack.push(Math.min(stack.pop(), stack.pop()));
	}
}, {
	name: 'ABS',
	exec: function () {
		stack.push(Math.abs(stack.pop()));
	}
}, {
	name: 'MINUS',
	exec: function () {
		stack.push(-stack.pop());
	}
}, {
	name: 'AND',
	exec: function () {
		const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 && n2);
	}
}, {
	name: 'OR',
	exec: function () {
		const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 || n2);
	}
}, {
	name: 'XOR',
	exec: function () {
		const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 ^ n2);
	}
}, {
	name: '<',
	exec: function () {
		stack.push(stack.pop() > stack.pop());
	}
}, {
	name: '>',
	exec: function () {
		stack.push(stack.pop() < stack.pop());
	}
}, {
	name: '=',
	exec: function () {
		stack.push(stack.pop() == stack.pop());
	}
}, {
	name: '0<',
	exec: function () {
		stack.push(stack.pop() < 0);
	}
}, {
	name: '0=',
	exec: function () {
		stack.push(stack.pop() == 0);
	}
}, {
	name: '"', // => include some way to include space characters
	exec: function (array) {
		stack.push(array[index[index.length - 1] + 1]);
		index[index.length - 1] = index[index.length - 1] + 1;
	}
}, {
	name: 'S"',
	exec: function (array) {
		let i = index[index.length - 1] + 1;
		const string = [];
		for (i; i < array.length; i++) {
			if (array[i] === '"') break;
			string.push(array[i]);
		};
		if (i === array.length) i--;
		index[index.length - 1] = i;
		stack.push(string.join(' '));
	}
}, {
	name: '\\S',
	exec: function () {
		stack.push(' ');
	}
}, {
	name: 'NULL',
	exec: function () {
		stack.push(null);
	}
}, {
	name: 'UNDEFINED',
	exec: function () {
		stack.push(undefined);
	}
}, {
// INPUT OUTPUT INSTRUCTIONS
	name: '.',
	exec: function () {
		output_text[output_text.length - 1] += `${stack.pop()} `;
	}
}, {
	name: '.S',
	exec: function () { // does not account for displaying 'null' and 'undefined'
		output_text[output_text.length - 1] += `<${stack.length}> ${stack.join(', ')} `;
	}
}, {
	name: '.R',
	exec: function () {
		const count = stack.pop(); const string = [];
		for (let i = 0; i < count; i++) string.push(' ');
		output_text[output_text.length - 1] += `${string.join('')}${stack.pop()} `;
	}
}, {
	name: 'CR',
	exec: function () {
		output_text.push('');
	}
}, {
	name: 'SPACE',
	exec: function () {
		output_text[output_text.length - 1] += ' ';
	}
}, {
	name: 'SPACES',
	exec: function () {
		const count = stack.pop(); const string = [];
		for (let i = 0; i < count; i++) string.push(' ');
		output_text[output_text.length - 1] += string.join('');
	}
}, {
	name: 'PAGE',
	exec: function () {
		output_text = [];
	}
}, {
	name: '."',
	exec: function (array) {
		let i = index[index.length - 1] + 1; let string = [];
		for (i; i < array.length; i++) {
			if (array[i] === '"') break;
			string.push(array[i]);
		};
		if (i === array.length) i--;
		index[index.length - 1] = i;
		output_text[output_text.length - 1] += `${string.join(' ')} `;
	}
}, {
	name: 'DUMP',
	exec: function () {
		const [u, addr] = [stack.pop(), stack.pop()];
		for (let i = addr; i < addr + u; i++)
			output_text.push(`${i}: ${memory[i]} - ${typeof memory[i]}`);
		output_text.push('');
	}
}, {
	name: 'TYPE', // To test after memory instructions are added.
	exec: function () {
		const [u, addr] = [stack.pop(), stack.pop()]; const string = [];
		for (let i = addr; i < addr + u; i++)
			string.push(memory[i]);
		output_text[output_text.length - 1] = `${string.join('')} `;
	}
}, {
	name: 'ACCEPT',
	exec: function () {}
	// Read characters (until carriage-return) from input device to address.
}, {
// MEMORY AND DICTIONARY INSTRUCTIONS
	name: '@',
	exec: function () {
		stack.push(memory[stack.pop()]);
	}
}, {
	name: '!',
	exec: function () {
		memory[stack.pop()] = stack.pop();
	}
}, {
	name: '?',
	exec: function () {
		output_text[output_text.length - 1] += memory[stack.pop()];
	}
}, {
	name: '+!',
	exec: function () {
		memory[stack.pop()] += stack.pop();
	}
}, {
	name: 'MOVE',
	exec: function () {
		const [u, to, from] = [stack.pop(), stack.pop(), stack.pop()];
		memory.splice(to, u, ...memory.slice(from, from + u));
	}
}, {
	name: 'FILL',
	exec: function () {
		const [b, u, addr] = [stack.pop(), stack.pop(), stack.pop()];
		for (let i = addr; i < addr + u; i++) memory[i] = b;
	}
}, {
	name: 'ERASE',
	exec: function () {
		const [u, addr] = [stack.pop(), stack.pop()];
		for (let i = addr; i < addr + u; i++) memory[i] = undefined;
	}
}, {
	name: 'HERE', // ( u -- addr)
	exec: function () {
		const u = stack.pop();
		let index = 0; let count = 0; let addr = 0;
		while (index < memory.length) {
			if (typeof memory[index] === 'undefined') count++
			else { count = 0; addr = index + 1; };
			if (count === u) break; index++;
		};
		stack.push(addr);
	}
}, {
	name: 'ALLOT', // ( addr u -- )
	exec: function () {
		const [u, addr] = [stack.pop(), stack.pop()];
		for (let i = addr; i < addr + u; i++) memory[i] = null;
	}
}, {
	name: ',',
	exec: function () {
		// get data-space pointer then assign
		// pointer is assigned whenever a variable is called
	}
}, {
	name: 'FORGET',
	exec: function (array) {
		const i = index[index.length - 1] + 1; index[index.length - 1] = i;
		const word_index = user_words.findIndex(object => object.name === array[i])
		if (word_index >= 0) {
			user_words.splice(word_index, 1);
			output_text[output_text.length - 1] += `CLEARED ${array[i]} `;
		} else init_error0(array[i]);
	}
}, {
	name: 'FORGET!',
	exec: function (array) {
		user_words = [];
		output_text[output_text.length - 1] += `CLEARED ALL WORDS `;
	}
}, {
	name: 'WORDS',
	exec: function () {
		const string = [];
		forth_words.forEach(object => string.push(object.name));
		user_words.forEach(object => string.push(object.name));
		output_text.push(`${string.join(' ')} `);
	}
}, {
	name: 'SEE',
	exec: function () {
		// to expand...
	}
}, {
// DEFINING AND CONTROL STRUCTURE INSTRUCTIONS
	name: ':',
	exec: function (array) {
		let i = index[index.length - 1] + 1;
		const object = { name: array[i], content: [] };
		for (i += 1; i < array.length; i++) {
			if (array[i] === ';') break;
			object.content.push(array[i]);
		};
		if (i === array.length) return init_error1(';');
		index[index.length - 1] = i;
		const word_index = user_words.findIndex(word => word.name === object.name);
		if (word_index >= 0) {
			user_words.splice(word_index, 1);
			output_text[output_text.length - 1] += `REDEFINED ${object.name} `;
		};
		user_words.push(object);
	}
}, {
	name: 'VAR',
	exec: function (array) {
		const i = index[index.length - 1] + 1; index[index.length - 1] = i;
		if (i === array.length) return init_error2('VAR');
		let addr = 0; while (typeof memory[addr] !== 'undefined') addr++;
		memory[addr] = null;
		object = {name: array[i], content: [addr.toString()] };
		const var_index = user_words.findIndex(variable => variable.name === object.name);
		if (var_index >= 0) {
			user_words.splice(var_index, 1);
			output_text[output_text.length - 1] += `REDEFINED ${object.name} `;
		};
		user_words.push(object);
	}
}, {
	name: 'CONST',
	exec: function (array) {
		const i = index[index.length - 1] + 1; index[index.length - 1] = i;
		if (i === array.length) return init_error2('CONST');
		let addr = 0; while (typeof memory[addr] !== 'undefined') addr++;
		object = {name: array[i], content: [stack.pop().toString()] };
		const const_index = user_words.findIndex(constant => constant.name === object.name);
		if (const_index >= 0) {
			user_words.splice(const_index, 1);
			output_text[output_text.length - 1] += `REDEFINED ${object.name} `;
		};
		user_words.push(object);
	}
}, {
	name: 'FUNCTION',
	exec: function (array) { // To clean up!
		let i = index[index.length - 1];
		const content = [];
		while (array[i - 2] !== '--' && i < array.length) {
			content.push(array[i]); i++;
		};
		i = index[index.length - 1] + 1;
		const name = array[i]; i++;
		let string = [];
		while (array[i] !== ':-' && i < array.length) {
			string.push(array[i]); i++;
		}
		if (i === array.length) return init_error3();
		string = string.join(' ');
		const regex = []; i++;
		while (array[i] !== '--' && i < array.length) {
			regex.push(new RegExp(array[i])); i++;
		}
		if (i === array.length) return init_error3(); 
		regex.forEach(regex => string = string.replace(regex, 'stack.pop()'));
		i++;

		const output = array[i].toUpperCase();
		const object = { name: name, content: content.join(' ') };
		if (output === 'VOID') object.exec = function () { eval(string); }
		else if (output === 'ARRAY') object.exec = function () { eval(string).forEach(value => stack.push(value)); }
		else object.exec = function () { stack.push(eval(string)); }

		index[index.length - 1] = i;
		user_functions.push(object);
	}
}, {
	name: ':CODE',
	exec: function (array) {
		let i = index[index.length - 1] + 1;
		const string = [];
		for (i; i < array.length; i++) {
			if (array[i].toUpperCase() === ';CODE') break;
			string.push(array[i]);
		};
		if (i === array.length) return init_error1(';CODE');
		index[index.length - 1] = i;
		eval(string.join(' '));
	}
}, {
	name: 'DO',
	exec: function () {}
}];

function exec_instructions(array) {
/*
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
	if (word === 'STACK')	{ toggle_stack(); return; };
};

function reset_stack() {
	while (stack.length !== 0) stack.pop();
	while (return_stack.length !== 0) return_stack.pop();
	error = true;
};
function init_error0(word) {
	output_text.push(`UNDEFINED WORD`);
	output_text.push(`:= ${word} =:`);
	reset_stack();
};
function init_error1(word) {
	output_text.push(`NO CLOSING TAG`);
	output_text.push(`:= ${word} =:`)
	reset_stack();
};
function init_error2(word) {
	output_text.push(`ATTEMPT TO USE ZERO-LENGTH STRING AS A NAME`);
	output_text.push(`${word} >>><<<`);
	reset_stack();
};
function init_error3(word) {
	output_text.push(`INVALID FUNCTION SYNTAX`);
	reset_stack();
};
