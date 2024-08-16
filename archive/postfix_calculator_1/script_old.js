const input_html = document.getElementById('input');
const stack_html = document.getElementById('stack');
const output_html = document.getElementById('output');
const words_html = document.getElementById('words');

input_html.innerText = 'hello!';

input_html.addEventListener("keyup", on_enter);
function on_enter(event) {
	if (event.key === "Enter") input_submit();
	if (event.key === "Escape") log_read();
};

var stack = [];
var input = '';
var index = [];

function input_submit() {
	clean_input();
	read_input(input);
	update_stack();
	update_word();
	update_output();
	log_input();
	reset_log_index();
	clear_input();
};

function clean_input()		{ input = input_html.value.split(' ').filter(word => word !== ''); };
function update_stack()		{ stack_html.innerText = `Stack (${stack.length}): ${stack.join(', ')}`; };
function clear_input()		{ input_html.value = ''; };
function update_word() {
	words_html.innerText = `Words (${dictionary.length}):`;
	dictionary.forEach(word => words_html.innerText += `\n: ${word.name} ${word.content.join(' ')} ;`);
};

const input_log = [['']];
var log_index = input_log.length - 1;
function reset_log_index()	{ log_index = input_log.length - 1};
function log_input()		{ if (input.length !== 0) input_log.push(input.join(' ')); };
function log_read()		{ input_html.value = input_log[log_index]; log_index--; if (log_index === -1) reset_log_index(); };

const index_new		= () => index.push(0);
const index_drop	= () => index.pop();
const index_row		= () => index.length - 1;
const index_top		= () => index[index_row()];
const index_inc		= () => index[index_row()] = index_top() + 1;

let exit = false;
function read_input(input) {
	index_new();
	exit = false;
	while (index_top() !== input.length) {
		if (exit) break;
		exec_input(input);
		index_inc();
	};
	index_drop();
};

function exec_input(input) {
	const input_val = input[index_top()].toLowerCase();
	if (input_val === ':')					return init_word(input);
	if (input_val === '(')					return init_comment(input);
	if (input_val === 'begin')				return init_while(input);
	if (/^-{0,1}[0-9]+$/.test(input_val))			return stack_push(input_val);
	if (/^[+\-*\/]$|^\/{0,1}mod$/.test(input_val))		return stack_arithmetics(input_val);
	if (/^=$|^<>$|^<$|^>$|^<=$|^>=$/.test(input_val))	return stack_comparisons(input_val);
	if (/^dup$|^drop$|^swap$|^tuck$|^nip$|^rot$|^clearstack$/.test(input_val))
								return stack_manipulation(input_val);
	if (/^.s{0,1}$|^page$/.test(input_val))			return stack_output(input_val);
	if (/^while$|^repeat$/.test(input_val))			return ;
	if (!/^-{0,1}[0-9]+$/.test(input_val))			return run_word(input_val);
};

const dictionary = [];
var word = {};

function init_word(input) {
	const is_word = !/^[0-9]+$|^;$/.test(input[index_top() + 1]);
	let end_index = -1;
	for (let i = index_top(); i < input.length; i++) if (input[i] === ';') { end_index = i; break; };
	if (!is_word || end_index < 0) return error_0(index_top());
	index_inc(); word.name = input[index_top()];
	index_inc(); word.content = [];
	for (let i = index_top(); i < end_index; i++) word.content.push(input[i]);
	index[index_row()] = end_index;
	const word_index = dictionary.findIndex(index => index.name === word.name)
	if (word_index >= 0) dictionary.splice(word_index, 1);
	dictionary.push(word); word = {};
};

function init_while(input) {
	const begin_index = index_top();
	let repeat_index = -1;
	for (let i = begin_index; i < input.length; i++) if (input[i] === 'repeat') { repeat_index = i; break; };
	if (repeat_index < 0) return console.log(':e3:');
	let while_index = -1;
	for (let i = begin_index; i < input.length; i++) if (input[i] === 'while') { while_index = i; break; };
	if (while_index < 0) return console.log(':e4:');

	index_new();
	index[index_row()] = begin_index + 1;
	let is_while = true;
	while (is_while) {
		if (index_top() === while_index) if (stack.pop() === 0) is_while = false;
		if (index_top() === repeat_index) index[index_row()] = begin_index;
		exec_input(input);
		index_inc();
	};
	index_drop();
};

