const code = {}
try     { code.ext = require('fs').readFileSync('ext.fs', 'utf8') }
catch   { code.ext = '' }
try     { code.src = require('fs').readFileSync('src.fs', 'utf8') }
catch   { code.src = '' }

const readline = require('readline').createInterface({
    input:  process.stdin,
    output: process.stdout
})

const pc = {
    push:   nu => r.stack.push(nu),
    pop:    () => r.stack.pop(),
    fetch:  () => r.stack.at(-1),
    inc:    nu => pc.push(pc.pop() + nu),
    write:  nu => r.stack.splice(-1, 1, nu)
}

const r	= { stack: [] }
const d = { stack: [] }
const addr = Array(2**14).fill(0)
let A = 0
let B = 0

function filter(chunk) {
    return chunk
        .split(/[ \t\n]/)
        .filter(word => word != '')
}

function parse(chunk) {
    pc.push(0)
    while (pc.fetch() < chunk.length) {
        if (pc.fetch() < 0) break
        read(chunk.at(pc.fetch()), chunk)
        if (err.exit) return
        pc.inc(1)
    }
    pc.pop()
    ok()
}

function ok() {
    if (r.stack.length != 0) return
    process.stdout.write(` ok\n`)
}

const err = { exit: false }
err.exec = (msg, chunk) => {
    // message
    console.log(msg)
    // backtrace
    chunk[pc.fetch()] = `>>>${chunk[pc.fetch()]}<<<`
    console.log(chunk.join(' '))
    // reset -> include reset address??
    d.stack = []; r.stack = []; A = 0; B = 0
    err.exit = true
}

function read(word, chunk) {
	let i
	// ?word
	i = dict.findIndex(obj => obj.name == word)
	if (i != -1) return parse(dict[i].chunk)
	// ?primitive
	i = ops.findIndex(obj => obj.name == word)
	if (i != -1) return ops[i].exec(chunk)
	// ?number
	const nu = /^-{0,1}[0-9]+$/
	if (nu.test(word)) return d.stack.push(parseInt(word))
	// !word
	err.exec(`Undefined word`, chunk)
}

const dict = []
const ops = [{
// Transfer of Program Control
	name: ':',
	exec: chunk => {
		const a = pc.fetch() + 2
		const b = chunk.slice(a).findIndex(word => word == ';')
		if (b == -1) return err.exec(`No closing tag ';'`, chunk)
		const name = chunk.at(pc.fetch() + 1)
		const i = dict.findIndex(obj => obj.name == name)
		if (i != -1) dict.splice(i, 1)
		dict.push({ name: name, chunk: chunk.slice(a, a + b) })
		pc.write(a + b)
	}
}, {
    name: '->',
    exec: chunk => {
        const a = pc.fetch()
        const b = chunk.slice(a).findIndex(word => word == '>!')
        if (b == -1) return pc.write(-2)
        pc.write(a + b)
    }
}, {
    name: '>!',
    exec: () => {}
}, {
    name: '<-',
    exec: chunk => {
        const a = pc.fetch()
        const b = chunk.slice(0, a).reverse().findIndex(word => word == '!<')
        if (b == -1) return pc.write(-1)
        pc.write(a - b - 1)
    }
}, {
    name: '!<',
    exec: () => {}
}, {
	name: 'if',
	exec: chunk => {
		if (d.stack.at(-1) == 0) return
		const a = pc.fetch() + 1
		const b = chunk.slice(a).findIndex(word => word == 'then')
		if (b == -1) return pc.write(-2)
		pc.write(a + b)
	}
}, {
	name: '-if',
	exec: chunk => {
		if (d.stack.at(-1) < 0) return
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
	name: '@b',
	exec: () => d.stack.push(addr.at(B))
}, {
	name: '@+',
	exec: () => { d.stack.push(addr.at(A)), A++ }
}, {
	name: '@',
	exec: () => d.stack.push(addr.at(A))
}, {
	name: '!b',
	exec: chunk => {
        const T = d.stack.pop()
        if (typeof T == 'undefined') return err.exec('Stack underflow', chunk)
        addr[B] = d.stack.pop()
    }
}, {
	name: '!+',
	exec: chunk => {
        const T = d.stack.pop()
        if (typeof T == 'undefined') return err.exec('Stack underflow', chunk)
        addr[A] = d.stack.pop(), A++
    }
}, {
	name: '!',
	exec: chunk => {
        const T = d.stack.pop()
        if (typeof T == 'undefined') return err.exec('Stack underflow', chunk)
        addr[A] = d.stack.pop()
    }
}, {
// ALU
    name: '+*',
    exec: () => {
        const [T, S] = [d.stack.length - 1, d.stack.length - 2]
        if (A & 1 != 0) d.stack[T] += d.stack.at(S)
        d.stack[S] <<= 1; A >>= 1
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
// Stack
	name: 'drop',
	exec: chunk => {
        if (d.stack.length == 0) return err.exec('Stack underflow', chunk)
        d.stack.pop()
    }
}, {
	name: 'dup',
	exec: () => d.stack.push(d.stack.at(-1))
}, {
	name: 'over',
	exec: () => d.stack.push(d.stack.at(-2))
}, {
	name: '>r',
	exec: () => r.stack.splice(-1, 0, d.stack.pop())
}, {
	name: 'r>',
	exec: () => d.stack.push(...r.stack.splice(-2, 1))
}, {
	name: 'nop',
	exec: () => {}
}, {
// Register
	name: 'p',
	exec: () => d.stack.push(pc.fetch())
}, {
	name: 'a',
	exec: () => d.stack.push(A)
}, {
	name: 'p!',
	exec: () =>	pc.write(d.stack.pop())
}, {
	name: 'a!',
	exec: () => A = d.stack.pop()
}, {
	name: 'b!',
	exec: () => B = d.stack.pop()
}, {
// Miscellaneous
    name: '.n',
    exec: chunk => {
        const T = d.stack.pop()
        if (typeof T == 'undefined') return err.exec('Stack underflow', chunk)
        process.stdout.write(T.toString())
    }
}, {
    name: '.c',
    exec: chunk => {
        const T = d.stack.pop()
        if (typeof T == 'undefined') return err.exec('Stack underflow', chunk)
        process.stdout.write(String.fromCharCode(d.stack.pop()))
    }
}, {
	name: '(',
	exec: chunk => pc.write(pc.fetch() + chunk.slice(pc.fetch()).findIndex(word => word == ')'))
}, {
	name: 'bye',
	exec: () => process.exit()
}]

// IO
parse(filter(code.ext))
parse(filter(code.src))

readline.prompt()
readline.on('line', chunk => {
    err.exit = false
    parse(filter(chunk))
    readline.prompt()
})
