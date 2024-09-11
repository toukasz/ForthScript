const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const rl = readline.createInterface({ input, output });

rl.prompt()
rl.on('line', (chunk) => {
	parse(filter(chunk))
	rl.prompt()
});

function filter(chunk) {
	return chunk
		.toString()
		.split(/[ \t\n]/)
		.filter(word => word != '')
}

const pc = {
	stack:	[],
	push:	nu => pc.stack.push(nu),
	pop:	() => pc.stack.pop(),
	fetch:	() => pc.stack.at(-1),
	inc:	nu => pc.push(pc.pop() + nu),
	write:	nu => pc.stack.splice(-1, 1, nu)
}

function parse(chunk) {
	pc.push(0)
	while (pc.fetch() != chunk.length) {	
		const word = chunk.at(pc.fetch())
		read(word, chunk)
		if (pc.fetch() == -1) break
		pc.inc(1)
	}
	if (pc.stack.length == 1) process.stdout.write(' ok\n')
	pc.pop()
}

function read(word, chunk) {
	let i;

	// ?jump
	if (jump) return jump = (word == 'then') ? false : true

	// ?macro
	i = macro.findIndex(obj => obj.name == word)
	if (i != -1) return parse(macro[i].chunk);

	// ?primitive
	i = words.findIndex(obj => obj.name == word)
	if (i != -1) return words[i].exec(chunk)

	// ?number
	const int = /^-{0,1}[0-9]+$/
	if (int.test(word)) return stack.push(parseInt(word))

	// !word
	pc.write(-1)
	console.log(`${word} is not a word`)
}

const stack = []
const r = { stack: [] }
const address = Array(2**14).fill(0);
const macro = []

let jump = false;

function define(chunk) {
}

const words = [{
// JUMP
	name: ':',
	exec: chunk => {
		const a = pc.fetch() + 2
		const b = chunk.findIndex(word => word == ';')
		if (b == -1) return pc.write(-1)
		const name = chunk.at(pc.fetch() + 1)
		const i = macro.findIndex(obj => obj.name == name)
		if (i != -1) macro.splice(i, 1)
		macro.push({
			name: name,
			chunk: chunk.slice(a, b)
		})
		pc.write(b)
	}
}, {
	name: '#',
	exec: () => pc.write(-1)
}, {
	name: 'if',
	exec: () => jump = (stack.pop() != 0) ? true : false
}, {
	name: '-if',
	exec: () => jump = (stack.pop() >= 0) ? true : false
}, {
	name: 'then',
	exec: () => {}
}, {
// MEMORY
	name: '@',
	exec: () => stack.push(address.at(stack.pop()))
}, {
	name: '!',
	exec: () => address[stack.pop()] = stack.pop()
}, {
// ALU
	name: '2*',
	exec: () => stack.push(stack.pop() << 1)
}, {
	name: '2/',
	exec: () => stack.push(stack.pop() >> 1)
}, {
	name: '+',
	exec: () => stack.push(stack.pop() + stack.pop())
}, {
	name: '~',
	exec: () => stack.push(~stack.pop())
}, {
	name: '&',
	exec: () => stack.push(stack.pop() & stack.pop())
}, {
	name: '^',
	exec: () => stack.push(stack.pop() ^ stack.pop())
}, {
// STACK
	name: 'drop',
	exec: () => stack.pop()
}, {
	name: 'dup',
	exec: () => stack.push(stack.at(-1))
}, {
	name: 'over',
	exec: () => stack.push(stack.at(-2))
}, {
	name: 'nop',
	exec: () => {}
}, {
	name: '>r',
	exec: () => r.stack.push(stack.pop())
}, {
	name: 'r>',
	exec: () => stack.push(r.stack.pop())
}, {
// NON-COLORFORTH ADDITIONS
	name: 'emit',
	exec: () => process.stdout.write
		(String.fromCharCode(stack.pop()))
}, {
	name: '.',
	exec: () => process.stdout.write(`${stack.pop()} `)

}, {
	name: '.s',
	exec: () => console.log(stack)
}, {
	name: 'bye',
	exec: () => process.exit()
}]