function init_comment(input) {
	let end_index = -1;
	for (let i = index_top(); i < input.length; i++) if (input[i] === ')') { end_index = i; break; };
	if (end_index < 0) return error_2();
	index[index_row()] = end_index;
};

function stack_push(input_val) { stack.push(parseInt(input_val)); };

function stack_arithmetics(input_val) {
	if (input_val === '+')		return stack_add();
	if (input_val === '-')		return stack_min();
	if (input_val === '*')		return stack_mul();
	if (input_val === '/')		return stack_div();
	if (input_val === 'mod')	return stack_mod();
	if (input_val === '/mod')	return stack_dim();
};

function stack_add()	{ const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 + n2); };
function stack_min()	{ const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 - n2); };
function stack_mul()	{ const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 * n2); };
function stack_div()	{ const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(Math.floor(n1 / n2)); };
function stack_mod()	{ const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 % n2); };
function stack_dim()	{ const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(Math.floor(n1 / n2)); stack.push(n1 % n2); };

function stack_comparisons(input_val) {
	if (input_val === '=')		return stack_eq();
	if (input_val === '<>')		return stack_ne();
	if (input_val === '<')		return stack_lt();
	if (input_val === '>')		return stack_gt();
	if (input_val === '<=')		return stack_le();
	if (input_val === '>=')		return stack_ge();
};

function stack_eq()	{ const [n2, n1] = [stack.pop(), stack.pop()]; if (n1 === n2)	return stack.push(-1); return stack.push(0); };
function stack_ne()	{ const [n2, n1] = [stack.pop(), stack.pop()]; if (n1 !== n2)	return stack.push(-1); return stack.push(0); };
function stack_lt()	{ const [n2, n1] = [stack.pop(), stack.pop()]; if (n1 < n2)	return stack.push(-1); return stack.push(0); };
function stack_gt()	{ const [n2, n1] = [stack.pop(), stack.pop()]; if (n1 > n2)	return stack.push(-1); return stack.push(0); };
function stack_le()	{ const [n2, n1] = [stack.pop(), stack.pop()]; if (n1 <= n2)	return stack.push(-1); return stack.push(0); };
function stack_ge()	{ const [n2, n1] = [stack.pop(), stack.pop()]; if (n1 >= n2)	return stack.push(-1); return stack.push(0); };

function stack_manipulation(input_val) {
	if (input_val === 'dup')	return stack_dup();
	if (input_val === 'drop')	return stack_drop();
	if (input_val === 'swap')	return stack_swap();
	if (input_val === 'tuck')	return stack_tuck();
	if (input_val === 'nip')	return stack_nip();
	if (input_val === 'rot')	return stack_rot();
	if (input_val === 'clearstack')	return stack_clear();
};

function stack_dup()	{ stack.push(stack[stack.length - 1]); };
function stack_drop()	{ stack.pop(); };
function stack_swap()	{ stack.push(stack.splice(stack.length - 2, 1)); };
function stack_tuck()	{ stack_swap(); stack.push(stack[stack.length - 2]); };
function stack_nip()	{ stack_swap(); stack_drop(); };
function stack_rot()	{ stack.push(stack.splice(stack.length - 3, 1)); };
function stack_clear()	{ stack = []; };

function stack_output(input_val) {
	if (input_val === '.')		return print_top();
	if (input_val === '.s')		return print_stack();
	if (input_val === 'page')	return print_clear();
};

let print_count = 0;
let output_string = '';
function print_top()	{ print_count++; output_string += `${stack.pop()} ` };
function print_stack()	{ print_count++; output_string += `<${stack.length}> ${stack.join(' ')} ` };
function update_output() { if (print_count > 0) { print_count = 0; output_html.innerText += `\n${output_string}`; output_string = ''; }; };
function print_clear()	{ output_html.innerText = `Output:`};

function run_word(input_val) {
	const word_index = dictionary.findIndex(index => index.name === input_val);
	if (word_index < 0) return error_1();
	const input = dictionary[word_index].content;
	read_input(input);
};

function error_0()	{ print_count++; output_string += `:E0: Colon syntax error	@${index_top()}\n> ${input.join(' ')}`; exit = true; };
function error_1()	{ print_count++; output_string += `:E1: Undefined word		@${index_top()}\n> ${input.join(' ')}`; exit = true; };
function error_2()	{ print_count++; output_string += `:E2: Unclosed comment	@${index_top()}\n> ${input.join(' ')}`; exit = true; };
