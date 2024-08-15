const input_html = document.getElementById('input');
const stack_html = document.getElementById('stack');
const output_html = document.getElementById('output');
const words_html = document.getElementById('words');

input_html.addEventListener("keyup", on_enter);
function on_enter(event) { if (event.key === "Enter") input_submit(); };

var stack = [];

var input;
var index;

function input_submit() {
	clean_input();
	read_input();
	update_stack();
};

function clean_input() {
	input = input_html.value;
	input = input.split(' ');
	input = input.filter(word => word !== '');
};

let exit = false;
function read_input() {
	index = 0; exit = false;
	while (index !== input.length) {
		if (exit) break;
		exec_input();
		index++;
	};
};

function update_stack()	{ stack_html.innerText = `Stack (${stack.length}): ${stack.join(', ')}`; };

function exec_input() {
	if (input[index] === ':') return check_word();
	if (/^-{0,1}[0-9]+$/.test(input[index])) return stack_push();
	if (/^[+\-*\/]|mod$/.test(input[index])) return stack_arithmetics();
};

const dictionary = [];
var word = {};

function check_word() {
	const is_word = !/^[0-9]|;+$/.test(input[index + 1]);
	const end_index = input.findIndex(index => index === ';');
	if (!is_word || end_index < 0) return syntax_error();
	index++; word.name = input[index];
	index++; word.content = [];
	for (let i = index; i < end_index; i++) word.content.push(input[i]);
	index = end_index;
	const word_index = dictionary.findIndex(index => index.name === word.name)
	if (word_index >= 0) dictionary.splice(word_index, 1);
	dictionary.push(word); word = {};
};

function syntax_error() {
	alert("Error Code: 0");
	exit = true;
};


function stack_arithmetics() {
	if (input[index] === '+')	return stack_add();
	if (input[index] === '-')	return stack_min();
	if (input[index] === '*')	return stack_mul();
	if (input[index] === '/')	return stack_div();
	if (input[index] === 'mod')	return stack_mod();
	if (input[index] === '/mod')	return stack_dim();
};

function stack_push()	{ stack.push(parseInt(input[index])); };
function stack_add()	{ stack.push(stack.pop() + stack.pop()); };
function stack_min()	{ stack.push(-stack.pop() + stack.pop()); };
function stack_mul()	{ stack.push(stack.pop() * stack.pop()); };
function stack_div()	{ stack.push(Math.floor(1 / stack.pop() * stack.pop())); };
function stack_mod()	{ const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(n1 % n2); };
function stack_dim()	{ const [n2, n1] = [stack.pop(), stack.pop()]; stack.push(Math.floor(n1 / n2)); stack.push(n1 % n2); };
