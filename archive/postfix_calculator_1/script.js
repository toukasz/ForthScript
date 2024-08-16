// loops
// functions do type-check
// memory addresses
// pixel display

const input_html = document.getElementById('input');

const stack = [];
const index = [];
const words = [];
const functions = [];
const memory = Array.from(Array(10), item => item = null);

input_html.addEventListener("keyup", on_enter);
function on_enter(event) {
	if (event.key === "Enter")	input_submit(input_html.value);
	if (event.key === "Escape")	console.log('Look for previous inputs');
};

function input_submit(input_string) {
	const input_array = input_clean(input_string);
	input_read(input_array);

	console.log(`stack: ${stack}`);
	console.log(`functions: ${functions}`);
	console.log(`words: ${words}`);
};

function input_clean() { return input_html.value.split(' ').filter(word => word !== ''); };

function input_read(input_array) {
	index.push(0);
	while (index[index.length - 1] < input_array.length) {
		input_exec(input_array[index[index.length - 1]], input_array);
		index[index.length - 1] = index[index.length - 1] + 1;
	};
	index.pop();
};

const stack_mani = ['dup', 'drop', 'swap', 'tuck', 'nip', 'rot', 'clearstack'];
const math_op =	['+', '-', '*', '/', '%', '**', '==', '!=', '===', '!==', '<', '>', '<=', '>='];
const math_cond = ['true', 'false'];
const memory_mani = ['create', '@', '!', 'here', 'unused', 'allot'];

function input_exec(input_word, input_array) {
	if (is_word(input_word))		return exec_word();
	if (!isNaN(input_word))			return stack.push(parseFloat(input_word));
	if (stack_mani.includes(input_word))	return exec_mani(input_word);
	if (math_op.includes(input_word))	return exec_math(input_word, input_array);
	if (input_word === 'function')		return init_function(input_array);
	if (is_function(input_word))		return exec_function();
	if (input_word === 'value')		return init_value(input_array);
	if (is_value(input_word))		return exec_value();
	if (input_word === '"')			return init_string(input_array);
	if (input_word === ':')			return init_word(input_array);
	if (input_word === '(')			return init_comment(input_array);
	if (input_word === 'if')		return exec_if(input_array);
	if (math_cond.includes(input_word))	return push_condition(input_word);
	if (input_word === 'begin')		return simple_loops(input_array);
	if (memory_mani.includes(input_word))	return init_memory(input_word, input_array);

	return console.log(input_word + ' word not defined');
};

function is_word(input_word) {
	const word_index = words.findIndex(object => object.name === input_word);
	if (word_index === -1) { return false; }
	else { words.push(word_index); return true; };
};

function exec_word() {
	const word = words[words.pop()];
	index.push(0);
	while (index[index.length - 1] < word.content.length) {
		input_exec(word.content[index[index.length - 1]], word.content);
		index[index.length - 1] = index[index.length - 1] + 1;
	};
	index.pop();
};

function exec_mani(input_word) { switch (input_word) {
	case 'dup':		stack.push(stack[stack.length - 1]);							return ;
	case 'drop':		stack.pop();										return ;
	case 'swap':		stack.push(stack.splice(stack.length - 2, 1));						return ;
	case 'tuck':		stack.push(stack.splice(stack.length - 2, 1)); stack.push(stack[stack.length - 2]);	return ;
	case 'nip':		stack.push(stack.splice(stack.length - 2, 1)); stack.pop();				return ;
	case 'rot':		stack.push(stack.splice(stack.length - 3, 1));						return ;
	case 'clearstack':	while (stack.length !== 0) stack.pop();							return ;
}; };

function exec_math(input_word, input_array) {
	const [n2, n1] = [stack.pop(), stack.pop()];
	stack.push(eval(`${n1} ${input_word} ${n2}`));
};

function init_function (input_array) {
	let i = index[index.length - 1] + 1;
	const object = {};
	object.jname  = input_array[i]; i++;
	object.fname  = input_array[i]; i++;
	object.input  = [];
	object.output = [];
	while (input_array[i] !== '--') { object.input.push(input_array[i]);  i++; }; i++;
	if (input_array[i] !== 'void') object.output.push(input_array[i]);
	index[index.length - 1] = i;

	const j = functions.findIndex(item => item.fname === object.fname);
	if (j !== -1) functions.splice(j, 1, object);
	else functions.push(object);
};

function is_function(input_word) {
	const i = functions.findIndex(object => object.fname === input_word);
	if (i !== -1) return functions.push(i);
};

function exec_function() {
	const object = functions[functions.pop()];
	const args = [];
	for (let n = 0; n < object.input.length; n++) args.push(stack.pop());
	let function_string = `${object.jname}(${args.reverse().join()});`;
	if (object.output.length === 0) eval(function_string)
	else stack.push(eval(function_string));
};

const values = [];
function init_value(input_array) {
	const i = index[index.length - 1] + 1;
	const value_index = values.findIndex(object => object.name === input_array[i]);
	if (value_index >= 0) values.splice(value_index, 1);
	const object = {};
	object.name = input_array[i];
	object.value = stack.pop();
	values.push(object);
	index[index.length - 1] = i;
};

function is_value(input_word) {
	const value_index = values.findIndex(object => object.name === input_word);
	if (value_index === -1) return false;
	values.push(value_index); return true;
};

