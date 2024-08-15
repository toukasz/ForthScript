const input = document.getElementById('input');
const stack_visual = document.getElementById('stack');
const output_visual = document.getElementById('output');
const words_visual = document.getElementById('words');

const words = [];
var stack = [];

input.onkeydown = function (e) {
	if (e.keyCode == 13) input_parse(); 
};

const input_parse = function () {
	const instructions = input.value.split(' ');
	input_split(instructions);
	stack_print();
	input_clear();
};

var is_word = false;
const input_split = function (instructions) {
	while (instructions.length !== 0) {
		const instruction = instructions.shift();
		if (instruction === ':') is_word = true;
		if (is_word) content.push(instruction)
		else input_instruction(instruction);
		if (instruction === ';') {
			is_word = false;
			init_content();
		};
	};
};

var word = {};
var content = [];
const init_content = function () {
	content.pop();
	content.shift();
	word.name = content.shift();
	word.content = content;
	const is_present = index => index.name === word.name;
	const present_index = words.findIndex(is_present);
	if (present_index >= 0) words.splice(present_index, 1);
	words.push(word);
	word = {};
	content = [];
	words_print();
};

const words_print = function () {
	words_visual.innerText = `Words (${words.length}):`;
	words.forEach(word => {
		const word_content = word.content.join(' ');
		words_visual.innerText += `\n: ${word.name} ${word_content} ;`;
	});
};

const stack_print = function () {
	const stack_string = stack.join(', ');
	const stack_length = stack.length;
	stack_visual.innerText = `Stack (${stack_length}): ${stack_string}`;
};

const input_clear = function () {
	input.value = '';
};

const input_instruction = function (instruction) {
	const value = instruction;
	const type = input_typecheck(instruction);
	input_compute(value, type);
};

const input_typecheck = function (instruction) {
	// Numbers
	const num = /^-{0,1}[0-9]+$/.test(instruction);
	if (num) return 'num';

	// Math
	const add = /^\+$/.test(instruction);
	if (add) return 'add';
	const sub = /^\-$/.test(instruction);
	if (sub) return 'sub';
	const mul = /^\*$/.test(instruction);
	if (mul) return 'mul';
	const div = /^\/$/.test(instruction);
	if (div) return 'div';
	const mod = /^mod$/.test(instruction);
	if (mod) return 'mod';
	const divmod = /^\/mod$/.test(instruction);
	if (divmod) return '/mod';

	// Stack Manipulation
	const dup = /^dup$/.test(instruction);
	if (dup) return 'dup';
	const drop = /^drop$/.test(instruction);
	if (drop) return 'drop';
	const swap = /^swap$/.test(instruction);
	if (swap) return 'swap';
	const tuck = /^tuck$/.test(instruction);
	if (tuck) return 'tuck';
	const nip = /^nip$/.test(instruction);
	if (nip) return 'nip';
	const rot = /^rot$/.test(instruction);
	if (rot) return 'rot';

	const clearstack = /^clearstack$/.test(instruction);
	if (clearstack) return 'clearstack';

	// Output
	const dropshow = /^.$/.test(instruction);
	if (dropshow) return '.';
	const showstack = /^.s$/.test(instruction);
	if (showstack) return '.s';	
	const clearoutput = /^page$/.test(instruction);
	if (clearoutput) return 'page';

	// Word
	const word = /^\w+$/.test(instruction);
	if (word) return 'word';
};

const input_compute = function (value, type) {
	switch (type) {
		// Numbers
		case 'num':
		stack_push(value);
		break;
		// Words
		case 'word':
		word_run(value);
		break;
		// Math
		case 'add':
		stack_add();
		break;
		case 'sub':
		stack_sub();
		break;
		case 'mul':
		stack_mul();
		break;
		case 'div':
		stack_div();
		break;
		case 'mod':
		stack_mod();
		break;
		case '/mod':
		stack_divmod();
		break;
		case '.':
		output_dropshow();
		break;
		case '.s':
		output_showstack();
		break;
		// Stack Manipulation
		case 'dup':
		stack_dup();
		break;
		case 'drop':
		stack_drop();
		break;
		case 'swap':
		stack_swap();
		break;
		case 'tuck':
		stack_tuck();
		break;
		case 'nip':
		stack_nip();
		break;
		case 'rot':
		stack_rot();
		break;
		// Output
		case 'clearstack':
		stack_clear();
		break;
		case 'page':
		output_clear();
		break;
	};
};

// Numbers
const stack_push = function (value) {
	stack.push(parseInt(value));
};

// Words
const word_run = function (value) {
	const word = words.find(index => index.name === value);
	if (typeof word !== 'undefined') input_split([...word.content]);
};

// Math
const stack_add = function () {
	const n1 = stack.pop();
	const n2 = stack.pop();
	const result = n2 + n1;
	stack.push(result);
};
const stack_sub = function () {
	const n1 = stack.pop();
	const n2 = stack.pop();
	const result = n2 - n1;
	stack.push(result);
};
const stack_mul = function () {
	const n1 = stack.pop();
	const n2 = stack.pop();
	const result = n2 * n1;
	stack.push(result);
};
const stack_div = function () {
	const n1 = stack.pop();
	const n2 = stack.pop();
	const result = Math.floor(n2 / n1);
	stack.push(result);
};
const stack_mod = function () {
	const n1 = stack.pop();
	const n2 = stack.pop();
	const result = n2 % n1;
	stack.push(result);
};
const stack_divmod = function () {
	const n1 = stack.pop();
	const n2 = stack.pop();
	const div = Math.floor(n2 / n1);
	const mod = n2 % n1;
	stack.push(div);
	stack.push(mod);
};

// Stack Manipulation
const stack_dup = function () {
	const i = stack.length - 1;
	stack.push(stack[i]);
};
const stack_drop = function () {
	stack.pop();
};
const stack_swap = function () {
	const i = stack.length - 1;
	[stack[i - 1], stack[i]] =
	[stack[i], stack[i - 1]];
};
const stack_tuck = function () {
	stack_swap();
	const i = stack.length - 1;
	stack.push(stack[i - 1]);
};
const stack_nip = function () {
	stack_swap();
	stack_drop();
};
const stack_rot = function () {
	const i = stack.length - 1;
	[stack[i - 2], stack[i - 1], stack[i]] =
	[stack[i - 1], stack[i], stack[i - 2]];
};

// Output
var count = 0;
const output_dropshow = function () {
	const dropshow = stack.pop();
	output_visual.innerText += `\n(${count}) ${dropshow}`;
	count++;
};
const output_showstack = function () {
	const stack_string = stack.join(', ');
	output_visual.innerText += `\n(${count}) ${stack_string}`;
	count++;
};
const stack_clear = function () {
	stack = [];
};
const output_clear = function () {
	output_visual.innerText = `Output: `;
};
