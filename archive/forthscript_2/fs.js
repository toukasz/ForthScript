const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.prompt()
rl.on('line', chunk => {
	parse(filter(chunk))
})

function filter(chunk) {
	return chunk
		.split(/[ \t\n]/)
		.filter(word => word != '')
}

function ok() {
	if (r.stack.length != 0) return
	process.stdout.write(` ok\n`)
}

const pc = {
	push:	nu => r.stack.push(nu),
	pop:	() => r.stack.pop(),
	fetch:	() => r.stack.at(-1),
	inc:	nu => pc.push(pc.pop() + nu),
	write:	nu => r.stack.splice(-1, 1, nu)
}

const r	= { stack: [] }
const d = { stack: [] }
const addr = Array(2**14).fill(0)
let A = 0
let B = 0

function parse(chunk) {
	pc.push(0)
	while (pc.fetch() < chunk.length) {
		if (pc.fetch() < 0) break
		const word = chunk.at(pc.fetch())
		read(word, chunk)
		pc.inc(1)
	}
	pc.pop()
	ok()
}

function read(word, chunk) {
	let i;

	// ?word
	i = words.findIndex(obj => obj.name == word)
	if (i != -1) return parse(words[i].chunk)

	// ?primitive
	i = ops.findIndex(obj => obj.name == word)
	if (i != -1) return ops[i].exec(chunk)

	// ?number
	const int = /^-{0,1}[0-9]+$/
	if (int.test(word)) return d.stack.push(parseInt(word))

	// !word
	pc.write(-2)
	process.stdout.write(`>>>${word}<<< is not a word `)
}

const words = []
const ops = [{
// Transfer of Program Control
	name: ':',
	exec: chunk => {
		const a = pc.fetch() + 2
		const b = chunk.slice(a).findIndex(word => word == ';')
		if (b == -1) return pc.write(-2)
		const name = chunk.at(pc.fetch() + 1)
		const i = words.findIndex(obj => obj.name == name)
		if (i != -1) words.splice(i, 1)
		words.push({
			name: name,
			chunk: chunk.slice(a, a + b)
		})
		pc.write(a + b)
	}
}, {
    name: '->',
    exec: () => pc.write(-2)
}, {
    name: '<-',
    exec: () => pc.write(-1)
}, {
	name: 'unext',
	exec: chunk => {
		const i = r.stack.at(-2)
		if (i == 0) return r.stack.splice(-2, 1)
		r.stack.splice(-2, 1, i - 1)
		pc.write(-1)
	}
}, {
	name: 'next',
	exec: chunk => {
		const i = r.stack.at(-2)
		if (i == 0) return r.stack.splice(-3, 2)
		r.stack.splice(-2, 1, i - 1)
		pc.write(r.stack.at(-3))
	}
}, {
	name: 'if',
	exec: chunk => {
		if (d.stack.pop() == 0) return
		const a = pc.fetch() + 1
		const b = chunk.slice(a).findIndex(word => word == 'then')
		if (b == -1) return pc.write(-2)
		pc.write(a + b)
	}
}, {
	name: '-if',
	exec: chunk => {
		if (d.stack.pop() < 0) return
		const a = pc.fetch() + 1
		const b = chunk.slice(a).findIndex(word => word == 'then')
		if (b == -1) return pc.write(-2)
		pc.write(a + b)
	}
}, {
	name: 'then',
	exec: () => {}
}, {
// Memory Read and Write
	name: '@p',
	exec: () => d.stack.push(pc.fetch())
}, {
	name: '@+',
	exec: () => { d.stack.push(addr.at(A)), a++ }
}, {
	name: '@b',
	exec: () => {}
}, {
	name: '@',
	exec: () => d.stack.push(addr.at(A))
}, {
	name: '!p',
	exec: () =>	pc.write(d.stack.pop())
}, {
	name: '!+',
	exec: () => { addr[a] = d.stack.pop(), a++ }
}, {
	name: '!b',
	exec: () => {}
}, {
	name: '!',
	exec: () => addr[a] = d.stack.pop()
}, {
// Arithmetic, Logic and Register Manipulation
    name: '+*',
    exec: () => {
        const [T, S] = [d.stack.length - 1, d.stack.length - 2]
        if (A & 1 != 0) d.stack[T] += d.stack.at(S)
        A >>= 1; d.stack[S] <<= 1
    }
}, {
	name: '2*',
	exec: () => d.stack.push(d.stack.pop() << 1)
}, {
	name: '2/',
	exec: () => d.stack.push(d.stack.pop() >> 1)
}, {
	name: 'inv',
	exec: () => d.stack.push(~d.stack.pop())
}, {
	name: '+',
	exec: () => d.stack.push(d.stack.pop() + d.stack.pop())
}, {
	name: 'and',
	exec: () => d.stack.push(d.stack.pop() & d.stack.pop())
}, {
	name: 'xor',
	exec: () => d.stack.push(d.stack.pop() ^ d.stack.pop())
}, {
	name: 'drop',
	exec: () => d.stack.pop()
}, {
	name: 'dup',
	exec: () => d.stack.push(d.stack.at(-1))
}, {
	name: 'r>',
	exec: () => d.stack.push(...r.stack.splice(-2, 1))
}, {
	name: 'over',
	exec: () => d.stack.push(d.stack.at(-2))
}, {
	name: 'a',
	exec: () => d.stack.push(A)
}, {
	name: 'nop',
	exec: () => {}
}, {
	name: '>r',
	exec: () => r.stack.splice(-1, 0, d.stack.pop())
}, {
	name: 'b!',
	exec: () => B = d.stack.pop()
}, {
	name: 'a!',
	exec: () => A = d.stack.pop()
}, {
// NON-COLORFORTH ADDITIONS
	name: '(',
	exec: chunk => pc.write(pc.fetch() + chunk.slice(pc.fetch()).findIndex(word => word == ')'))
}, {
	name: '.',
	exec: () => process.stdout.write(`${d.stack.pop()} `)
}, {
	name: '.s',
	exec: () => process.stdout.write(`<${d.stack.length}> ${d.stack.join(', ')} `)
}, {
    name: 'cr',
    exec: () => process.stdout.write(`\n`)
}, {
	name: 'bye',
	exec: () => process.exit()
}];

// Extension
parse(filter(`

: swap over >r >r drop r> r> ;
: rot >r swap r> swap ;
: -rot rot rot ;
: r r> r> dup >r swap >r ;
: for r> dup >r swap >r >r ;
: -> -2 r> drop >r ;
: <- -1 r> drop >r ;

: ?odd dup 1 and if . -> then drop ;
: loop dup -if drop -> then dup ?odd -1 + <- ;

: here r> dup >r -1 + ;
: * a! 0 a if 9 !p then +* 1 !p swap drop ;
( check for case where both values are negative! )
23 37 * .s

`))