function exec_value() {
	const value_index = values.pop();
	stack.push(values[value_index].value);
};

function init_string(input_array) {
	let i = index[index.length - 1] + 1;
	const string = [];
	while (input_array[i] !== '"') { string.push(input_array[i]); i++; };
	index[index.length - 1] = i;
	stack.push(`"${string.join(' ')}"`);	// remove " " so exec_function can do explicit type checking
};

function init_word(input_array) {
	let i = index[index.length - 1] + 1;
	const word_index = words.findIndex(object => object.name === input_array[i]);
	if (word_index >= 0) words.splice(word_index, 1);
	const word = {};
	word.name = input_array[i]; i++;
	word.content = [];
	while (input_array[i] !== ';') {
		if (i >= input_array.length) break;
		word.content.push(input_array[i]); i++;
	};
	index[index.length - 1] = i;
	words.push(word);
};

function init_comment(input_array) {
	let i = index[index.length - 1] + 1;
	while (input_array[i] !== ')') i++;
	index[index.length - 1] = i;
};

function exec_if(input_array) {
	let i = index[index.length - 1] + 1;
	let [else_index, then_index] = [-1, -1];
	const [if_statement, else_statement] = [[], []];
	for (i; i < input_array.length; i++) {
		if (input_array[i] === 'else') { else_index = i; };
		if (input_array[i] === 'then') { then_index = i; break; };
	};
	if (else_index === -1) else_index = then_index;
	i = index[index.length -1] + 1;
	for (i; i < else_index; i++) if_statement.push(input_array[i]); i++;
	for (i; i < then_index; i++) else_statement.push(input_array[i]);
	index[index.length - 1] = i;

	const condition = stack.pop();
	if (condition) {
		index.push(0);
		while (index[index.length - 1] < if_statement.length) {
			input_exec(if_statement[index[index.length - 1]], if_statement);
			index[index.length - 1] = index[index.length - 1] + 1;
		};
		index.pop();
	} else {
		index.push(0);
		while (index[index.length - 1] < else_statement.length) {
			input_exec(else_statement[index[index.length - 1]], else_statement);
			index[index.length - 1] = index[index.length - 1] + 1;
		};
		index.pop();
	};
};

function push_condition(input_word) { switch (input_word) {
	case ('true'):	stack.push(true);  break;
	case ('false'):	stack.push(false); break;
}; };

function simple_loops(input_array) {
	let i = index[index.length - 1] + 1;
	const loop_end = ['repeat', 'until', 'again'];
	let loop_type = '';
	while (true) { if (loop_end.includes(input_array[i])) { loop_type = input_array[i]; break; }; i++; };
	const loop_end_index = i; const loop_case = []; i = index[index.length - 1] + 1;
	while (i < loop_end_index) { loop_case.push(input_array[i]); i++ }
	index[index.length - 1] = i;
	switch (loop_type) {
		case 'repeat':	loop_repeat(loop_case);	break;
		case 'until':	loop_until(loop_case);	break;
		case 'again':	loop_again(loop_case);	break;
	};
};

function loop_repeat(loop_case) {
	index.push(0)
	while (index[index.length - 1] <= loop_case.length) {
		if (loop_case[index[index.length - 1]] === 'while') {
			if (!stack.pop()) { break; }
			else index[index.length - 1] = index[index.length - 1] + 1;
		};
		if (index[index.length - 1] === loop_case.length) {
			index[index.length - 1] = 0;
		};
		input_exec(loop_case[index[index.length - 1]], loop_case);
		index[index.length - 1] = index[index.length - 1] + 1;
	};
	index.pop();
};

function loop_until(loop_case) {
	index.push(0)
	while (index[index.length - 1] <= loop_case.length) {
		if (index[index.length - 1] === loop_case.length) {
			if (stack.pop()) index[index.length - 1] = 0
			else break;
		};
		input_exec(loop_case[index[index.length - 1]], loop_case);
		index[index.length - 1] = index[index.length - 1] + 1;
	};
	index.pop()
};

function loop_again(loop_case) {
	index.push(0)
	while (index[index.length - 1] <= loop_case.length) {
		if (index[index.length - 1] === loop_case.length) index[index.length - 1] = 0;
		input_exec(loop_case[index[index.length - 1]], loop_case);
		index[index.length - 1] = index[index.length - 1] + 1;
	};
	index.pop()
};

function init_memory(input_word, input_array) { switch (input_word) {
	case 'create':	memory_create(input_array);	break;
	case '@':	memory_fetch();			break;
	case '!':	memory_assign();		break;
	case 'here':	memory_here();			break;
	case 'unused':	memory_unused();		break;
	case 'allot':	memory_allot();			break;
}; };

function memory_create(input_array) {};
function memory_fetch() {};
function memory_assign() {};

function memory_here() {	// ( -- addr ) return address of next free location in data space
	let i = 0; while (i < memory.length) { if (memory[i] === null) break; i++; };
	if (i === memory.length) { stack.push(-1) } else stack.push(i);
};

function memory_unused() {
	let count = 0; let i = 0; while (i < memory.length) { if (memory[i] === null) count++; i++; };
	stack.push(count);
};
function memory_allot() {};
